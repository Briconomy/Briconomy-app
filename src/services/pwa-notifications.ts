// PWA Push Notification Utility

export class PWANotificationService {
  private static instance: PWANotificationService;

  static getInstance(): PWANotificationService {
    if (!PWANotificationService.instance) {
      PWANotificationService.instance = new PWANotificationService();
    }
    return PWANotificationService.instance;
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  // Check if notifications are enabled
  isEnabled(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<PushSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        console.log('Already subscribed to push notifications');
        return existingSubscription;
      }

      // Subscribe to push notifications
      // Note: In production, you'd need a VAPID public key from your push service
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // Replace with your actual VAPID public key
          'BEl62iUYgUivxIkv69yViEuiBIa-Ib37J8vpgF7vzr5xH-G6C_6z6FZwnSzK5_h3G6MQq2v3dRxLd5KvPWI3zcs'
        )
      });

      console.log('Subscribed to push notifications:', subscription);
      
      // TODO: Send subscription to your server
      // await fetch('/api/push-subscribe', {
      //   method: 'POST',
      //   body: JSON.stringify(subscription),
      //   headers: { 'Content-Type': 'application/json' }
      // });

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        console.log('Unsubscribed from push notifications');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  // Show a local notification (doesn't require push)
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    const permission = await this.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options
      });
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  // Helper function to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = globalThis.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Send test notification
  async sendTestNotification(): Promise<void> {
    await this.showNotification('Briconomy Test Notification', {
      body: 'Push notifications are working!',
      tag: 'test',
      requireInteraction: false,
      data: { url: '/' }
    });
  }
}

// Export singleton instance
export const pwaNotifications = PWANotificationService.getInstance();
