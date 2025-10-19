import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.tsx';
import Icon from './Icon.tsx';

interface NotificationItem {
  id: string;
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
  const wsRef = React.useRef<WebSocket | null>(null);
  const userIdRef = React.useRef<string | null>(null);

  // Separate effect for WebSocket connection - runs only when user.id changes
  useEffect(() => {
    if (!user?.id) return;
    
    // Don't reconnect if it's the same user and connection is good
    if (userIdRef.current === user.id && 
        wsRef.current?.readyState === WebSocket.OPEN) {
      console.log(`[NotificationWidget] ✅ WebSocket already connected for user ${user.id}, skipping reconnection`);
      return;
    }
    
    // Close existing connection if switching users or connection is dead
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      console.log('[NotificationWidget] Closing previous WebSocket connection');
      wsRef.current.close();
    }
    
    userIdRef.current = user.id;
    
    // Set up WebSocket connection for real-time notifications
    const wsProtocol = globalThis.location?.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = globalThis.location?.hostname === 'localhost' ? 'localhost:8816' : globalThis.location?.host;
    const wsUrl = `${wsProtocol}//${wsHost}?userId=${user.id}`;
    
    console.log(`[NotificationWidget] 🔌 Connecting WebSocket for user ${user.id}`);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log(`[NotificationWidget] ✅ WebSocket CONNECTED for user ${user.id} (readyState: ${ws.readyState})`);
    };
    
    ws.onmessage = (event) => {
      try {
        console.log(`[NotificationWidget] 📨 Message received:`, event.data);
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          console.log(`[NotificationWidget] Processing notification:`, data.data);
          
          // Check if this is an announcement deletion notification
          if (data.data.type === 'announcement_deleted') {
            console.log(`[NotificationWidget] Announcement deleted: ${data.data.originalTitle}`);
            setNotifications(prev => {
              const filtered = prev.filter(n => 
                !(n.type === 'announcement' && n.title.includes(data.data.originalTitle))
              );
              if (filtered.length !== prev.length) {
                console.log(`[NotificationWidget] Removed ${prev.length - filtered.length} related notifications`);
              }
              return filtered;
            });
            return;
          }
          
          // Add new notification
          setNotifications(prev => {
            const newNotification = {
              id: String(data.data.id || data.data._id),
              userId: data.data.userId,
              title: data.data.title,
              message: data.data.message,
              type: data.data.type,
              read: data.data.read,
              createdAt: data.data.createdAt
            };
            
            const exists = prev.some(n => n.id === newNotification.id);
            if (exists) {
              console.log(`[NotificationWidget] Duplicate ignored: ${newNotification.id}`);
              return prev;
            }
            
            console.log(`[NotificationWidget] ➕ New notification: ${newNotification.title}`);
            return [newNotification, ...prev.slice(0, 9)];
          });
        }
      } catch (error) {
        console.error('[NotificationWidget] Error parsing WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      console.log(`[NotificationWidget] ❌ WebSocket DISCONNECTED for user ${user.id}`);
    };
    
    ws.onerror = (error) => {
      console.error(`[NotificationWidget] ⚠️ WebSocket ERROR for user ${user.id}:`, error);
    };
    
    // Cleanup only on unmount or user change
    return () => {
      // Add a small delay to handle React StrictMode double-mounting in dev
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          console.log(`[NotificationWidget] 🧹 Closing WebSocket for user ${user.id}`);
          ws.close();
        }
      }, 100);
    };
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

  // Keep track of notifications we know are deleted (ghost notifications)
  // Load from localStorage to persist across page reloads
  const [deletedNotificationIds, setDeletedNotificationIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('deletedNotificationIds');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const fetchNotifications = React.useCallback(async () => {
    if (!user?.id) {
      console.warn('Cannot fetch notifications: user.id is undefined');
      return;
    }
    
    try {
      setLoading(true);
      const API_BASE_URL = getApiBaseUrl();
      console.log(`Fetching notifications for user ${user.id} from ${API_BASE_URL}/api/notifications/${user.id}`);
      const response = await fetch(`${API_BASE_URL}/api/notifications/${user.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch notifications: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      console.log('Fetched notifications raw data:', data);
      
      // Filter out notifications we know are deleted (ghost notifications)
      const filteredData = data.filter(notification => 
        !deletedNotificationIds.has(notification.id)
      );
      
      if (filteredData.length !== data.length) {
        console.log(`Filtered out ${data.length - filteredData.length} known ghost notifications`);
      }
      
      setNotifications(filteredData.slice(0, 10));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, deletedNotificationIds]);

  // Fetch notifications when user changes
  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id, fetchNotifications]);

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
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the read action
    
    console.log('Delete notification called for ID:', notificationId);
    
    try {
      const API_BASE_URL = getApiBaseUrl();
      
      // Delete the notification from the server
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Successfully deleted from database - remove from UI and mark as deleted
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        setDeletedNotificationIds(prev => {
          const newSet = new Set([...prev, notificationId]);
          localStorage.setItem('deletedNotificationIds', JSON.stringify([...newSet]));
          return newSet;
        });
        console.log('Notification deleted successfully from database and UI');
      } else if (response.status === 404) {
        // Notification doesn't exist in database (404 Not Found) - it's a ghost
        // Remove from UI anyway since it's not in the database and mark as deleted
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        setDeletedNotificationIds(prev => {
          const newSet = new Set([...prev, notificationId]);
          localStorage.setItem('deletedNotificationIds', JSON.stringify([...newSet]));
          return newSet;
        });
        console.log('Ghost notification removed from UI (was not in database)');
      } else if (response.status === 500) {
        // Server error - don't mark as deleted, just show error
        console.error('Server error deleting notification - not marking as ghost');
        throw new Error(`Server error deleting notification: ${response.status}`);
      } else {
        throw new Error(`Failed to delete notification: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      // For network errors, don't remove from UI - let user try again
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;
  const displayNotifications = expanded ? notifications.slice(0, 10) : notifications.slice(0, 3);
  
  console.log('NotificationWidget render:', { 
    total: notifications.length, 
    unread: unreadCount, 
    expanded, 
    displaying: displayNotifications.length 
  });

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
          onClick={() => {
            console.log('Header clicked, toggling expanded from', expanded, 'to', !expanded);
            setExpanded(!expanded);
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div 
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#007bff',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Icon name="notifications" alt="Notifications" size={16} />
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
              <Icon name="refresh" size={16} />
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
                key={notification.id}
                style={{
                  backgroundColor: notification.read ? '#ffffff' : '#e3f2fd',
                  border: `1px solid ${notification.read ? '#dee2e6' : '#90caf9'}`,
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => !notification.read && markAsRead(notification.id)}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={(e) => deleteNotification(notification.id, e)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            color: '#dc3545',
                            padding: '2px 4px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.7,
                            transition: 'opacity 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '1';
                            e.currentTarget.style.backgroundColor = '#f8d7da';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '0.7';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Delete notification"
                        >
                          <Icon name="trash" size={20} />
                        </button>
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