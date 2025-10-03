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

  const deleteNotification = async (notificationId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the read action
    
    console.log('Delete notification called for ID:', notificationId);
    console.log('Current notifications before delete:', notifications.map(n => ({ id: n._id, title: n.title })));
    
    // Find the notification to check if it's an announcement
    const notification = notifications.find(n => n._id === notificationId);
    if (!notification) {
      console.error('Notification not found for ID:', notificationId);
      return;
    }
    
    console.log('Found notification to delete:', { id: notification._id, title: notification.title, type: notification.type });
    
    // For announcement notifications, ask for confirmation since it will delete the announcement permanently
    if (notification.type === 'announcement') {
      if (!confirm('This will permanently delete this announcement for all users. Are you sure?')) {
        return;
      }
    }
    
    try {
      const API_BASE_URL = getApiBaseUrl();
      
      // First, delete the notification
      const notificationResponse = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
      });
      
      if (!notificationResponse.ok) throw new Error('Failed to delete notification');
      
      // If it's an announcement notification, also delete the original announcement
      if (notification.type === 'announcement') {
        console.log('Deleting announcement notification, attempting to delete source announcement');
        
        // Try to delete by content matching since we don't have the announcement ID
        try {
          const deleteAnnouncementResponse = await fetch(`${API_BASE_URL}/api/announcements/delete-by-content`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: notification.title,
              message: notification.message,
              createdBy: notification.userId // This might not match exactly, but worth trying
            })
          });
          
          if (deleteAnnouncementResponse.ok) {
            console.log('Successfully deleted source announcement');
          } else {
            console.warn('Could not delete source announcement, but notification was deleted');
          }
        } catch (announcementError) {
          console.warn('Error deleting source announcement:', announcementError);
          // Continue anyway - at least the notification is deleted
        }
      }
      
      // Remove the notification from the local state
      setNotifications(prev => {
        const filtered = prev.filter(notif => notif._id !== notificationId);
        console.log('Notifications after delete:', { 
          before: prev.length, 
          after: filtered.length,
          removedId: notificationId,
          remaining: filtered.map(n => ({ id: n._id, title: n.title }))
        });
        return filtered;
      });
      
      console.log(`${notification.type === 'announcement' ? 'Announcement' : 'Notification'} deleted successfully`);
    } catch (error) {
      console.error('Error deleting notification:', error);
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
          onClick={(e) => {
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={(e) => deleteNotification(notification._id, e)}
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
                          🗑️
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