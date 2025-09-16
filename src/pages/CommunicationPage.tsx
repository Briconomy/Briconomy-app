import React, { useState, useEffect } from 'react';
import { notificationsApi, leasesApi, maintenanceApi, formatDateTime, useApi } from '../services/api.ts';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  type: string;
}

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isMe: boolean;
}

const CommunicationPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeConversation, setActiveConversation] = useState<Contact | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [sending, setSending] = useState(false);

  interface NavItem {
  path: string;
  label: string;
  active?: boolean;
}

const navItems: NavItem[] = [
    { path: '/tenant', label: 'Home', active: false },
    { path: '/tenant/payments', label: 'Payments' },
    { path: '/tenant/requests', label: 'Requests' },
    { path: '/tenant/messages', label: 'Messages', active: true }
  ];

  const { data: notifications, loading: notificationsLoading, refetch: refetchNotifications } = useApi(
    () => notificationsApi.getAll(user?.id || '507f1f77bcf86cd799439012'),
    [user?.id]
  );

  const { data: leases, loading: leasesLoading } = useApi(
    () => leasesApi.getAll({ tenantId: user?.id || '507f1f77bcf86cd799439012' }),
    [user?.id]
  );

  const { data: requests, loading: requestsLoading } = useApi(
    () => maintenanceApi.getAll({ tenantId: user?.id || '507f1f77bcf86cd799439012' }),
    [user?.id]
  );

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('briconomy_user') || localStorage.getItem('user') || '{}');
      setUser(userData);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

const contacts: Contact[] = [
    {
      id: 'manager',
      name: 'Property Manager',
      role: 'manager',
      lastMessage: 'Property inquiries',
      timestamp: new Date().toISOString(),
      unread: 0,
      avatar: 'PM',
      type: 'contact'
    },
    {
      id: 'caretaker',
      name: 'Maintenance Team',
      role: 'caretaker',
      lastMessage: 'Repair requests',
      timestamp: new Date().toISOString(),
      unread: 0,
      avatar: 'MT',
      type: 'contact'
    },
    {
      id: 'emergency',
      name: 'Emergency Contact',
      role: 'emergency',
      lastMessage: 'Urgent matters',
      timestamp: new Date().toISOString(),
      unread: 0,
      avatar: 'EC',
      type: 'emergency'
    }
  ];

  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  const totalMessages = notifications?.length || 0;

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversation || sending) return;

    setSending(true);
    try {
      const messageData = {
        userId: user?.id || '507f1f77bcf86cd799439012',
        title: `Message to ${activeConversation.name}`,
        message: newMessage,
        type: 'message',
        recipient: activeConversation.role,
        createdAt: new Date()
      };

      await notificationsApi.create(messageData);
      
      const conversationId = activeConversation.id;
      const newMsg = {
        id: Date.now().toString(),
        sender: 'You',
        content: newMessage,
        timestamp: new Date().toISOString(),
        isMe: true
      };
      
      setMessages(prev => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] || []), newMsg]
      }));
      
      setNewMessage('');
      await refetchNotifications();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

const handleStartNewMessage = (recipient: Contact) => {
    setActiveConversation(recipient);
    setShowNewMessage(false);
  };

  if (notificationsLoading || leasesLoading || requestsLoading) {
    return (
<div className="app-container mobile-only">
        <TopNav showLogout />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading messages...</p>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  const currentLease = leases?.[0];
  const pendingRequests = requests?.filter(r => r.status === 'pending') || [];

return (
    <div className="app-container mobile-only">
      <TopNav showLogout />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Messages</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={unreadCount} label="Unread" />
          <StatCard value={totalMessages} label="Messages" />
          <StatCard value={contacts.length} label="Contacts" />
          <StatCard value={pendingRequests.length} label="Active Requests" />
        </div>

{currentLease && (
          <div className="property-info-card">
            <h3>Property</h3>
            <div className="property-details">
              <p><strong>Property:</strong> {currentLease.propertyId?.name || 'N/A'}</p>
              <p><strong>Unit:</strong> {currentLease.unitId?.unitNumber || 'N/A'}</p>
            </div>
          </div>
        )}

        {!activeConversation ? (
          <>
            <div className="data-table">
              <div className="table-header">
                <div className="table-title">Quick Contacts</div>
                <button 
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowNewMessage(true)}
                >
                  New Message
                </button>
              </div>
              
              {contacts.map((contact) => (
                <div 
                  key={contact.id} 
                  className="conversation-item"
                  onClick={() => setActiveConversation(contact)}
                >
                  <div className="conversation-avatar">
                    {contact.avatar}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <h4>{contact.name}</h4>
                      <span className="conversation-time">
                        {new Date(contact.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="conversation-preview">{contact.lastMessage}</p>
                    <div className="conversation-meta">
                      <span className={`role-badge ${contact.type === 'emergency' ? 'emergency-badge' : ''}`}>
                        {contact.role}
                      </span>
                      <span className="conversation-date">
                        Available
                      </span>
                    </div>
                  </div>
                  {contact.unread > 0 && (
                    <div className="unread-badge">
                      {contact.unread}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {notifications && notifications.length > 0 && (
<div className="notifications-section">
                <h3>Recent Notifications</h3>
                <div className="notifications-list">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className="notification-item">
                      <div className="notification-content">
                        <h4>{notification.title}</h4>
                        <p>{notification.message}</p>
                        <span className="notification-time">
                          {formatDateTime(notification.createdAt)}
                        </span>
                      </div>
                      <span className={`notification-status ${notification.read ? 'read' : 'unread'}`}>
                        {notification.read ? 'Read' : 'New'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

<div className="quick-actions">
              <ActionCard onClick={() => setActiveConversation(contacts[0])} icon="M" title="Manager" />
              <ActionCard onClick={() => setActiveConversation(contacts[1])} icon="T" title="Maintenance" />
              <ActionCard onClick={() => setActiveConversation(contacts[2])} icon="E" title="Emergency" />
              <ActionCard to="/tenant/requests" icon="R" title="Request Help" />
            </div>
          </>
        ) : (
          <div className="conversation-view">
            <div className="conversation-header">
              <button 
                type="button"
                className="back-btn"
                onClick={() => setActiveConversation(null)}
              >
                ←
              </button>
              <div className="conversation-user">
                <div className="user-avatar">{activeConversation.avatar}</div>
                <div>
                  <h4>{activeConversation.name}</h4>
                  <span className={`user-role ${activeConversation.type === 'emergency' ? 'emergency-role' : ''}`}>
                    {activeConversation.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="messages-container">
{activeConversation.type === 'emergency' && (
                <div className="emergency-notice">
                  <p>Emergency: +27 123 456 789</p>
                </div>
              )}

              {(messages[activeConversation.id] || []).map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.isMe ? 'message-sent' : 'message-received'}`}
                >
                  <div className="message-content">
                    <p>{message.content}</p>
                    <span className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="message-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={sending}
              />
              <button 
                type="button"
                className="btn btn-primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      {showNewMessage && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>New Message</h3>
              <button type="button" className="close-btn" onClick={() => setShowNewMessage(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="recipient-list">
                <h4>Select Recipient</h4>
                {contacts.map((contact) => (
                  <div 
                    key={contact.id} 
                    className="recipient-item"
                    onClick={() => handleStartNewMessage(contact)}
                  >
                    <div className="recipient-avatar">{contact.avatar}</div>
                    <div>
                      <h5>{contact.name}</h5>
                      <span className={`recipient-role ${contact.type === 'emergency' ? 'emergency-role' : ''}`}>
                        {contact.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default CommunicationPage;