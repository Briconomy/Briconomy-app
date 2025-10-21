import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsApi, leasesApi, maintenanceApi, formatDateTime, useApi } from '../services/api.ts';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import ActionCard from '../components/ActionCard.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import Icon from '../components/Icon.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

const CommunicationPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [messageType, setMessageType] = useState<'manager' | null>(null);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<string | null>(null);

  const faqItems = [
    {
      id: '1',
      question: 'How do I pay my rent?',
      answer: 'Go to the Payments page and select your preferred payment method. We accept bank transfers, EFT, and credit/debit cards.',
      icon: 'payment'
    },
    {
      id: '2',
      question: 'How do I report a maintenance issue?',
      answer: 'Click "Report Issue" on this page, fill in the details, and submit. Our maintenance team will be notified immediately.',
      icon: 'issue'
    },
    {
      id: '3',
      question: 'How do I contact my property manager?',
      answer: 'Use the Messages page to send a message or call directly using the Emergency Contact button above.',
      icon: 'contact'
    },
    {
      id: '4',
      question: 'What if I have an emergency?',
      answer: 'Click the "Emergency Contact" button to call the property manager immediately, or view all emergency contacts in the Help & Support section.',
      icon: 'emergency'
    },
    {
      id: '5',
      question: 'Where can I view my lease?',
      answer: 'Your lease agreement and all documents are available in the Documents section of your Profile page.',
      icon: 'profile'
    },
    {
      id: '6',
      question: 'How do I update my information?',
      answer: 'Go to your Profile page and click the "Edit" button to update your contact and personal information.',
      icon: 'profile'
    }
  ];

  const emergencyContacts = [
    { name: 'Property Manager', phone: '+27 11 234 5678', description: 'Building emergencies & urgent issues' },
    { name: 'Emergency Maintenance', phone: '+27 11 234 5679', description: 'After-hours maintenance emergencies' },
    { name: 'Building Security', phone: '+27 11 234 5680', description: 'Security concerns & access issues' },
    { name: 'Fire & Rescue', phone: '10177', description: 'Fire emergencies & medical assistance' },
    { name: 'Police (SAPS)', phone: '10111', description: 'Crime, theft, & security emergencies' },
    { name: 'Ambulance Service', phone: '10177', description: 'Medical emergencies' },
    { name: 'Poison Information', phone: '0861 555 777', description: 'Poison & toxin emergencies' },
    { name: 'Electricity (Eskom)', phone: '0860 037 566', description: 'Power outages & electrical faults' },
    { name: 'Water & Sanitation', phone: '0860 562 874', description: 'Water leaks & sewage issues' }
  ];

  const navItems = [
    { path: '/tenant', label: t('nav.home'), icon: 'properties' },
    { path: '/tenant/payments', label: t('nav.payments'), icon: 'payment' },
    { path: '/tenant/requests', label: t('nav.requests'), icon: 'maintenance' },
    { path: '/tenant/messages', label: t('nav.communication'), icon: 'contact', active: true }
  ];

  const { data: notifications, loading: notificationsLoading, refetch: refetchNotifications } = useApi(
    () => user?.id ? notificationsApi.getAll(user.id) : Promise.resolve([]),
    [user?.id]
  );

  const { data: leases, loading: leasesLoading } = useApi(
    () => user?.id ? leasesApi.getAll({ tenantId: user.id }) : Promise.resolve([]),
    [user?.id]
  );

  const { data: requests, loading: requestsLoading } = useApi(
    () => user?.id ? maintenanceApi.getAll({ tenantId: user.id }) : Promise.resolve([]),
    [user?.id]
  );

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !messageSubject.trim() || !messageType || sending) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (!user?.id) {
      showToast('User not authenticated. Please log in again.', 'error');
      return;
    }

    setSending(true);
    try {
      await notificationsApi.create({
        userId: user.id,
        title: `Property Manager: ${messageSubject}`,
        message: messageContent,
        type: 'system',
        read: false
      });

      showToast('Message sent successfully!', 'success');
      setMessageType(null);
      setMessageSubject('');
      setMessageContent('');
      await refetchNotifications();
    } catch (error) {
      console.error('Error sending message:', error);
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleEmergency = () => {
    setShowEmergencyModal(true);
  };

  const toggleFAQ = (id: string) => {
    setSelectedFAQ(selectedFAQ === id ? null : id);
  };

  const isLoading = authLoading || notificationsLoading || leasesLoading || requestsLoading;

  if (isLoading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t('communication.loading')}</p>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  const currentLease = leases?.[0];
  const unreadNotifications = notifications?.filter((n: { read: boolean }) => !n.read) || [];
  const pendingRequests = requests?.filter((r: { status: string }) => r.status === 'pending') || [];

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">{t('communication.title')}</div>
          <div className="page-subtitle">Send messages to your property team</div>
        </div>

        {currentLease && (
          <div className="info-card" style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '10px', color: '#2c3e50' }}>Your Property</h3>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              <p style={{ margin: '5px 0' }}>
                <strong>Property:</strong> {currentLease.propertyId?.name || 'N/A'}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Unit:</strong> {currentLease.unitId?.unitNumber || 'N/A'}
              </p>
            </div>
          </div>
        )}

        {messageType === null ? (
          <>
            <div className="quick-actions">
              <ActionCard 
                onClick={() => setMessageType('manager')}
                icon={<Icon name="manage" alt="Manager" />}
                title="Message Manager"
                description="Contact your property manager"
              />
              <ActionCard 
                onClick={() => navigate('/tenant/requests')}
                icon={<Icon name="maintenance" alt="Maintenance" />}
                title="Message Maintenance"
                description="Submit a maintenance request"
              />
              <ActionCard 
                onClick={handleEmergency}
                icon={<Icon name="emergency" alt="Emergency" />}
                title="Emergency Contact"
                description="Call for urgent matters only"
              />
              <ActionCard 
                onClick={() => setShowHelpModal(true)}
                icon={<Icon name="help" alt="Help & Support" />}
                title="Help & Support"
                description="FAQs and contact info"
              />
            </div>

            {unreadNotifications.length > 0 && (
              <div className="data-table" style={{ marginTop: '20px' }}>
                <div className="table-header">
                  <div className="table-title">
                    Unread Notifications ({unreadNotifications.length})
                  </div>
                </div>
                <div className="table-body">
                  {unreadNotifications.slice(0, 5).map((notification: { id: string; title: string; message: string; createdAt: string }) => (
                    <div key={notification.id} className="table-row" style={{ padding: '15px', borderBottom: '1px solid #e9ecef' }}>
                      <div style={{ marginBottom: '5px' }}>
                        <strong style={{ fontSize: '14px', color: '#2c3e50' }}>{notification.title}</strong>
                      </div>
                      <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '5px' }}>
                        {notification.message}
                      </div>
                      <div style={{ fontSize: '12px', color: '#95a5a6' }}>
                        {formatDateTime(notification.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pendingRequests.length > 0 && (
              <div className="data-table" style={{ marginTop: '20px' }}>
                <div className="table-header">
                  <div className="table-title">
                    Active Maintenance Requests ({pendingRequests.length})
                  </div>
                </div>
                <div className="table-body">
                  {pendingRequests.map((request: { id: string; title: string; status: string; priority: string; createdAt: string }) => (
                    <div key={request.id} className="table-row" style={{ padding: '15px', borderBottom: '1px solid #e9ecef' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <strong style={{ fontSize: '14px', color: '#2c3e50' }}>{request.title}</strong>
                        <span className={`status-badge status-${request.status}`}>
                          {request.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        Priority: {request.priority} | {formatDateTime(request.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {notifications && notifications.length > 0 && (
              <div className="data-table" style={{ marginTop: '20px' }}>
                <div className="table-header">
                  <div className="table-title">All Notifications</div>
                </div>
                <div className="table-body">
                  {notifications.slice(0, 10).map((notification: { id: string; title: string; message: string; createdAt: string; read: boolean }) => (
                    <div 
                      key={notification.id} 
                      className="table-row" 
                      style={{ 
                        padding: '15px', 
                        borderBottom: '1px solid #e9ecef',
                        opacity: notification.read ? 0.6 : 1
                      }}
                    >
                      <div style={{ marginBottom: '5px' }}>
                        <strong style={{ fontSize: '14px', color: '#2c3e50' }}>{notification.title}</strong>
                        {!notification.read && (
                          <span style={{ 
                            marginLeft: '10px', 
                            fontSize: '11px', 
                            background: '#e74c3c', 
                            color: 'white', 
                            padding: '2px 8px', 
                            borderRadius: '10px' 
                          }}>
                            NEW
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6c757d', marginBottom: '5px' }}>
                        {notification.message}
                      </div>
                      <div style={{ fontSize: '12px', color: '#95a5a6' }}>
                        {formatDateTime(notification.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card" style={{ padding: '16px' }}>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                setMessageType(null);
                setMessageSubject('');
                setMessageContent('');
              }}
              style={{ marginBottom: '16px' }}
            >
              ← Back
            </button>

            <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>
              Message Property Manager
            </h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
              Send a message to your property manager about leases, payments, or general inquiries
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label htmlFor="subject" style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                Subject
              </label>
              <input
                type="text"
                id="subject"
                placeholder="What is this about?"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                disabled={sending}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="message" style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
                Message
              </label>
              <textarea
                id="message"
                placeholder="Type your message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={6}
                disabled={sending}
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '14px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '100px'
                }}
              />
            </div>

            <button 
              type="button"
              className="btn btn-primary"
              onClick={handleSendMessage}
              disabled={!messageContent.trim() || !messageSubject.trim() || sending}
              style={{ width: '100%', padding: '12px', fontSize: '14px' }}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        )}
      </div>

      {showEmergencyModal && (
        <div className="modal-overlay" onClick={() => setShowEmergencyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>Emergency Contacts</h3>
              <button type="button" className="close-btn" onClick={() => setShowEmergencyModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ 
                background: '#fff3cd', 
                border: '1px solid #ffc107', 
                borderRadius: '8px', 
                padding: '12px', 
                marginBottom: '16px',
                fontSize: '13px'
              }}>
                <strong>WARNING - Life-threatening emergencies:</strong><br />
                Call <strong>10177</strong> (Fire/Medical) or <strong>10111</strong> (Police) immediately
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {emergencyContacts.map((contact, index) => (
                  <div 
                    key={index}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '12px',
                      background: '#f9f9f9'
                    }}
                  >
                    <div style={{ marginBottom: '8px' }}>
                      <h4 style={{ fontSize: '14px', margin: '0 0 4px 0', fontWeight: '600' }}>
                        {contact.name}
                      </h4>
                      <p style={{ fontSize: '12px', margin: '0', color: '#666' }}>
                        {contact.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => {
                        const confirmCall = globalThis.confirm(`Call ${contact.name}?\n\n${contact.phone}`);
                        if (confirmCall) {
                          globalThis.location.href = `tel:${contact.phone.replace(/\s/g, '')}`;
                          setShowEmergencyModal(false);
                        }
                      }}
                      style={{ 
                        width: '100%', 
                        padding: '8px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      Call: {contact.phone}
                    </button>
                  </div>
                ))}
              </div>
              
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowEmergencyModal(false)}
                style={{ width: '100%', marginTop: '16px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="modal-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h3>Help & Support</h3>
              <button type="button" className="close-btn" onClick={() => setShowHelpModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <h4 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '600' }}>FAQs</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {faqItems.map(item => (
                  <div key={item.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '8px' }}>
                    <button
                      type="button"
                      onClick={() => toggleFAQ(item.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'none',
                        border: 'none',
                        padding: '8px 0',
                        cursor: 'pointer',
                        fontSize: '14px',
                        textAlign: 'left',
                        fontWeight: '500'
                      }}
                    >
                      <span>{item.question}</span>
                      <span style={{ fontSize: '18px', color: '#666' }}>
                        {selectedFAQ === item.id ? '−' : '+'}
                      </span>
                    </button>
                    {selectedFAQ === item.id && (
                      <p style={{ 
                        margin: '8px 0 0 0', 
                        fontSize: '13px', 
                        color: '#666',
                        lineHeight: '1.5'
                      }}>
                        {item.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <h4 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '600' }}>Office Hours</h4>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Mon - Fri</span>
                  <strong>8:00 AM - 6:00 PM</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>Saturday</span>
                  <strong>9:00 AM - 2:00 PM</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span>Sunday</span>
                  <strong>Closed</strong>
                </div>
                <div style={{ borderTop: '1px solid #eee', paddingTop: '12px' }}>
                  <p style={{ fontSize: '12px', margin: '0 0 4px 0' }}><strong>Office Location</strong></p>
                  <p style={{ margin: '0', fontSize: '12px' }}>123 Main Street, Blue Hills</p>
                  <p style={{ margin: '0', fontSize: '12px' }}>Johannesburg, SA 2090</p>
                </div>
              </div>
              
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowHelpModal(false)}
                style={{ width: '100%' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
};

export default CommunicationPage;
