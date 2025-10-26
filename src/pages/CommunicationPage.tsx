import { useState } from 'react';
import { notificationsApi, leasesApi, maintenanceApi, propertiesApi, formatDateTime, useApi } from '../services/api.ts';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

const CommunicationPage = () => {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

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
    if (!messageContent.trim() || !messageSubject.trim() || sending) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (!user?.id) {
      showToast('User not authenticated. Please log in again.', 'error');
      return;
    }

    setSending(true);
    try {
      const currentLease = leases?.[0];
      
      if (!currentLease || !currentLease.propertyId) {
        showToast('Unable to find your property manager. Please contact support.', 'error');
        setSending(false);
        return;
      }

      const propertyId = typeof currentLease.propertyId === 'object' && 'id' in currentLease.propertyId 
        ? currentLease.propertyId.id 
        : currentLease.propertyId;

      const property = await propertiesApi.getById(propertyId);
      
      if (!property || !property.managerId) {
        showToast('Unable to find your property manager. Please contact support.', 'error');
        setSending(false);
        return;
      }

      await notificationsApi.create({
        userId: property.managerId,
        title: `Message from Tenant: ${messageSubject}`,
        message: `From: ${user.fullName || user.email}\nUnit: ${currentLease.unitId?.unitNumber || 'N/A'}\n\n${messageContent}`,
        type: 'system',
        read: false
      });

      showToast('Message sent successfully to your property manager!', 'success');
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

        <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
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

        {pendingRequests.length > 0 && (
          <div className="data-table" style={{ marginBottom: '20px' }}>
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

        <div className="data-table" style={{ marginBottom: '20px' }}>
          <div className="table-header">
            <div className="table-title">Emergency Contacts</div>
          </div>
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            fontSize: '13px',
            margin: '16px'
          }}>
            <strong>WARNING - Life-threatening emergencies:</strong><br />
            Call <strong>10177</strong> (Fire/Medical) or <strong>10111</strong> (Police) immediately
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
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
        </div>
      </div>

      <BottomNav items={navItems} responsive={false} />
    </div>
  );
};

export default CommunicationPage;
