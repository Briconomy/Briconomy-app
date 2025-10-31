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
  const tenantContext = user?.tenantContext || null;
  const [messageSubject, setMessageSubject] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [sending, setSending] = useState(false);

  const emergencyContacts = [
    { nameKey: 'requests.emergency.contacts.manager.name', descriptionKey: 'requests.emergency.contacts.manager.description', phone: '+27 11 234 5678' },
    { nameKey: 'requests.emergency.contacts.maintenance.name', descriptionKey: 'requests.emergency.contacts.maintenance.description', phone: '+27 11 234 5679' },
    { nameKey: 'requests.emergency.contacts.security.name', descriptionKey: 'requests.emergency.contacts.security.description', phone: '+27 11 234 5680' },
    { nameKey: 'requests.emergency.contacts.fireRescue.name', descriptionKey: 'requests.emergency.contacts.fireRescue.description', phone: '10177' },
    { nameKey: 'requests.emergency.contacts.police.name', descriptionKey: 'requests.emergency.contacts.police.description', phone: '10111' },
    { nameKey: 'requests.emergency.contacts.ambulance.name', descriptionKey: 'requests.emergency.contacts.ambulance.description', phone: '10177' },
    { nameKey: 'requests.emergency.contacts.poison.name', descriptionKey: 'requests.emergency.contacts.poison.description', phone: '0861 555 777' },
    { nameKey: 'requests.emergency.contacts.electricity.name', descriptionKey: 'requests.emergency.contacts.electricity.description', phone: '0860 037 566' },
    { nameKey: 'requests.emergency.contacts.water.name', descriptionKey: 'requests.emergency.contacts.water.description', phone: '0860 562 874' }
  ] as const;

  const statusLabelMap: Record<string, string> = {
    pending: t('requests.status_pending_badge') || 'PENDING',
    in_progress: t('requests.status_in_progress_badge') || 'IN PROGRESS',
    completed: t('requests.status_completed_badge') || 'COMPLETED'
  };

  const priorityLabelMap: Record<string, string> = {
    urgent: t('requests.priorityOption.urgent') || 'Urgent',
    high: t('requests.priorityOption.high') || 'High',
    medium: t('requests.priorityOption.medium') || 'Medium',
    low: t('requests.priorityOption.low') || 'Low'
  };

  const notAvailableLabel = t('common.notAvailable') || 'N/A';
  // #COMPLETION_DRIVE: Assuming active requests title template keeps {count} placeholder for badge number substitution
  // #SUGGEST_VERIFY: Change language and verify the maintenance request count renders correctly
  const activeRequestsTitleTemplate = t('communication.activeRequestsTitle') || 'Active Maintenance Requests ({count})';
  // #COMPLETION_DRIVE: Assuming request metadata template includes {priority} and {date} placeholders for localized copy
  // #SUGGEST_VERIFY: Review maintenance request list in each language to ensure labels and timestamps display as expected
  const requestMetaTemplate = t('communication.requestMeta') || 'Priority: {priority} | {date}';

  const navItems = [
    { path: '/tenant', label: t('nav.home'), icon: 'properties' },
    { path: '/tenant/payments', label: t('nav.payments'), icon: 'payment' },
    { path: '/tenant/requests', label: t('nav.requests'), icon: 'maintenance' },
    { path: '/tenant/messages', label: t('nav.communication'), icon: 'contact', active: true }
  ];

  const { data: _notifications, loading: notificationsLoading, refetch: refetchNotifications } = useApi(
    () => user?.id ? notificationsApi.getAll(user.id) : Promise.resolve([]),
    [user?.id]
  );

  const { data: leases, loading: leasesLoading } = useApi(
    () => user?.id ? leasesApi.getAll({ tenantId: user.id }) : Promise.resolve([]),
    [user?.id]
  );

  const primaryLease = Array.isArray(leases) ? leases[0] : null;
  const leaseRecord = primaryLease as Record<string, unknown> | null;
  const leaseProperty = leaseRecord && typeof leaseRecord?.property === 'object' && leaseRecord.property !== null
    ? leaseRecord.property as Record<string, unknown>
    : null;
  const leaseUnit = leaseRecord && typeof leaseRecord?.unit === 'object' && leaseRecord.unit !== null
    ? leaseRecord.unit as Record<string, unknown>
    : null;
  const notProvidedLabel = t('profile.notProvided') || 'Not provided';
  const leaseUnitNumberRaw = leaseUnit ? (leaseUnit as Record<string, unknown>).unitNumber : null;
  const rawUnitNumber = tenantContext?.unit?.unitNumber
    ? String(tenantContext.unit.unitNumber)
    : typeof leaseUnitNumberRaw === 'string' || typeof leaseUnitNumberRaw === 'number'
      ? String(leaseUnitNumberRaw)
      : '';
  const propertyNameDisplay = tenantContext?.property?.name
    || (leaseProperty && typeof leaseProperty.name === 'string' ? leaseProperty.name as string : '')
    || notProvidedLabel;
  const propertyAddressDisplay = tenantContext?.property?.address
    || (leaseProperty && typeof leaseProperty.address === 'string' ? leaseProperty.address as string : '')
    || '';
  const unitNumberDisplay = rawUnitNumber || notProvidedLabel;
  const managerNameDisplay = tenantContext?.manager?.fullName || notProvidedLabel;
  const managerEmailDisplay = tenantContext?.manager?.email || '';
  const managerPhoneDisplay = tenantContext?.manager?.phone || notAvailableLabel;

  const { data: requests, loading: requestsLoading } = useApi(
    () => user?.id ? maintenanceApi.getAll({ tenantId: user.id }) : Promise.resolve([]),
    [user?.id]
  );

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !messageSubject.trim() || sending) {
      showToast(t('communication.validation.missingFields') || 'Please fill in all fields', 'error');
      return;
    }

    if (!user?.id) {
      showToast(t('communication.validation.unauthenticated') || 'User not authenticated. Please log in again.', 'error');
      return;
    }

    setSending(true);
    try {
      const pickFirstString = (...values: unknown[]): string | null => {
        for (const value of values) {
          if (typeof value === 'string' && value.length > 0) {
            return value;
          }
        }
        return null;
      };

      const activeLease = primaryLease as Record<string, unknown> | null;
      const leaseProperty = activeLease && typeof activeLease.property === 'object' && activeLease.property !== null
        ? activeLease.property as Record<string, unknown>
        : null;
      const rawPropertyId = activeLease ? activeLease.propertyId : null;
      let leasePropertyId: string | null = null;
      if (typeof rawPropertyId === 'string') {
        leasePropertyId = rawPropertyId;
      } else if (rawPropertyId && typeof rawPropertyId === 'object' && 'id' in rawPropertyId && typeof rawPropertyId.id === 'string') {
        leasePropertyId = rawPropertyId.id;
      } else if (leaseProperty && typeof leaseProperty.id === 'string') {
        leasePropertyId = leaseProperty.id as string;
      }

      const propertyIdCandidate = pickFirstString(
        tenantContext?.property?.id,
        leasePropertyId,
        user?.assignedPropertyId,
        user?.propertyId,
        user?.appliedPropertyId
      );

      let managerIdCandidate = pickFirstString(
        tenantContext?.manager?.id,
        tenantContext?.property?.managerId,
        user?.managerId,
        leaseProperty && typeof leaseProperty.managerId === 'string' ? leaseProperty.managerId : null
      );

      if (!managerIdCandidate && propertyIdCandidate) {
        const property = await propertiesApi.getById(propertyIdCandidate);
        if (property && typeof property.managerId === 'string') {
          managerIdCandidate = property.managerId;
        }
      }

      if (!managerIdCandidate) {
        showToast(t('communication.validation.missingManager') || 'Unable to find your property manager. Please contact support.', 'error');
        return;
      }

      const tenantDisplayName = user.fullName || user.email || t('communication.notificationSenderFallback') || 'Tenant';
      const unitDisplay = rawUnitNumber && rawUnitNumber.length > 0 ? rawUnitNumber : notAvailableLabel;
      // #COMPLETION_DRIVE: Assuming notification templates retain {subject}, {tenant}, {unit}, and {message} placeholders for runtime substitution
      // #SUGGEST_VERIFY: Send a message in each supported language and confirm manager notification text renders expected values
      const notificationTitleTemplate = t('communication.notificationTitle') || 'Message from Tenant: {subject}';
      const notificationBodyTemplate = t('communication.notificationBody') || 'From: {tenant}\nUnit: {unit}\n\n{message}';
      const notificationTitle = notificationTitleTemplate.replace('{subject}', messageSubject);
      const notificationBody = notificationBodyTemplate
        .replace('{tenant}', tenantDisplayName)
        .replace('{unit}', unitDisplay)
        .replace('{message}', messageContent);

      await notificationsApi.create({
        userId: managerIdCandidate,
        title: notificationTitle,
        message: notificationBody,
        type: 'system',
        read: false
      });

      showToast(t('communication.success') || 'Message sent successfully to your property manager!', 'success');
      setMessageSubject('');
      setMessageContent('');
      await refetchNotifications();
    } catch (error) {
      console.error('Error sending message:', error);
      showToast(t('communication.error') || 'Failed to send message. Please try again.', 'error');
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

  const pendingRequests = requests?.filter((r: { status: string }) => r.status === 'pending') || [];

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">{t('communication.title')}</div>
          <div className="page-subtitle">{t('communication.subtitle')}</div>
        </div>

        {(tenantContext?.property || tenantContext?.manager || leaseProperty || rawUnitNumber) && (
          <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>
              {t('communication.managerSummaryTitle') || 'Your Property Manager'}
            </h3>
            <div style={{ display: 'grid', gap: '6px', fontSize: '13px', color: '#444' }}>
              <div><strong>{t('profile.property') || 'Property'}</strong>: {propertyNameDisplay}</div>
              {propertyAddressDisplay ? (
                <div><strong>{t('profile.address') || 'Address'}</strong>: {propertyAddressDisplay}</div>
              ) : null}
              <div><strong>{t('property.unit') || 'Unit'}</strong>: {unitNumberDisplay}</div>
              <div><strong>{t('communication.managerLabel') || 'Manager'}</strong>: {managerNameDisplay}</div>
              {managerEmailDisplay ? (
                <div><strong>{t('profile.email')}</strong>: <a href={`mailto:${managerEmailDisplay}`}>{managerEmailDisplay}</a></div>
              ) : null}
              <div><strong>{t('profile.phone')}</strong>: {managerPhoneDisplay}</div>
            </div>
          </div>
        )}

        <div className="card" style={{ padding: '16px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600' }}>
            {t('communication.messageManagerTitle')}
          </h3>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
            {t('communication.messageManagerDescription')}
          </p>

          <div style={{ marginBottom: '12px' }}>
            <label htmlFor="subject" style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '6px' }}>
              {t('communication.subject')}
            </label>
            <input
              type="text"
              id="subject"
              placeholder={t('communication.subjectPlaceholder')}
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
              {t('communication.message')}
            </label>
            <textarea
              id="message"
              placeholder={t('communication.messagePlaceholder')}
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
            {sending ? t('communication.sending') : t('communication.sendMessage')}
          </button>
        </div>

        {pendingRequests.length > 0 && (
          <div className="data-table" style={{ marginBottom: '20px' }}>
            <div className="table-header">
              <div className="table-title">
                {activeRequestsTitleTemplate.replace('{count}', pendingRequests.length.toString())}
              </div>
            </div>
            <div className="table-body">
              {pendingRequests.map((request: { id: string; title: string; status: string; priority: string; createdAt: string }) => (
                <div key={request.id} className="table-row" style={{ padding: '15px', borderBottom: '1px solid #e9ecef' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <strong style={{ fontSize: '14px', color: '#2c3e50' }}>{request.title}</strong>
                    <span className={`status-badge status-${request.status}`}>
                      {statusLabelMap[request.status] || request.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    {requestMetaTemplate
                      .replace('{priority}', priorityLabelMap[request.priority] || (t('communication.priorityUnknown') || request.priority))
                      .replace('{date}', formatDateTime(request.createdAt))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="data-table" style={{ marginBottom: '20px' }}>
          <div className="table-header">
            <div className="table-title">{t('communication.emergencyContactsTitle')}</div>
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
            <strong>{t('communication.emergencyWarningTitle')}</strong><br />
            {t('communication.emergencyWarningBody')}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
            {emergencyContacts.map((contact, index) => {
              const contactName = t(contact.nameKey);
              const contactDescription = t(contact.descriptionKey);
              // #COMPLETION_DRIVE: Assuming call confirmation template retains {name} and {phone} placeholders for runtime substitution
              // #SUGGEST_VERIFY: Trigger call flows in each language to ensure confirmation and button labels render properly
              const confirmMessage = (t('requests.confirmCall') || 'Call {name}?\n\n{phone}')
                .replace('{name}', contactName)
                .replace('{phone}', contact.phone);
              const callLabel = (t('requests.callNumber') || 'Call: {phone}').replace('{phone}', contact.phone);

              return (
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
                      {contactName}
                    </h4>
                    <p style={{ fontSize: '12px', margin: '0', color: '#666' }}>
                      {contactDescription}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const confirmCall = globalThis.confirm(confirmMessage);
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
                    {callLabel}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomNav items={navItems} responsive={false} />
    </div>
  );
};

export default CommunicationPage;
