import React, { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';

function CommunicationPage() {
  const [conversations, setConversations] = useState([
    {
      id: '1',
      name: 'John Tenant',
      role: 'tenant',
      lastMessage: 'Hi, I have a question about my lease renewal',
      timestamp: '2024-09-07 10:30',
      unread: 2,
      avatar: 'JT'
    },
    {
      id: '2',
      name: 'Sarah Manager',
      role: 'manager',
      lastMessage: 'The maintenance request has been scheduled for tomorrow',
      timestamp: '2024-09-07 09:15',
      unread: 0,
      avatar: 'SM'
    },
    {
      id: '3',
      name: 'Mike Caretaker',
      role: 'caretaker',
      lastMessage: 'I\'ve completed the AC repair in Unit 2A',
      timestamp: '2024-09-06 16:45',
      unread: 1,
      avatar: 'MC'
    },
    {
      id: '4',
      name: 'Jane Smith',
      role: 'tenant',
      lastMessage: 'Thank you for the quick response!',
      timestamp: '2024-09-06 14:20',
      unread: 0,
      avatar: 'JS'
    }
  ]);

  const [activeConversation, setActiveConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);

  const navItems = [
    { path: '/tenant', label: 'Home', active: false },
    { path: '/tenant/payments', label: 'Payments' },
    { path: '/tenant/requests', label: 'Requests' },
    { path: '/tenant/messages', label: 'Messages', active: true }
  ];

  const messages = {
    '1': [
      { id: '1', sender: 'John Tenant', content: 'Hi, I have a question about my lease renewal', timestamp: '2024-09-07 10:30', isMe: false },
      { id: '2', sender: 'You', content: 'Hello! I\'d be happy to help with your lease renewal question.', timestamp: '2024-09-07 10:32', isMe: true },
      { id: '3', sender: 'John Tenant', content: 'When is the best time to discuss the renewal terms?', timestamp: '2024-09-07 10:35', isMe: false }
    ],
    '2': [
      { id: '1', sender: 'Sarah Manager', content: 'The maintenance request has been scheduled for tomorrow', timestamp: '2024-09-07 09:15', isMe: false },
      { id: '2', sender: 'You', content: 'Great! Thank you for letting me know.', timestamp: '2024-09-07 09:20', isMe: true }
    ],
    '3': [
      { id: '1', sender: 'Mike Caretaker', content: 'I\'ve completed the AC repair in Unit 2A', timestamp: '2024-09-06 16:45', isMe: false },
      { id: '2', sender: 'You', content: 'Excellent! Thank you for the quick service.', timestamp: '2024-09-06 16:50', isMe: true }
    ],
    '4': [
      { id: '1', sender: 'Jane Smith', content: 'Thank you for the quick response!', timestamp: '2024-09-06 14:20', isMe: false }
    ]
  };

  const unreadCount = conversations.filter(c => c.unread > 0).length;
  const totalMessages = conversations.length;

  const handleSendMessage = () => {
    if (newMessage.trim() && activeConversation) {
      const newMsg = {
        id: Date.now().toString(),
        sender: 'You',
        content: newMessage,
        timestamp: new Date().toLocaleString(),
        isMe: true
      };
      
      messages[activeConversation.id] = [...messages[activeConversation.id], newMsg];
      setNewMessage('');
    }
  };

  const handleStartNewMessage = (recipient) => {
    setActiveConversation(recipient);
    setShowNewMessage(false);
  };

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Messages</div>
          <div className="page-subtitle">Communicate with tenants and staff</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={unreadCount} label="Unread" />
          <StatCard value={totalMessages} label="Conversations" />
          <StatCard value="Online" label="Status" />
          <StatCard value="Active" label="System" />
        </div>

        {!activeConversation ? (
          <>
            <div className="data-table">
              <div className="table-header">
                <div className="table-title">Conversations</div>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowNewMessage(true)}
                >
                  New Message
                </button>
              </div>
              
              {conversations.map((conversation) => (
                <div 
                  key={conversation.id} 
                  className="conversation-item"
                  onClick={() => setActiveConversation(conversation)}
                >
                  <div className="conversation-avatar">
                    {conversation.avatar}
                  </div>
                  <div className="conversation-info">
                    <div className="conversation-header">
                      <h4>{conversation.name}</h4>
                      <span className="conversation-time">
                        {new Date(conversation.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="conversation-preview">{conversation.lastMessage}</p>
                    <div className="conversation-meta">
                      <span className="role-badge">{conversation.role}</span>
                      <span className="conversation-date">
                        {new Date(conversation.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {conversation.unread > 0 && (
                    <div className="unread-badge">
                      {conversation.unread}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="quick-actions">
              <ActionCard
                onClick={() => setShowNewMessage(true)}
                icon="N"
                title="New Message"
                description="Start a new conversation"
              />
              <ActionCard
                onClick={() => {}}
                icon="G"
                title="Group Chat"
                description="Create group discussions"
              />
              <ActionCard
                onClick={() => {}}
                icon="A"
                title="Announcements"
                description="Send property-wide notices"
              />
            </div>
          </>
        ) : (
          <div className="conversation-view">
            <div className="conversation-header">
              <button 
                className="back-btn"
                onClick={() => setActiveConversation(null)}
              >
                ←
              </button>
              <div className="conversation-user">
                <div className="user-avatar">{activeConversation.avatar}</div>
                <div>
                  <h4>{activeConversation.name}</h4>
                  <span className="user-role">{activeConversation.role}</span>
                </div>
              </div>
            </div>

            <div className="messages-container">
              {messages[activeConversation.id]?.map((message) => (
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
              />
              <button 
                className="btn btn-primary"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                Send
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
              <button className="close-btn" onClick={() => setShowNewMessage(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="recipient-list">
                <h4>Select Recipient</h4>
                {conversations.map((conversation) => (
                  <div 
                    key={conversation.id} 
                    className="recipient-item"
                    onClick={() => handleStartNewMessage(conversation)}
                  >
                    <div className="recipient-avatar">{conversation.avatar}</div>
                    <div>
                      <h5>{conversation.name}</h5>
                      <span className="recipient-role">{conversation.role}</span>
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