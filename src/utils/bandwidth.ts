import { useState, useEffect } from 'react';

export const useLowBandwidthMode = () => {
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const checkConnection = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      if (connection) {
        setConnectionType(connection.effectiveType || 'unknown');
        setLowBandwidthMode(
          connection.saveData || 
          connection.effectiveType === 'slow-2g' || 
          connection.effectiveType === '2g'
        );
      }

      setLowBandwidthMode(navigator.onLine === false);
    };

    checkConnection();
    
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', checkConnection);
    }

    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);

    return () => {
      if (connection) {
        connection.removeEventListener('change', checkConnection);
      }
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', checkConnection);
    };
  }, []);

  return { lowBandwidthMode, connectionType };
};

export const useImageOptimization = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const optimizeImage = (src: string, lowBandwidth: boolean = false) => {
    if (lowBandwidth) {
      return `${src}?lowbandwidth=true&quality=60`;
    }
    return src;
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return {
    imageLoaded,
    imageError,
    optimizeImage,
    handleImageLoad,
    handleImageError
  };
};

export const useDataCaching = (cacheKey: string, fetchData: () => Promise<any>, cacheTime: number = 300000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const cached = localStorage.getItem(`cache_${cacheKey}`);
        const cachedTime = localStorage.getItem(`cache_${cacheKey}_time`);

        if (cached && cachedTime) {
          const isExpired = Date.now() - parseInt(cachedTime) > cacheTime;
          if (!isExpired) {
            setData(JSON.parse(cached));
            setLoading(false);
            return;
          }
        }

        const freshData = await fetchData();
        setData(freshData);
        
        localStorage.setItem(`cache_${cacheKey}`, JSON.stringify(freshData));
        localStorage.setItem(`cache_${cacheKey}_time`, Date.now().toString());
      } catch (err) {
        setError(err);
        const cached = localStorage.getItem(`cache_${cacheKey}`);
        if (cached) {
          setData(JSON.parse(cached));
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [cacheKey, fetchData, cacheTime]);

  const clearCache = () => {
    localStorage.removeItem(`cache_${cacheKey}`);
    localStorage.removeItem(`cache_${cacheKey}_time`);
  };

  return { data, loading, error, clearCache };
};

export const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function executedFunction(...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};