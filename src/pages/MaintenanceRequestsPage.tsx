import React, { useMemo, useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import OfflineMaintenanceForm from '../components/OfflineMaintenanceForm.tsx';
import Icon from '../components/Icon.tsx';
import { useOffline } from '../hooks/useOffline.ts';
import { maintenanceApi, leasesApi, propertiesApi, unitsApi, formatDate, useApi } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';

interface FaqTemplate {
  id: string;
  questionKey: string;
  answerKey: string;
  icon: string;
}

const faqTemplates: FaqTemplate[] = [
  { id: '1', questionKey: 'requests.faq.payRent.question', answerKey: 'requests.faq.payRent.answer', icon: 'payment' },
  { id: '2', questionKey: 'requests.faq.reportIssue.question', answerKey: 'requests.faq.reportIssue.answer', icon: 'issue' },
  { id: '3', questionKey: 'requests.faq.contactManager.question', answerKey: 'requests.faq.contactManager.answer', icon: 'contact' },
  { id: '4', questionKey: 'requests.faq.emergency.question', answerKey: 'requests.faq.emergency.answer', icon: 'emergency' },
  { id: '5', questionKey: 'requests.faq.viewLease.question', answerKey: 'requests.faq.viewLease.answer', icon: 'profile' },
  { id: '6', questionKey: 'requests.faq.updateInfo.question', answerKey: 'requests.faq.updateInfo.answer', icon: 'profile' }
];

interface EmergencyContactTemplate {
  nameKey: string;
  descriptionKey: string;
  phone: string;
}

const emergencyContactTemplates: EmergencyContactTemplate[] = [
  { nameKey: 'requests.emergency.contacts.manager.name', descriptionKey: 'requests.emergency.contacts.manager.description', phone: '+27 11 234 5678' },
  { nameKey: 'requests.emergency.contacts.maintenance.name', descriptionKey: 'requests.emergency.contacts.maintenance.description', phone: '+27 11 234 5679' },
  { nameKey: 'requests.emergency.contacts.security.name', descriptionKey: 'requests.emergency.contacts.security.description', phone: '+27 11 234 5680' },
  { nameKey: 'requests.emergency.contacts.fireRescue.name', descriptionKey: 'requests.emergency.contacts.fireRescue.description', phone: '10177' },
  { nameKey: 'requests.emergency.contacts.police.name', descriptionKey: 'requests.emergency.contacts.police.description', phone: '10111' },
  { nameKey: 'requests.emergency.contacts.ambulance.name', descriptionKey: 'requests.emergency.contacts.ambulance.description', phone: '10177' },
  { nameKey: 'requests.emergency.contacts.poison.name', descriptionKey: 'requests.emergency.contacts.poison.description', phone: '0861 555 777' },
  { nameKey: 'requests.emergency.contacts.electricity.name', descriptionKey: 'requests.emergency.contacts.electricity.description', phone: '0860 037 566' },
  { nameKey: 'requests.emergency.contacts.water.name', descriptionKey: 'requests.emergency.contacts.water.description', phone: '0860 562 874' }
];

function MaintenanceRequestsPage() {
  const { t } = useLanguage();
  const { isOnline, storeOfflineData, syncNow } = useOffline();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    photos: [] as string[]
  });
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState<'requests' | 'help'>('requests');
  const [selectedFAQ, setSelectedFAQ] = useState<string | null>(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const priorityBadgeLabels = useMemo(
    () => ({
      urgent: t('requests.priority_urgent') || 'URGENT',
      high: t('requests.priority_high') || 'HIGH',
      medium: t('requests.priority_medium') || 'MEDIUM',
      low: t('requests.priority_low') || 'LOW'
    }),
    [t]
  );

  const priorityOptionLabels = useMemo(
    () => ({
      urgent: t('requests.priorityOption.urgent') || 'Urgent',
      high: t('requests.priorityOption.high') || 'High',
      medium: t('requests.priorityOption.medium') || 'Medium',
      low: t('requests.priorityOption.low') || 'Low'
    }),
    [t]
  );

  const statusBadgeLabels = useMemo(
    () => ({
      pending: t('requests.status_pending_badge') || 'PENDING',
      in_progress: t('requests.status_in_progress_badge') || 'IN PROGRESS',
      completed: t('requests.status_completed_badge') || 'COMPLETED'
    }),
    [t]
  );

  const categoryLabels = useMemo(
    () => ({
      plumbing: t('requests.category.plumbing') || 'Plumbing',
      electrical: t('requests.category.electrical') || 'Electrical',
      hvac: t('requests.category.hvac') || 'HVAC',
      appliances: t('requests.category.appliances') || 'Appliances',
      general: t('requests.category.general') || 'General',
      pest: t('requests.category.pest') || 'Pest Control',
      security: t('requests.category.security') || 'Security',
      other: t('requests.category.other') || 'Other'
    }),
    [t]
  );

  const faqItems = useMemo(
    () => faqTemplates.map((item) => ({
      ...item,
      question: t(item.questionKey),
      answer: t(item.answerKey)
    })),
    [t]
  );

  const emergencyContacts = useMemo(
    () => emergencyContactTemplates.map((contact) => ({
      ...contact,
      name: t(contact.nameKey),
      description: t(contact.descriptionKey)
    })),
    [t]
  );

  const formatCallPrompt = (name: string, phone: string) =>
    (t('requests.confirmCall') || 'Call {name}?\n\n{phone}')
      .replace('{name}', name)
      .replace('{phone}', phone);

  const formatCallLabel = (phone: string) =>
    (t('requests.callNumber') || 'Call: {phone}').replace('{phone}', phone);

  const formatDeleteMessage = (title: string) =>
    (t('requests.confirmDelete') || 'Are you sure you want to delete the request "{title}"?')
      .replace('{title}', title);

  const toggleFAQ = (id: string) => {
    setSelectedFAQ(selectedFAQ === id ? null : id);
  };

  const navItems = [
    { path: '/tenant', label: t('nav.home'), icon: 'properties', active: false },
    { path: '/tenant/payments', label: t('nav.payments'), icon: 'payment' },
    { path: '/tenant/requests', label: t('nav.requests'), icon: 'maintenance', active: true },
    { path: '/tenant/profile', label: t('nav.profile'), icon: 'profile' }
  ];

  const { data: requests, loading: requestsLoading, refetch: refetchRequests } = useApi(
    () => maintenanceApi.getAll({ tenantId: user?.id || '507f1f77bcf86cd799439012' }),
    [user?.id]
  );

  const handleDeleteRequest = async (requestId: string, requestTitle: string) => {
    if (!confirm(formatDeleteMessage(requestTitle))) {
      return;
    }

    try {
      await maintenanceApi.delete(requestId);
      await refetchRequests();
      showToast(t('requests.deleteSuccess') || 'Request deleted successfully', 'success');
    } catch (error) {
      console.error('[MaintenanceRequestsPage] Error deleting request:', error);
      showToast(t('requests.deleteError') || 'Failed to delete request. Please try again.', 'error');
    }
  };

  const { data: leases, loading: leasesLoading } = useApi(
    () => leasesApi.getAll({ tenantId: user?.id || '507f1f77bcf86cd799439012' }),
    [user?.id]
  );

  const requestsData = useMemo(() => Array.isArray(requests) ? requests : [], [requests]);
  
  const stats = useMemo(() => ({
    pendingCount: requestsData.filter(r => r.status === 'pending').length,
    inProgressCount: requestsData.filter(r => r.status === 'in_progress').length,
    completedCount: requestsData.filter(r => r.status === 'completed').length
  }), [requestsData]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newPhotos = Array.from(files).slice(0, 5 - uploadedPhotos.length);
    setUploadedPhotos(prev => [...prev, ...newPhotos]);
    
    const photoNames = newPhotos.map(file => file.name);
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...photoNames]
    }));
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    setSubmitting(true);
    try {
      // Get tenantContext from user (like CommunicationPage does)
      const tenantContext = user?.tenantContext || null;
      const currentLease = leases?.[0];
      
      console.log('[MaintenanceRequest] TenantContext:', tenantContext);
      console.log('[MaintenanceRequest] Current lease:', currentLease);

      // Prioritize tenantContext (like CommunicationPage), then fall back to lease
      let unitId = tenantContext?.unit?.id || currentLease?.unitId;
      let propertyId = tenantContext?.property?.id || currentLease?.propertyId;
      let propertyName = tenantContext?.property?.name || currentLease?.property?.name;
      let propertyAddress = tenantContext?.property?.address || currentLease?.property?.address;
      let unitNumber = tenantContext?.unit?.unitNumber || currentLease?.unit?.unitNumber;
      
      console.log('[MaintenanceRequest] Initial data:', { 
        unitId, 
        propertyId, 
        propertyName, 
        propertyAddress, 
        unitNumber 
      });

      // Only fetch if we still don't have the data
      if (propertyId && !propertyName && !propertyAddress) {
        try {
          console.log('[MaintenanceRequest] Fetching property details for:', propertyId);
          const property = await propertiesApi.getById(propertyId);
          console.log('[MaintenanceRequest] Property fetched:', property);
          propertyName = property.name;
          propertyAddress = property.address;
        } catch (error) {
          console.error('[MaintenanceRequest] Failed to fetch property details:', error);
        }
      }

      if (unitId && !unitNumber) {
        try {
          console.log('[MaintenanceRequest] Fetching unit details for:', unitId);
          const units = await unitsApi.getAll(propertyId);
          console.log('[MaintenanceRequest] Units fetched:', units);
          const unit = units.find((u: { id: string }) => u.id === unitId);
          console.log('[MaintenanceRequest] Found unit:', unit);
          if (unit) {
            unitNumber = unit.unitNumber;
          }
        } catch (error) {
          console.error('[MaintenanceRequest] Failed to fetch unit details:', error);
        }
      }
      
      console.log('[MaintenanceRequest] Final data:', { 
        location: propertyName || propertyAddress || 'Unknown',
        unitNumber: unitNumber || 'Unknown'
      });

      const requestData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        status: 'pending',
        tenantId: user?.id || '507f1f77bcf86cd799439012',
        unitId: unitId || null,
        propertyId: propertyId || null,
        photos: formData.photos,
        location: propertyName || propertyAddress || 'Unknown',
        unitNumber: unitNumber || 'Unknown',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (isOnline) {
        await maintenanceApi.create(requestData);
        await refetchRequests();

        // #COMPLETION_DRIVE: Wait for refetch to render before closing form
        // #SUGGEST_VERIFY: 500ms delay ensures data appears in list immediately
        await new Promise(resolve => setTimeout(resolve, 500));
        showToast(t('requests.submitSuccess') || 'Maintenance request submitted successfully!', 'success');
      } else {
        await storeOfflineData('maintenance_request', requestData);
        showToast(t('requests.submitOffline') || 'Request saved offline. It will be submitted when you\'re back online.', 'info');
      }
      setShowRequestForm(false);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: 'general',
        photos: []
      });
      setUploadedPhotos([]);
    } catch (error) {
      console.error('Error submitting request:', error);
  showToast(t('requests.submitError') || 'Failed to submit request. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'status-pending';
      case 'in_progress':
        return 'status-progress';
      case 'completed':
        return 'status-paid';
      default:
        return 'status-pending';
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'priority-badge priority-urgent';
      case 'high':
        return 'priority-badge priority-high';
      case 'medium':
        return 'priority-badge priority-medium';
      case 'low':
        return 'priority-badge priority-low';
      default:
        return 'priority-badge priority-medium';
    }
  };

  if (requestsLoading || leasesLoading) {
    return (
      <div className="app-container mobile-only page-wrapper">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t('requests.loadingRequests')}</p>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  return (
      <div className="app-container mobile-only page-wrapper">
        <TopNav showLogout showBackButton />

        <div className="main-content">
          <div className="page-header">
            <div className="page-title">{t('requests.title')}</div>
            <div className="page-subtitle">{t('requests.subtitle')}</div>
          </div>

          <div className="tab-controls">
            <button
              type="button"
              className={`tab-button ${activeTab === 'requests' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              {t('requests.tab.requests') || 'Requests'}
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'help' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('help')}
            >
              {t('requests.tab.help') || 'Help & Support'}
            </button>
          </div>

          {activeTab === 'requests' && (
            <>
              <div className="dashboard-grid">
                <StatCard value={stats.pendingCount} label={t('requests.pending')} />
                <StatCard value={stats.inProgressCount} label={t('requests.inProgress')} />
                <StatCard value={stats.completedCount} label={t('requests.completed')} />
                <StatCard value={requestsData.length} label={t('requests.total')} />
              </div>

              <div className="section-card">
                {requestsData.length > 0 && (
                  <div className="section-card-header">
                    <div className="section-header-content">
                      <div className="section-title-row">
                        <div className="section-title">{t('requests.yourRequests')}</div>
                        <span className={`status-pill ${isOnline ? 'success' : 'warning'}`}>
                          {isOnline ? (t('requests.statusOnline') || 'Online') : (t('requests.statusOffline') || 'Offline')}
                        </span>
                      </div>
                      <div className="section-subtitle">{t('requests.subtitle')}</div>
                    </div>
                    <div className="action-stack">
                      {!isOnline && (
                        <button type="button" className="btn btn-secondary btn-xs" onClick={() => syncNow()}>
                          {t('requests.syncNow') || 'Sync'}
                        </button>
                      )}
                      <button type="button" className="btn btn-primary btn-sm2" onClick={() => setShowRequestForm(true)}>
                        {t('requests.newRequest')}
                      </button>
                    </div>
                  </div>
                )}

              {requestsData.length === 0 ? (
                <div className="empty-state-card">
                  <Icon name="maintenance" alt={t('requests.title')} size={48} />
                  <div className="empty-state-title">{t('requests.noRequestsFound')}</div>
                  <div className="empty-state-text">{t('requests.emptyDescription') || 'Log a request to notify your maintenance team.'}</div>
                  <div className="card-actions">
                    <button
                      type="button"
                      className="btn btn-primary full-width-button"
                        onClick={() => setShowRequestForm(true)}
                      >
                        {t('requests.newRequest')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="request-list">
                    {requestsData.map((request) => {
                      const priorityLabel = priorityBadgeLabels[request.priority as keyof typeof priorityBadgeLabels] || request.priority.replace('_', ' ').toUpperCase();
                      const statusLabel = statusBadgeLabels[request.status as keyof typeof statusBadgeLabels] || request.status.replace('_', ' ').toUpperCase();
                      const categoryLabel = request.category ? (categoryLabels[request.category as keyof typeof categoryLabels] || request.category) : '';
                      const createdLabel = (t('requests.createdAt') || 'Created {date}').replace('{date}', formatDate(request.createdAt));
                      const completedLabel = request.status === 'completed' && request.completedAt
                        ? (t('requests.completedAt') || 'Completed {date}').replace('{date}', formatDate(request.completedAt))
                        : null;
                      const assignedLabel = request.assignedTo
                        ? (t('requests.assignedTo') || 'Assigned to {name}').replace('{name}', request.assignedTo)
                        : null;
                      const locationLabel = request.location
                        ? request.unitNumber
                          ? `${request.location} • ${(t('requests.unitLabel') || 'Unit')} ${request.unitNumber}`
                          : request.location
                        : null;
                      const categoryLine = request.category
                        ? (t('requests.categoryLabel') || 'Category: {category}').replace('{category}', categoryLabel)
                        : null;
                      const attachmentsLine = request.photos && request.photos.length > 0
                        ? `${request.photos.length} ${request.photos.length === 1 ? (t('requests.attachmentSingular') || 'attachment') : (t('requests.attachmentPlural') || 'attachments')}`
                        : null;
                      const commentsLine = request.comments && request.comments.length > 0
                        ? `${request.comments.length} ${request.comments.length === 1 ? (t('requests.commentSingular') || 'comment') : (t('requests.commentPlural') || 'comments')}`
                        : null;

                      return (
                        <div key={request.id} className="request-card">
                          <div className="request-card-header">
                            <div>
                              <div className="record-title">{request.title}</div>
                              <div className="request-description">{request.description}</div>
                            </div>
                            <span className={getPriorityBadgeClass(request.priority)}>
                              {priorityLabel}
                            </span>
                          </div>

                          <div className="request-meta">
                            <span>{createdLabel}</span>
                            {locationLabel && <span>{locationLabel}</span>}
                            {assignedLabel && <span>{assignedLabel}</span>}
                            {categoryLine && <span>{categoryLine}</span>}
                            {attachmentsLine && <span>{attachmentsLine}</span>}
                            {commentsLine && <span>{commentsLine}</span>}
                            {completedLabel && <span>{completedLabel}</span>}
                          </div>

                          <div className="request-footer">
                            <span className={`status-badge ${getStatusColor(request.status)}`}>
                              {statusLabel}
                            </span>
                            {request.status === 'pending' && !request.assignedTo && (
                              <button
                                type="button"
                                className="btn btn-danger btn-xs"
                                onClick={() => handleDeleteRequest(request.id, request.title)}
                              >
                                {t('common.delete') || 'Delete'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <ChartCard title={t('requests.statusOverview')}>
                <div className="request-stats">
                  <div className="stat-item">
                    <div className="stat-value">{stats.pendingCount}</div>
                    <div className="stat-label">{t('requests.pending')}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{stats.inProgressCount}</div>
                    <div className="stat-label">{t('requests.inProgress')}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{stats.completedCount}</div>
                    <div className="stat-label">{t('requests.completed')}</div>
                  </div>
                </div>
              </ChartCard>
            </>
          )}

          {activeTab === 'help' && (
            <div className="support-grid">
              <div className="section-card">
                <div className="action-stack">
                  <button type="button" className="btn btn-secondary btn-xs" onClick={() => setActiveTab('requests')}>
                    {t('requests.backToRequests') || 'Back to requests'}
                  </button>
                </div>
                <div className="card-divider">
                  <div className="section-title">{t('requests.faqTitle') || 'FAQs'}</div>
                </div>
                <div className="record-list">
                  {faqItems.map(item => (
                    <div key={item.id} className="record-item">
                      <button
                        type="button"
                        className="accordion-trigger"
                        onClick={() => toggleFAQ(item.id)}
                      >
                        <span>{item.question}</span>
                        <span className="accordion-trigger-icon">{selectedFAQ === item.id ? '−' : '+'}</span>
                      </button>
                      {selectedFAQ === item.id && (
                        <div className="accordion-content">{item.answer}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="section-card">
                <div className="section-card-header">
                  <div className="section-title">{t('requests.emergencySectionTitle') || 'Emergency & Contact'}</div>
                </div>
                <div className="support-grid">
                  <button
                    type="button"
                    className="btn btn-primary full-width-button"
                    onClick={() => setShowEmergencyModal(true)}
                  >
                    {t('requests.emergencyContacts') || 'Emergency contacts'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary full-width-button"
                    onClick={() => {
                      const confirmCall = globalThis.confirm(
                        formatCallPrompt(t('requests.emergency.contacts.manager.name'), '+27 11 234 5678')
                      );
                      if (confirmCall) {
                        globalThis.location.href = 'tel:+27112345678';
                      }
                    }}
                  >
                    {t('requests.call_manager') || 'Call property manager'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary full-width-button"
                    onClick={() => {
                      globalThis.location.href = '/tenant/messages';
                    }}
                  >
                    {t('requests.sendMessage') || 'Send message'}
                  </button>
                </div>
              </div>

              <div className="section-card">
                <div className="section-title">{t('requests.officeHoursTitle') || 'Office hours'}</div>
                <div className="record-list">
                  <div className="record-item">
                    <div className="record-title">{t('requests.officeHours.weekday') || 'Mon - Fri'}</div>
                    <div className="record-meta">8:00 AM - 6:00 PM</div>
                  </div>
                  <div className="record-item">
                    <div className="record-title">{t('requests.officeHours.saturday') || 'Saturday'}</div>
                    <div className="record-meta">9:00 AM - 2:00 PM</div>
                  </div>
                  <div className="record-item">
                    <div className="record-title">{t('requests.officeHours.sunday') || 'Sunday'}</div>
                    <div className="record-meta">{t('requests.officeHours.closed') || 'Closed'}</div>
                  </div>
                  <div className="card-divider">
                    <div className="section-subtitle">{t('requests.officeLocationTitle') || 'Office location'}</div>
                    <div className="support-text">{t('requests.officeLocationLine1') || '123 Main Street, Blue Hills'}</div>
                    <div className="support-text">{t('requests.officeLocationLine2') || 'Johannesburg, SA 2090'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      
      {showRequestForm && !isOnline && (
        <OfflineMaintenanceForm 
          tenantId={user?.id || '507f1f77bcf86cd799439012'}
          propertyId={leases?.[0]?.propertyId || '507f1f77bcf86cd799439013'}
          onSuccess={(_data) => {
            setShowRequestForm(false);
            showToast(t('requests.submitOffline') || 'Request saved offline. It will be submitted when you\'re back online.', 'info');
          }}
        />
      )}
      
      {showRequestForm && isOnline && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{t('requests.modal.newTitle') || 'New Maintenance Request'}</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowRequestForm(false)}
                disabled={submitting}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitRequest}>
                <div className="form-group">
                  <label>{t('requests.form.title') || 'Title *'}</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder={t('requests.form.titlePlaceholder') || 'Brief description of the issue'}
                  />
                </div>
                
                <div className="form-group">
                  <label>{t('requests.form.description') || 'Description *'}</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={4}
                    placeholder={t('requests.form.descriptionPlaceholder') || 'Detailed description of the issue...'}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>{t('requests.form.priority') || 'Priority'}</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="low">{priorityOptionLabels.low}</option>
                      <option value="medium">{priorityOptionLabels.medium}</option>
                      <option value="high">{priorityOptionLabels.high}</option>
                      <option value="urgent">{priorityOptionLabels.urgent}</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>{t('requests.form.category') || 'Category'}</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="plumbing">{categoryLabels.plumbing}</option>
                      <option value="electrical">{categoryLabels.electrical}</option>
                      <option value="hvac">{categoryLabels.hvac}</option>
                      <option value="appliances">{categoryLabels.appliances}</option>
                      <option value="general">{categoryLabels.general}</option>
                      <option value="pest">{categoryLabels.pest}</option>
                      <option value="security">{categoryLabels.security}</option>
                      <option value="other">{categoryLabels.other}</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('requests.form.photos') || 'Photos (Optional - Max 5)'}</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    disabled={uploadedPhotos.length >= 5}
                    className="upload-input-control"
                  />
                  <p className="form-hint">{t('requests.form.photosHint') || 'Upload photos to help us understand the issue better'}</p>
                  {uploadedPhotos.length > 0 && (
                    <div className="upload-preview-list">
                      {uploadedPhotos.map((file, index) => (
                        <div key={`photo-${index}`} className="upload-preview-item">
                          <span>{file.name.substring(0, 20)}{file.name.length > 20 ? '...' : ''}</span>
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="upload-preview-remove"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn btn-secondary newRequest-btn"
                    onClick={() => setShowRequestForm(false)}
                    disabled={submitting}
                  >
                    {t('common.cancel') || 'Cancel'}
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary newRequest2-btn"
                    disabled={submitting || !formData.title.trim() || !formData.description.trim()}
                  >
                    {submitting ? (t('common.submitting') || 'Submitting...') : (t('common.submit') || 'Submit')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEmergencyModal && (
        <div className="modal-overlay" onClick={() => setShowEmergencyModal(false)}>
          <div className="modal-content modal-scroll" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('requests.emergencyModalTitle') || 'Emergency Contacts'}</h3>
              <button type="button" className="close-btn" onClick={() => setShowEmergencyModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-warning">
                <strong>{t('requests.emergencyWarning') || 'WARNING - Life-threatening emergencies:'}</strong><br />
                {t('requests.emergencyWarningCall') || 'Call 10177 (Fire/Medical) or 10111 (Police) immediately'}
              </div>
              <div className="contact-grid">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="contact-card">
                    <div>
                      <div className="contact-card-title">{contact.name}</div>
                      <div className="contact-card-desc">{contact.description}</div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm full-width-button"
                      onClick={() => {
                        const confirmCall = globalThis.confirm(formatCallPrompt(contact.name, contact.phone));
                        if (confirmCall) {
                          globalThis.location.href = `tel:${contact.phone.replace(/\s/g, '')}`;
                          setShowEmergencyModal(false);
                        }
                      }}
                    >
                      {formatCallLabel(contact.phone)}
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-secondary full-width-button modal-close-action"
                onClick={() => setShowEmergencyModal(false)}
              >
                {t('common.close') || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default MaintenanceRequestsPage;
