import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';

interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: string;
}

const NotificationWidget: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      
      // Set up WebSocket connection for real-time notifications
      const wsProtocol = globalThis.location?.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = globalThis.location?.hostname === 'localhost' ? 'localhost:8816' : globalThis.location?.host;
      const wsUrl = `${wsProtocol}//${wsHost}?userId=${user.id}`;
      
      console.log(`Attempting WebSocket connection for user ${user.id} at ${wsUrl}`);
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log(`WebSocket connected for notifications - User: ${user.id}`);
      };
      
      ws.onmessage = (event) => {
        try {
          console.log(`WebSocket message received for user ${user.id}:`, event.data);
          const data = JSON.parse(event.data);
          if (data.type === 'notification') {
            console.log(`Processing notification:`, data.data);
            // Add new notification to the top of the list
            setNotifications(prev => {
              const newNotification = {
                _id: String(data.data._id),
                userId: data.data.userId,
                title: data.data.title,
                message: data.data.message,
                type: data.data.type,
                read: data.data.read,
                createdAt: data.data.createdAt
              };
              
              // Avoid duplicates by checking if notification already exists
              const exists = prev.some(n => n._id === newNotification._id);
              if (exists) {
                console.log(`Duplicate notification ignored: ${newNotification._id}`);
                return prev;
              }
              
              console.log(`New notification added: ${newNotification.title}`);
              return [newNotification, ...prev.slice(0, 9)]; // Keep only latest 10
            });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log(`WebSocket disconnected for user ${user.id}`);
      };
      
      ws.onerror = (error) => {
        console.error(`WebSocket error for user ${user.id}:`, error);
      };
      
      // Refresh notifications when user returns to tab (fallback)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          fetchNotifications();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        ws.close();
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [user?.id]);

  const getApiBaseUrl = () => {
    try {
      const loc = globalThis.location;
      const protocol = loc.protocol || 'http:';
      const hostname = loc.hostname || 'localhost';
      const port = loc.port || '';
      if (port === '5173') return `${protocol}//${hostname}:8816`;
      return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    } catch (_) {
      return 'http://localhost:8816';
    }
  };

  const fetchNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const API_BASE_URL = getApiBaseUrl();
      const response = await fetch(`${API_BASE_URL}/api/notifications/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      const data = await response.json();
      setNotifications(data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const API_BASE_URL = getApiBaseUrl();
      await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ read: true })
      });
      
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayNotifications = notifications.slice(0, expanded ? 10 : 3);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'announcement': return 'A';
      case 'payment_reminder': return 'P';
      case 'maintenance_update': return 'M';
      case 'lease_renewal': return 'L';
      default: return 'N';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const notificationTime = new Date(dateString);
    const diffMs = now.getTime() - notificationTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  if (!user || user.userType === 'admin') return null;

  return (
    <div style={{ marginTop: '16px', padding: '0 16px' }}>
      <div 
        style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #e9ecef',
          borderRadius: '12px',
          padding: '16px',
          maxWidth: '100%'
        }}
      >
        <div 
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            cursor: 'pointer'
          }}
          onClick={() => setExpanded(!expanded)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#007bff',
                color: 'white',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              N
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span 
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  minWidth: '18px',
                  textAlign: 'center'
                }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fetchNotifications();
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                color: '#6c757d',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e9ecef';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              title="Refresh notifications"
            >
              🔄
            </button>
            <span 
              style={{
                fontSize: '18px',
                color: '#6c757d',
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}
            >
              ▼
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
            Loading notifications...
          </div>
        ) : displayNotifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
            No notifications yet
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {displayNotifications.map((notification) => (
              <div
                key={notification._id}
                style={{
                  backgroundColor: notification.read ? '#ffffff' : '#e3f2fd',
                  border: `1px solid ${notification.read ? '#dee2e6' : '#90caf9'}`,
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => !notification.read && markAsRead(notification._id)}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div 
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: 
                        notification.type === 'announcement' ? '#007bff' :
                        notification.type === 'payment_reminder' ? '#ffc107' :
                        notification.type === 'maintenance_update' ? '#28a745' :
                        '#6c757d',
                      flexShrink: 0
                    }}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: '14px',
                        fontWeight: notification.read ? '500' : '600',
                        color: notification.read ? '#495057' : '#1976d2',
                        lineHeight: '1.3'
                      }}
                    >
                      {notification.title}
                    </h4>
                    <p 
                      style={{
                        margin: '0 0 6px 0',
                        fontSize: '12px',
                        color: '#6c757d',
                        lineHeight: '1.4',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}
                    >
                      {notification.message}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#868e96' }}>
                        {formatTimeAgo(notification.createdAt)}
                      </span>
                      {!notification.read && (
                        <div 
                          style={{
                            width: '6px',
                            height: '6px',
                            backgroundColor: '#007bff',
                            borderRadius: '50%'
                          }}
                        ></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {notifications.length > 3 && (
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'none',
                border: 'none',
                color: '#007bff',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px'
              }}
            >
              {expanded ? 'Show Less' : `View All (${notifications.length})`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationWidget;