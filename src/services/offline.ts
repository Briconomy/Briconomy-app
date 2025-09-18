interface OfflineData {
  id: string;
  type: 'maintenance_request' | 'payment_proof' | 'chat_message' | 'announcement_read';
  data: any;
  timestamp: Date;
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
}

export class OfflineStorageService {
  private static instance: OfflineStorageService;
  private readonly dbName = 'BriconomyOfflineDB';
  private readonly version = 1;
  private db: IDBDatabase | null = null;

  static getInstance(): OfflineStorageService {
    if (!OfflineStorageService.instance) {
      OfflineStorageService.instance = new OfflineStorageService();
    }
    return OfflineStorageService.instance;
  }

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create offline data store
        if (!db.objectStoreNames.contains('offlineData')) {
          const store = db.createObjectStore('offlineData', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('syncStatus', 'syncStatus', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async storeOfflineData(type: string, data: any): Promise<string> {
    if (!this.db) await this.initDB();

    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineData: OfflineData = {
      id,
      type: type as any,
      data,
      timestamp: new Date(),
      syncStatus: 'pending',
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.add(offlineData);

      request.onsuccess = () => {
        console.log(`Stored offline data: ${id}`);
        resolve(id);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingData(): Promise<OfflineData[]> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const index = store.index('syncStatus');
      const request = index.getAll('pending');

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateSyncStatus(id: string, status: 'pending' | 'syncing' | 'synced' | 'failed'): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.syncStatus = status;
          if (status === 'failed') {
            data.retryCount = (data.retryCount || 0) + 1;
          }
          
          const updateRequest = store.put(data);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Data not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteOfflineData(id: string): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async syncPendingData(): Promise<void> {
    if (!navigator.onLine) {
      console.log('Device is offline, skipping sync');
      return;
    }

    try {
      const pendingData = await this.getPendingData();
      console.log(`Found ${pendingData.length} items to sync`);

      for (const item of pendingData) {
        if (item.retryCount >= 3) {
          console.warn(`Skipping item ${item.id} - too many retry attempts`);
          continue;
        }

        try {
          await this.updateSyncStatus(item.id, 'syncing');
          await this.syncSingleItem(item);
          await this.updateSyncStatus(item.id, 'synced');
          
          // Clean up synced data after successful sync
          setTimeout(() => this.deleteOfflineData(item.id), 1000);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          await this.updateSyncStatus(item.id, 'failed');
        }
      }
    } catch (error) {
      console.error('Error during sync process:', error);
    }
  }

  private async syncSingleItem(item: OfflineData): Promise<void> {
    const { type, data } = item;

    switch (type) {
      case 'maintenance_request':
        await this.syncMaintenanceRequest(data);
        break;
      case 'payment_proof':
        await this.syncPaymentProof(data);
        break;
      case 'chat_message':
        await this.syncChatMessage(data);
        break;
      case 'announcement_read':
        await this.syncAnnouncementRead(data);
        break;
      default:
        throw new Error(`Unknown sync type: ${type}`);
    }
  }

  private async syncMaintenanceRequest(data: any): Promise<void> {
    const response = await fetch('/api/maintenance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to sync maintenance request');
    }
  }

  private async syncPaymentProof(data: any): Promise<void> {
    const response = await fetch('/api/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to sync payment proof');
    }
  }

  private async syncChatMessage(data: any): Promise<void> {
    const response = await fetch('/api/chat-messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error('Failed to sync chat message');
    }
  }

  private async syncAnnouncementRead(data: any): Promise<void> {
    const response = await fetch(`/api/announcements/${data.announcementId}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: data.userId })
    });

    if (!response.ok) {
      throw new Error('Failed to sync announcement read status');
    }
  }

  // Check if device is online and start sync
  startAutoSync(): void {
    // Sync when coming back online
    window.addEventListener('online', () => {
      console.log('Device came online, starting sync...');
      this.syncPendingData();
    });

    // Periodic sync when online
    setInterval(() => {
      if (navigator.onLine) {
        this.syncPendingData();
      }
    }, 30000); // Every 30 seconds
  }

  // Get offline status
  isOnline(): boolean {
    return navigator.onLine;
  }

  // Get pending sync count
  async getPendingSyncCount(): Promise<number> {
    const pendingData = await this.getPendingData();
    return pendingData.length;
  }

  // Clear all offline data
  async clearAllOfflineData(): Promise<void> {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const request = store.clear();

      request.onsuccess = () => {
        console.log('All offline data cleared');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const offlineStorage = OfflineStorageService.getInstance();