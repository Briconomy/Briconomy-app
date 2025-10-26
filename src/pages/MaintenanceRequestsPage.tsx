import React, { useState, useMemo } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import OfflineMaintenanceForm from '../components/OfflineMaintenanceForm.tsx';
import Icon from '../components/Icon.tsx';
import { useOffline } from '../hooks/useOffline.ts';
import { maintenanceApi, leasesApi, formatDate, useApi } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

function MaintenanceRequestsPage() {
  const { t } = useLanguage();
  const { isOnline, storeOfflineData, syncNow } = useOffline();
  const { user } = useAuth();
  
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
    if (!confirm(`Are you sure you want to delete the request "${requestTitle}"?`)) {
      return;
    }

    try {
      await maintenanceApi.delete(requestId);
      await refetchRequests();
      alert('Request deleted successfully');
    } catch (error) {
      console.error('[MaintenanceRequestsPage] Error deleting request:', error);
      alert('Failed to delete request. Please try again.');
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
      const currentLease = leases?.[0];

      // #COMPLETION_DRIVE: Extract only IDs from lease objects, not full objects
      // #SUGGEST_VERIFY: Verify lease objects contain _id field for ID extraction
      const requestData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        status: 'pending',
        tenantId: user?.id || '507f1f77bcf86cd799439012',
        unitId: currentLease?.unitId?._id || currentLease?.unitId || null,
        propertyId: currentLease?.propertyId?._id || currentLease?.propertyId || null,
        photos: formData.photos,
        location: currentLease?.propertyId?.address || 'Unknown',
        unitNumber: currentLease?.unitId?.unitNumber || 'Unknown',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (isOnline) {
        await maintenanceApi.create(requestData);
        await refetchRequests();

        // #COMPLETION_DRIVE: Wait for refetch to render before closing form
        // #SUGGEST_VERIFY: 500ms delay ensures data appears in list immediately
        await new Promise(resolve => setTimeout(resolve, 500));
        alert('Maintenance request submitted successfully!');
      } else {
        await storeOfflineData('maintenance_request', requestData);
        alert('Request saved offline. It will be submitted when you\'re back online.');
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
      alert('Failed to submit request. Please try again.');
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

  const currentLease = leases?.[0];

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
              Requests
            </button>
            <button
              type="button"
              className={`tab-button ${activeTab === 'help' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('help')}
            >
              Help & Support
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
                <div className="section-card-header">
                  <div className="section-header-content">
                    <div className="section-title-row">
                      <div className="section-title">{t('requests.yourRequests')}</div>
                      <span className={`status-pill ${isOnline ? 'success' : 'warning'}`}>
                        {isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                    <div className="section-subtitle">{t('requests.subtitle')}</div>
                  </div>
                  <div className="action-stack">
                    {!isOnline && (
                      <button type="button" className="btn btn-secondary btn-xs" onClick={() => syncNow()}>
                        Sync
                      </button>
                    )}
                    <button type="button" className="btn btn-primary btn-sm2" onClick={() => setShowRequestForm(true)}>
                      {t('requests.newRequest')}
                    </button>
                  </div>
                </div>

                {requestsData.length === 0 ? (
                  <div className="empty-state-card">
                    <Icon name="maintenance" alt="Maintenance" size={40} />
                    <div className="empty-state-title">{t('requests.noRequestsFound')}</div>
                    <div className="empty-state-text">Log a request to notify your maintenance team.</div>
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
                    {requestsData.map((request) => (
                      <div key={request.id} className="request-card">
                        <div className="request-card-header">
                          <div>
                            <div className="record-title">{request.title}</div>
                            <div className="request-description">{request.description}</div>
                          </div>
                          <span className={getPriorityBadgeClass(request.priority)}>
                            {request.priority.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        <div className="request-meta">
                          <span>Created {formatDate(request.createdAt)}</span>
                          {request.location && (
                            <span>
                              {request.location}
                              {request.unitNumber ? ` • Unit ${request.unitNumber}` : ''}
                            </span>
                          )}
                          {request.assignedTo && (
                            <span>Assigned to {request.assignedTo}</span>
                          )}
                          {request.category && (
                            <span>Category: {request.category}</span>
                          )}
                          {request.photos && request.photos.length > 0 && (
                            <span>
                              {request.photos.length} attachment{request.photos.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {request.comments && request.comments.length > 0 && (
                            <span>
                              {request.comments.length} comment{request.comments.length > 1 ? 's' : ''}
                            </span>
                          )}
                          {request.status === 'completed' && request.completedAt && (
                            <span>Completed {formatDate(request.completedAt)}</span>
                          )}
                        </div>

                        <div className="request-footer">
                          <span className={`status-badge ${getStatusColor(request.status)}`}>
                            {request.status.replace('_', ' ').toUpperCase()}
                          </span>
                          {request.status === 'pending' && !request.assignedTo && (
                            <button
                              type="button"
                              className="btn btn-danger btn-xs"
                              onClick={() => handleDeleteRequest(request.id, request.title)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <ChartCard title={t('requests.statusOverview')}>
                <div className="request-stats">
                  <div className="stat-item">
                    <div className="stat-value">{stats.pendingCount}</div>
                    <div className="stat-label">Pending</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{stats.inProgressCount}</div>
                    <div className="stat-label">In Progress</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{stats.completedCount}</div>
                    <div className="stat-label">Completed</div>
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
                    Back to requests
                  </button>
                </div>
                <div className="card-divider">
                  <div className="section-title">FAQs</div>
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
                  <div className="section-title">Emergency & Contact</div>
                </div>
                <div className="support-grid">
                  <button
                    type="button"
                    className="btn btn-primary full-width-button"
                    onClick={() => setShowEmergencyModal(true)}
                  >
                    Emergency contacts
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary full-width-button"
                    onClick={() => {
                      const confirmCall = globalThis.confirm('Call property manager?\n\n+27 11 234 5678');
                      if (confirmCall) {
                        globalThis.location.href = 'tel:+27112345678';
                      }
                    }}
                  >
                    Call property manager
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary full-width-button"
                    onClick={() => {
                      globalThis.location.href = '/tenant/messages';
                    }}
                  >
                    Send message
                  </button>
                </div>
              </div>

              <div className="section-card">
                <div className="section-title">Office hours</div>
                <div className="record-list">
                  <div className="record-item">
                    <div className="record-title">Mon - Fri</div>
                    <div className="record-meta">8:00 AM - 6:00 PM</div>
                  </div>
                  <div className="record-item">
                    <div className="record-title">Saturday</div>
                    <div className="record-meta">9:00 AM - 2:00 PM</div>
                  </div>
                  <div className="record-item">
                    <div className="record-title">Sunday</div>
                    <div className="record-meta">Closed</div>
                  </div>
                  <div className="card-divider">
                    <div className="section-subtitle">Office location</div>
                    <div className="support-text">123 Main Street, Blue Hills</div>
                    <div className="support-text">Johannesburg, SA 2090</div>
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
            alert('Request saved offline. It will be submitted when you\'re back online.');
          }}
        />
      )}
      
      {showRequestForm && isOnline && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>New Maintenance Request</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setShowRequestForm(false)}
                disabled={submitting}
              >
                ×
              </button>
            </div>
            {submitting && (
              <div className="modal-progress-banner">
                Submitting your request...
              </div>
            )}
            <div className="modal-body">
              <form onSubmit={handleSubmitRequest}>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Brief description of the issue"
                  />
                </div>
                
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={4}
                    placeholder="Detailed description of the issue..."
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="hvac">HVAC</option>
                      <option value="appliances">Appliances</option>
                      <option value="general">General</option>
                      <option value="pest">Pest Control</option>
                      <option value="security">Security</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Photos (Optional - Max 5)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    disabled={uploadedPhotos.length >= 5}
                    className="upload-input-control"
                  />
                  <p className="form-hint">Upload photos to help us understand the issue better</p>
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
                    className="btn btn-secondary"
                    onClick={() => setShowRequestForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting || !formData.title.trim() || !formData.description.trim()}
                  >
                    {submitting ? 'Submitting...' : 'Submit'}
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
              <h3>Emergency Contacts</h3>
              <button type="button" className="close-btn" onClick={() => setShowEmergencyModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-warning">
                <strong>WARNING - Life-threatening emergencies:</strong><br />
                Call <strong>10177</strong> (Fire/Medical) or <strong>10111</strong> (Police) immediately
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
                        const confirmCall = globalThis.confirm(`Call ${contact.name}?\n\n${contact.phone}`);
                        if (confirmCall) {
                          globalThis.location.href = `tel:${contact.phone.replace(/\s/g, '')}`;
                          setShowEmergencyModal(false);
                        }
                      }}
                    >
                      Call: {contact.phone}
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-secondary full-width-button modal-close-action"
                onClick={() => setShowEmergencyModal(false)}
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
}

export default MaintenanceRequestsPage;
