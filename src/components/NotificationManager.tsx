import { useState, useEffect } from 'react';
import { notificationService } from '../services/notifications.ts';

const NotificationManager = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        setIsVisible(true);
      }
    }
  };

  const requestPermission = async () => {
    const newPermission = await notificationService.requestPermission();
    setPermission(newPermission);
    setIsVisible(false);
  };

  const dismissBanner = () => {
    setIsVisible(false);
  };

  if (!isVisible || permission === 'granted' || permission === 'denied') {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 p-4 z-50 shadow-lg" style={{ background: 'var(--brand-notifications)' }}>
      <div className="container mx-auto flex items-center justify-between text-white">
        <div className="flex items-center space-x-3">
          <span className="text-xl">🔔</span>
          <div>
            <p className="font-semibold">Enable Notifications</p>
            <p className="text-sm opacity-90">
              Get real-time updates for rent reminders, maintenance, and important announcements
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button type="button"
            onClick={requestPermission}
            className="btn btn-secondary px-4 py-2 rounded font-semibold"
          >
            Enable
          </button>
          <button type="button"
            onClick={dismissBanner}
            className="text-white hover:text-gray-200 p-2"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationManager;