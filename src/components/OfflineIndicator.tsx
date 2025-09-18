import React, { useState, useEffect } from 'react';
import { offlineStorage } from '../services/offline.ts';

interface OfflineIndicatorProps {
  className?: string;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSync, setPendingSync] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
      updatePendingCount();
    };

    const updatePendingCount = async () => {
      try {
        const count = await offlineStorage.getPendingSyncCount();
        setPendingSync(count);
      } catch (error) {
        console.error('Error getting pending sync count:', error);
      }
    };

    // Initialize offline storage
    const initializeOfflineStorage = async () => {
      try {
        await offlineStorage.initDB();
        offlineStorage.startAutoSync();
        updatePendingCount();
      } catch (error) {
        console.error('Error initializing offline storage:', error);
      }
    };

    initializeOfflineStorage();

    // Listen for online/offline events
    globalThis.addEventListener('online', updateOnlineStatus);
    globalThis.addEventListener('offline', updateOnlineStatus);

    // Update pending count periodically
    const interval = setInterval(updatePendingCount, 5000);

    return () => {
      globalThis.removeEventListener('online', updateOnlineStatus);
      globalThis.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) return;
    
    setIsSyncing(true);
    try {
      await offlineStorage.syncPendingData();
      const count = await offlineStorage.getPendingSyncCount();
      setPendingSync(count);
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  if (isOnline && pendingSync === 0) {
    return null; // Don't show anything when online and no pending data
  }

  return (
    <div className={`fixed top-4 right-4 z-40 ${className}`}>
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium shadow-lg ${
        isOnline 
          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
          : 'bg-red-100 text-red-800 border border-red-200'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-red-500'
        }`}></div>
        
        <span>
          {isOnline ? 'Online' : 'Offline'}
        </span>
        
        {pendingSync > 0 && (
          <>
            <span>•</span>
            <span>{pendingSync} pending sync</span>
            {isOnline && (
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
              >
                {isSyncing ? 'Syncing...' : 'Sync now'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;