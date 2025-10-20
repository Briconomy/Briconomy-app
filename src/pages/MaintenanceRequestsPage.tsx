import React, { useState, useEffect, useMemo } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import OfflineMaintenanceForm from '../components/OfflineMaintenanceForm.tsx';
import { useOffline } from '../hooks/useOffline.ts';
import { maintenanceApi, leasesApi, formatDate, useApi } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import Icon from '../components/Icon.tsx';

function MaintenanceRequestsPage() {
  const { t } = useLanguage();
  const { isOnline, storeOfflineData, syncNow } = useOffline();
  
  const [user, setUser] = useState<{ id?: string } | null>(null);
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
  
  // Help Support State
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<string | null>(null);
  const [tickets, setTickets] = useState([]);
  const [helpSubmitting, setHelpSubmitting] = useState(false);
  const [helpFormData, setHelpFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });

  const faqItems = [
    {
      id: '1',
      question: 'How do I pay my rent?',
      answer: 'You can pay your rent through the Payments page. We accept bank transfers, EFT, and credit/debit cards. Simply select your preferred payment method and follow the instructions.',
      category: 'Payments'
    },
    {
      id: '2',
      question: 'How do I report a maintenance issue?',
      answer: 'Go to the Requests page and click "New Request". Fill in the details of the issue, select the priority level, and submit. Our maintenance team will be notified immediately.',
      category: 'Maintenance'
    },
    {
      id: '3',
      question: 'Can I view my lease agreement?',
      answer: 'Yes, you can view your lease agreement in the Documents section of your Profile page. All your important documents are stored there for easy access.',
      category: 'Documents'
    },
    {
      id: '4',
      question: 'How do I update my contact information?',
      answer: 'You can update your contact information by going to your Profile page and clicking the "Edit" button. Make sure to keep your emergency contact information up to date.',
      category: 'Profile'
    },
    {
      id: '5',
      question: 'What if I lose my keys?',
      answer: 'In case of lost keys, please contact us immediately through the emergency contact or submit a high-priority maintenance request. There may be a replacement fee for new keys.',
      category: 'Emergency'
    },
    {
      id: '6',
      question: 'How do I renew my lease?',
      answer: 'Your lease renewal options will be available in your profile before your current lease expires. You can also contact your property manager to discuss renewal options.',
      category: 'Lease'
    }
  ];

  const emergencyContacts = [
    { name: 'Property Manager', phone: '+27 11 234 5678', type: 'Primary' },
    { name: 'Emergency Maintenance', phone: '+27 11 234 5679', type: '24/7' },
    { name: 'Security', phone: '+27 11 234 5680', type: '24/7' },
    { name: 'Fire Department', phone: '10177', type: 'Emergency' },
    { name: 'Police', phone: '10111', type: 'Emergency' },
    { name: 'Ambulance', phone: '10177', type: 'Emergency' }
  ];

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!helpFormData.subject || !helpFormData.message) return;

    setHelpSubmitting(true);
    
    setTimeout(() => {
      const newTicket = {
        id: Date.now().toString(),
        subject: helpFormData.subject,
        message: helpFormData.message,
        status: 'open',
        createdAt: new Date().toISOString()
      };

      setTickets(prev => [newTicket, ...prev]);
      setShowContactForm(false);
      setHelpSubmitting(false);
      setHelpFormData({
        subject: '',
        message: '',
        priority: 'medium'
      });
    }, 1000);
  };

  const toggleFAQ = (id: string) => {
    setSelectedFAQ(selectedFAQ === id ? null : id);
  };

  const getFAQByCategory = (category: string) => {
    return faqItems.filter(item => item.category === category);
  };

  const getHelpStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'status-pending';
      case 'in_progress': return 'status-progress';
      case 'resolved': return 'status-paid';
      default: return 'status-pending';
    }
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

  const canSubmitRequest = () => {
    return formData.title.trim() && formData.description.trim() && !submitting;
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
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowRequestForm(true)}
                    >
                      {t('requests.newRequest')}
                    </button>
                    <button 
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        console.log('[MaintenanceRequestsPage] Manual refresh triggered');
                        refetchRequests();
                      }}
                      title="Refresh maintenance requests"
                    >
                       Refresh
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
                    {t('requests.createFirstRequest')}
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

            <div className="quick-actions">
              <ActionCard
                onClick={() => setShowRequestForm(true)}
                icon={<Icon name="issue" alt="Report Issue" />}
                title={t('requests.reportIssue')}
                description={t('requests.createNewRequest')}
              />
              <ActionCard
                to="/tenant/messages"
                icon={<Icon name="contact" alt="Contact Caretaker" />}
                title={t('requests.contactCaretaker')}
                description={t('requests.directCommunication')}
              />
              <ActionCard
                onClick={() => setActiveTab('help')}
                icon={<Icon name="emergency" alt="Emergency Info" />}
                title={t('requests.emergencyInfo')}
                description={t('requests.emergencyContacts')}
              />
              <ActionCard
                onClick={() => setActiveTab('help')}
                icon={<Icon name="help" alt="Help & Support" />}
                title="Help & Support"
                description="FAQs and contact support"
              />
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
          <div className="help-support-content">
            <div className="tab-navigation">
              <button
                type="button"
                className={`tab-btn ${selectedFAQ === null || selectedFAQ.startsWith('1') || selectedFAQ.startsWith('2') || selectedFAQ.startsWith('3') || selectedFAQ.startsWith('4') ? 'active' : ''}`}
                onClick={() => setSelectedFAQ(null)}
              >
                FAQ
              </button>
              <button
                type="button"
                className={`tab-btn ${selectedFAQ === 'contact' ? 'active' : ''}`}
                onClick={() => setSelectedFAQ('contact')}
              >
                Contact Us
              </button>
              <button
                type="button"
                className={`tab-btn ${selectedFAQ === 'emergency' ? 'active' : ''}`}
                onClick={() => setSelectedFAQ('emergency')}
              >
                Emergency
              </button>
            </div>

            <div className="tab-content">
              {(selectedFAQ === null || selectedFAQ.startsWith('1') || selectedFAQ.startsWith('2') || selectedFAQ.startsWith('3') || selectedFAQ.startsWith('4')) && (
                <div className="faq-section">
                  <h3>Frequently Asked Questions</h3>
                  
                  <div className="faq-categories">
                    <div className="faq-category">
                      <h4>Payments</h4>
                      {getFAQByCategory('Payments').map(item => (
                        <div key={item.id} className="faq-item">
                          <button
                            type="button"
                            className="faq-question"
                            onClick={() => toggleFAQ(item.id)}
                          >
                            {item.question}
                            <span className="faq-icon">{selectedFAQ === item.id ? '−' : '+'}</span>
                          </button>
                          {selectedFAQ === item.id && (
                            <div className="faq-answer">{item.answer}</div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="faq-category">
                      <h4>Maintenance</h4>
                      {getFAQByCategory('Maintenance').map(item => (
                        <div key={item.id} className="faq-item">
                          <button
                            type="button"
                            className="faq-question"
                            onClick={() => toggleFAQ(item.id)}
                          >
                            {item.question}
                            <span className="faq-icon">{selectedFAQ === item.id ? '−' : '+'}</span>
                          </button>
                          {selectedFAQ === item.id && (
                            <div className="faq-answer">{item.answer}</div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="faq-category">
                      <h4>Documents & Profile</h4>
                      {getFAQByCategory('Documents').concat(getFAQByCategory('Profile')).map(item => (
                        <div key={item.id} className="faq-item">
                          <button
                            type="button"
                            className="faq-question"
                            onClick={() => toggleFAQ(item.id)}
                          >
                            {item.question}
                            <span className="faq-icon">{selectedFAQ === item.id ? '−' : '+'}</span>
                          </button>
                          {selectedFAQ === item.id && (
                            <div className="faq-answer">{item.answer}</div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="faq-category">
                      <h4>Lease & Emergency</h4>
                      {getFAQByCategory('Lease').concat(getFAQByCategory('Emergency')).map(item => (
                        <div key={item.id} className="faq-item">
                          <button
                            type="button"
                            className="faq-question"
                            onClick={() => toggleFAQ(item.id)}
                          >
                            {item.question}
                            <span className="faq-icon">{selectedFAQ === item.id ? '−' : '+'}</span>
                          </button>
                          {selectedFAQ === item.id && (
                            <div className="faq-answer">{item.answer}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selectedFAQ === 'contact' && (
                <div className="contact-section">
                  <h3>Contact Support</h3>
                  
                  <div className="contact-info">
                    <div className="contact-card">
                      <h4>Phone Support</h4>
                      <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p>Saturday: 9:00 AM - 2:00 PM</p>
                      <p>Sunday: Closed</p>
                      <p><strong>Primary:</strong> +27 11 234 5678</p>
                    </div>

                    <div className="contact-card">
                      <h4>Email Support</h4>
                      <p>For general inquiries:</p>
                      <p><strong>support@briconomy.com</strong></p>
                      <p>For urgent matters:</p>
                      <p><strong>urgent@briconomy.com</strong></p>
                    </div>

                    <div className="contact-card">
                      <h4>Office Location</h4>
                      <p>123 Main Street</p>
                      <p>Blue Hills, Johannesburg</p>
                      <p>South Africa, 2090</p>
                      <p>Office Hours: 8:00 AM - 5:00 PM</p>
                    </div>
                  </div>

                  <div className="support-tickets">
                    <div className="section-header">
                      <h4>Your Support Tickets</h4>
                      <button 
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => setShowContactForm(true)}
                      >
                        New Ticket
                      </button>
                    </div>

                    {tickets.length === 0 ? (
                      <div className="empty-state">
                        <p>No support tickets yet</p>
                        <button 
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setShowContactForm(true)}
                        >
                          Create Your First Ticket
                        </button>
                      </div>
                    ) : (
                      <div className="tickets-list">
                        {tickets.map(ticket => (
                          <div key={ticket.id} className="ticket-item">
                            <div className="ticket-info">
                              <h4>{ticket.subject}</h4>
                              <p className="ticket-message">{ticket.message}</p>
                              <p className="ticket-meta">
                                {new Date(ticket.createdAt).toLocaleDateString()} • 
                                <span className={`status-badge ${getHelpStatusColor(ticket.status)}`}>
                                  {ticket.status.replace('_', ' ').toUpperCase()}
                                </span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedFAQ === 'emergency' && (
                <div className="emergency-section">
                  <h3>Emergency Contacts</h3>
                  <div className="emergency-warning">
                    <strong>WARNING: For life-threatening emergencies, call 10177 (Ambulance/Fire) or 10111 (Police) immediately</strong>
                  </div>

                  <div className="emergency-contacts-grid">
                    {emergencyContacts.map(contact => (
                      <div key={contact.name} className="emergency-contact-card">
                        <div className="contact-type">{contact.type}</div>
                        <h4>{contact.name}</h4>
                        <p className="contact-phone">
                          <a href={`tel:${contact.phone.replace(/\s/g, '')}`}>
                            {contact.phone}
                          </a>
                        </p>
                        <button 
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => globalThis.location.href = `tel:${contact.phone.replace(/\s/g, '')}`}
                        >
                          Call Now
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="emergency-procedures">
                    <h4>Emergency Procedures</h4>
                    <div className="procedure-list">
                      <div className="procedure-item">
                        <h5>Fire Emergency</h5>
                        <ol>
                          <li>Evacuate immediately using nearest exit</li>
                          <li>Call Fire Department: 10177</li>
                          <li>Notify building management</li>
                          <li>Do not use elevators</li>
                          <li>Meet at designated assembly point</li>
                        </ol>
                      </div>

                      <div className="procedure-item">
                        <h5>Medical Emergency</h5>
                        <ol>
                          <li>Call Ambulance: 10177</li>
                          <li>Provide first aid if trained</li>
                          <li>Notify emergency contacts</li>
                          <li>Inform property management</li>
                          <li>Stay with the person until help arrives</li>
                        </ol>
                      </div>

                      <div className="procedure-item">
                        <h5>Security Emergency</h5>
                        <ol>
                          <li>Call Police: 10111</li>
                          <li>Lock yourself in a safe room</li>
                          <li>Notify building security</li>
                          <li>Do not confront intruders</li>
                          <li>Wait for authorities to arrive</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
              <button type="button" className="close-btn" onClick={() => setShowRequestForm(false)}>×</button>
            </div>
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

      {showContactForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Support Ticket</h3>
              <button 
                type="button"
                className="close-btn"
                onClick={() => setShowContactForm(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitTicket}>
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    value={helpFormData.subject}
                    onChange={(e) => setHelpFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={helpFormData.priority}
                    onChange={(e) => setHelpFormData(prev => ({ ...prev, priority: e.target.value }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    value={helpFormData.message}
                    onChange={(e) => setHelpFormData(prev => ({ ...prev, message: e.target.value }))}
                    rows={6}
                    placeholder="Please provide detailed information about your issue..."
                    required
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowContactForm(false)}
                    disabled={helpSubmitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    disabled={!helpFormData.subject || !helpFormData.message || helpSubmitting}
                  >
                    {helpSubmitting ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default MaintenanceRequestsPage;
