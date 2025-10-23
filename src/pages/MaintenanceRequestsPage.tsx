import React, { useState, useMemo } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import OfflineMaintenanceForm from '../components/OfflineMaintenanceForm.tsx';
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
      const requestData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        status: 'pending',
        tenantId: user?.id || '507f1f77bcf86cd799439012',
        unitId: currentLease?.unitId || null,
        propertyId: currentLease?.propertyId || null,
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
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-progress';
      case 'completed': return 'status-paid';
      default: return 'status-pending';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-700 font-bold';
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return '!';
      case 'high': return '!!';
      case 'medium': return '•';
      case 'low': return '·';
      default: return '-';
    }
  };

  if (requestsLoading || leasesLoading) {
return (
       <div className="app-container mobile-only">
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
     <div className="app-container mobile-only">
  <TopNav showLogout showBackButton/>
       
       <div className="main-content">
        <div className="page-header">
          <div className="page-title">{t('requests.title')}</div>
          <div className="page-subtitle">{t('requests.subtitle')}</div>
        </div>
        
        {activeTab === 'requests' && (
          <>
            <div className="dashboard-grid">
              <StatCard value={stats.pendingCount} label={t('requests.pending')} />
              <StatCard value={stats.inProgressCount} label={t('requests.inProgress')} />
              <StatCard value={stats.completedCount} label={t('requests.completed')} />
              <StatCard value={requestsData.length} label={t('requests.total')} />
            </div>

            {currentLease && (
              <div className="unit-info-card">
                <h3>{t('requests.yourUnit')}</h3>
                <div className="unit-details">
                  <p><strong>{t('payments.unit')}</strong> {currentLease.unitId?.unitNumber || 'N/A'}</p>
                  <p><strong>{t('payments.property')}</strong> {currentLease.propertyId?.name || 'N/A'}</p>
                  <p><strong>{t('requests.address')}</strong> {currentLease.propertyId?.address || 'N/A'}</p>
                </div>
              </div>
            )}

            <div className="data-table">
              <div className="table-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div className="table-title">{t('requests.yourRequests')}</div>
                {/* Offline Status Indicator */}
                <div className="flex items-center space-x-2 ml-4" >
                  <span className={`px-2 py-1 rounded text-xs ${isOnline ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    {isOnline ? '🟢 Online' : '🟡 Offline'}
                  </span>
                  {!isOnline && (
                    <button
                      type="button"
                      onClick={() => syncNow()}
                      className="btn btn-secondary btn-xs"
                      title="Sync when back online"
                    >
                       Sync
                    </button>
                  )}
                </div>
                {requestsData.length > 0 && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button 
                      type="button"
                      className="btn btn-primary btn-sm2"
                      onClick={() => setShowRequestForm(true)}
                    >
                      {t('requests.newRequest')}
                    </button>
                  </div>
                )}
              </div>
              
              {requestsData.length === 0 ? (
                <div className="empty-state">
                  <p>{t('requests.noRequestsFound')}</p>
                  <button 
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setShowRequestForm(true)}
                  >
                    Maintenance Request
                  </button>
                </div>
              ) : (
                requestsData.map((request) => (
                  <div key={request.id} className="list-item">
                    <div className="item-info">
                      <div className="request-header">
                        <h4>{request.title}</h4>
                        <span className={`priority-badge ${getPriorityColor(request.priority)}`}>
                          {getPriorityIcon(request.priority)} {request.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{request.description}</p>
                      <div className="request-meta">
                        <span className="text-xs text-gray-500">
                          {formatDate(request.createdAt)} 
                        </span>
                        <br />
                        {request.location && (
                          <>
                            <span className="text-xs text-blue-600">
                               {request.location} {request.unitNumber && `- Unit ${request.unitNumber}`}
                            </span>
                            <br />
                          </>
                        )}
                        {request.assignedTo && (
                          <>
                            <span className="text-xs text-blue-600">
                               Assigned to: {request.assignedTo}
                            </span>
                            <br />
                          </>
                        )}
                        {request.category && (
                          <span className="text-xs text-purple-600">
                             Category: {request.category}
                          </span>
                        )}
                        {request.photos && request.photos.length > 0 && (
                          <>
                            <br />
                            <span className="text-xs text-green-600">
                               {request.photos.length} photo{request.photos.length > 1 ? 's' : ''} attached
                            </span>
                          </>
                        )}
                        {request.comments && request.comments.length > 0 && (
                          <>
                            <br />
                            <span className="text-xs text-orange-600">
                               {request.comments.length} comment{request.comments.length > 1 ? 's' : ''}
                            </span>
                          </>
                        )}
                      </div>
                      {request.status === 'completed' && request.completedAt && (
                        <div className="completion-info">
                          <span className="text-xs text-green-600">
                             Completed on {formatDate(request.completedAt)}
                          </span>
                          {request.repairPhotos && request.repairPhotos.length > 0 && (
                            <span className="text-xs text-green-600" style={{ marginLeft: '12px' }}>
                               {request.repairPhotos.length} repair photo{request.repairPhotos.length > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="item-actions">
                      <span className={`status-badge ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))
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
          <div className="help-support-section">
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveTab('requests')}
              style={{ marginBottom: '12px' }}
            >
              ← Back
            </button>

            {/* FAQ Section */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '600' }}>FAQs</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
            </div>

            {/* Emergency & Contact */}
            <div className="card" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '600' }}>Emergency & Contact</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowEmergencyModal(true)}
                  style={{ width: '100%', padding: '12px', fontSize: '14px' }}
                >
                  Emergency Contacts
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    const confirmCall = globalThis.confirm('Call property manager?\n\n+27 11 234 5678');
                    if (confirmCall) {
                      globalThis.location.href = 'tel:+27112345678';
                    }
                  }}
                  style={{ width: '100%', padding: '12px', fontSize: '14px' }}
                >
                  Call Property Manager
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => globalThis.location.href = '/tenant/messages'}
                  style={{ width: '100%', padding: '12px', fontSize: '14px' }}
                >
                  Send Message
                </button>
              </div>
            </div>

            {/* Office Hours */}
            <div className="card">
              <h3 style={{ fontSize: '16px', marginBottom: '12px', fontWeight: '600' }}>Office Hours</h3>
              <div style={{ fontSize: '13px', color: '#666' }}>
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
                style={{ opacity: submitting ? 0.5 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
              >
                ×
              </button>
            </div>
            {submitting && (
              <div style={{
                background: '#e3f2fd',
                padding: '12px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#1976d2',
                borderBottom: '1px solid #90caf9'
              }}>
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
                    style={{ marginBottom: '8px' }}
                  />
                  <p className="text-xs text-gray-500">Upload photos to help us understand the issue better</p>
                  {uploadedPhotos.length > 0 && (
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {uploadedPhotos.map((file, index) => (
                        <div key={`photo-${index}`} style={{ 
                          position: 'relative', 
                          display: 'inline-block',
                          padding: '8px',
                          background: '#f0f0f0',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}>
                          <span>{file.name.substring(0, 20)}{file.name.length > 20 ? '...' : ''}</span>
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            style={{
                              marginLeft: '8px',
                              background: '#ff4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              lineHeight: '1'
                            }}
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
                    style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
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
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default MaintenanceRequestsPage;
