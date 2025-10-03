import { useState, useEffect, useCallback } from 'react';
import { offlineStorage } from '../services/offline.ts';

interface UseOfflineOptions {
  enableAutoSync?: boolean;
  syncInterval?: number;
}

interface UseOfflineReturn {
  isOnline: boolean;
  pendingSyncCount: number;
  storeOfflineData: (type: string, data: Record<string, unknown>) => Promise<string>;
  syncNow: () => Promise<void>;
  isSyncing: boolean;
  clearOfflineData: () => Promise<void>;
}

export const useOffline = (options: UseOfflineOptions = {}): UseOfflineReturn => {
  const { enableAutoSync = true, syncInterval = 30000 } = options;
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const updateOnlineStatus = useCallback(() => {
    setIsOnline(navigator.onLine);
  }, []);

  const updatePendingCount = useCallback(async () => {
    try {
      const count = await offlineStorage.getPendingSyncCount();
      setPendingSyncCount(count);
    } catch (error) {
      console.error('Error getting pending sync count:', error);
    }
  }, []);

  const storeOfflineData = useCallback(async (type: string, data: Record<string, unknown>): Promise<string> => {
    try {
      const id = await offlineStorage.storeOfflineData(type, data);
      await updatePendingCount();
      return id;
    } catch (error) {
      console.error('Error storing offline data:', error);
      throw error;
    }
  }, [updatePendingCount]);

  const syncNow = useCallback(async (): Promise<void> => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    try {
      await offlineStorage.syncPendingData();
      await updatePendingCount();
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, updatePendingCount]);

  const clearOfflineData = useCallback(async (): Promise<void> => {
    try {
      await offlineStorage.clearAllOfflineData();
      await updatePendingCount();
    } catch (error) {
      console.error('Error clearing offline data:', error);
      throw error;
    }
  }, [updatePendingCount]);

  useEffect(() => {
    // Initialize offline storage
    const initialize = async () => {
      try {
        await offlineStorage.initDB();
        if (enableAutoSync) {
          offlineStorage.startAutoSync();
        }
        await updatePendingCount();
      } catch (error) {
        console.error('Error initializing offline storage:', error);
      }
    };

    initialize();

    // Listen for online/offline events
    globalThis.addEventListener('online', updateOnlineStatus);
    globalThis.addEventListener('offline', updateOnlineStatus);

    // Periodic updates
    const interval = setInterval(() => {
      updatePendingCount();
      if (enableAutoSync && isOnline && !isSyncing) {
        syncNow().catch(console.error);
      }
    }, syncInterval);

    return () => {
      globalThis.removeEventListener('online', updateOnlineStatus);
      globalThis.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, [updateOnlineStatus, updatePendingCount, enableAutoSync, syncInterval, isOnline, isSyncing, syncNow]);

  return {
    isOnline,
    pendingSyncCount,
    storeOfflineData,
    syncNow,
    isSyncing,
    clearOfflineData
  };
};

// Utility function to handle API calls with offline fallback
export const apiWithOfflineFallback = async (
  apiCall: () => Promise<Response>,
  offlineData: Record<string, unknown>,
  offlineType: string
): Promise<{ success: boolean; offline?: boolean; message?: string } | Record<string, unknown>> => {
  try {
    if (!navigator.onLine) {
      // Store offline and return optimistic response
      await offlineStorage.storeOfflineData(offlineType, offlineData);
      return { success: true, offline: true, message: 'Saved offline, will sync when online' };
    }

    const response = await apiCall();
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // If online but API failed, store offline as fallback
    if (navigator.onLine) {
      console.warn('API call failed, storing offline:', error);
      await offlineStorage.storeOfflineData(offlineType, offlineData);
      return { success: true, offline: true, message: 'API unavailable, saved offline' };
    }
    
    throw error;
  }
};