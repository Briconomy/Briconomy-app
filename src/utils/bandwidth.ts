import { useState, useEffect } from 'react';

export const useLowBandwidthMode = () => {
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);
  const [connectionType, setConnectionType] = useState('unknown');

  useEffect(() => {
    const checkConnection = () => {
      const nav = navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean; addEventListener?: (t: string, fn: () => void) => void; removeEventListener?: (t: string, fn: () => void) => void } };
      const connection = nav.connection;
      
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
    
  const nav = navigator as Navigator & { connection?: { addEventListener?: (t: string, fn: () => void) => void; removeEventListener?: (t: string, fn: () => void) => void } };
  const connection = nav.connection;
    if (connection) {
      connection.addEventListener('change', checkConnection);
    }

  globalThis.addEventListener('online', checkConnection);
  globalThis.addEventListener('offline', checkConnection);

    return () => {
      if (connection) {
        connection.removeEventListener('change', checkConnection);
      }
  globalThis.removeEventListener('online', checkConnection);
  globalThis.removeEventListener('offline', checkConnection);
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

export const useDataCaching = <T,>(cacheKey: string, fetchData: () => Promise<T>, cacheTime: number = 300000) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

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

  const freshData: T = await fetchData();
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

export const debounce = <A extends unknown[]>(func: (...args: A) => void, wait: number) => {
  let timeout: number | undefined;
  return (...args: A) => {
    const later = () => {
      if (timeout !== undefined) clearTimeout(timeout);
      func(...args);
    };
    if (timeout !== undefined) clearTimeout(timeout);
    timeout = setTimeout(later, wait) as unknown as number;
  };
};

export const throttle = <A extends unknown[]>(func: (...args: A) => void, limit: number) => {
  let inThrottle = false;
  return (...args: A) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
};