import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import SearchFilter from '../components/SearchFilter.tsx';
import Modal from '../components/Modal.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { managerApi } from '../services/api.ts';

interface PendingApplication {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profile: {
    property?: string;
    unitNumber?: string;
    occupation?: string;
    monthlyIncome?: string;
    emergencyContact?: string | {
      name: string;
      phone: string;
      relationship: string;
    };
    moveInDate?: string;
  };
  property?: {
    id: string;
    name: string;
    address: string;
  };
  appliedAt?: string;
  status: string;
}

function ManagerApplicationsPage() {
  const { t } = useLanguage();
  const { user: _user } = useAuth();
  const _navigate = useNavigate();
  const [applications, setApplications] = useState<PendingApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<PendingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingUserId, setRejectingUserId] = useState<string>('');
  const [rejectingUserName, setRejectingUserName] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState('');

  const navItems = [
    { path: '/manager', label: t('nav.dashboard'), icon: 'performanceAnalytics' },
    { path: '/manager/properties', label: t('nav.properties'), icon: 'properties' },
    { path: '/manager/leases', label: t('nav.leases'), icon: 'lease' },
    { path: '/manager/payments', label: t('nav.payments'), icon: 'payment' }
  ];

  useEffect(() => {
    if (_user?.id) {
      loadApplications();
    }
  }, [_user?.id]);

  const loadApplications = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!_user?.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }
      
      console.log('[Manager] Fetching applications...');
      const data = await managerApi.getPendingApplications(_user.id);
      console.log('[Manager] Got', data.length, 'applications');
      setApplications(data);
      setFilteredApplications(data);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError('Failed to load applications. Using sample data.');
      
      const dummyData = [
        {
          id: "1",
          fullName: "Sarah Johnson",
          email: "sarah.johnson@email.com",
          phone: "+27-82-555-0123",
          profile: {
            occupation: "Software Engineer",
            monthlyIncome: "45000",
            unitNumber: "2B",
            moveInDate: "2024-11-15",
            emergencyContact: "John Johnson (+27-82-555-0124) - Brother"
          },
          property: {
            id: "prop1",
            name: "Blue Hills Apartments",
            address: "123 Main St, Cape Town, 8001"
          },
          appliedAt: "2024-10-18T10:00:00Z",
          status: "pending"
        },
        {
          id: "2", 
          fullName: "Michael Chen",
          email: "michael.chen@email.com",
          phone: "+27-83-555-0456",
          profile: {
            occupation: "Marketing Manager",
            monthlyIncome: "38000",
            unitNumber: "3A", 
            moveInDate: "2024-12-01",
            emergencyContact: "Lisa Chen (+27-83-555-0457) - Wife"
          },
          property: {
            id: "prop2",
            name: "Sunset Towers", 
            address: "789 Beach Rd, Port Elizabeth, 6001"
          },
          appliedAt: "2024-10-19T14:30:00Z",
          status: "pending"
        },
        {
          id: "3",
          fullName: "Amanda Williams", 
          email: "amanda.williams@email.com",
          phone: "+27-84-555-0789",
          profile: {
            occupation: "Graphic Designer",
            monthlyIncome: "32000",
            unitNumber: "1A",
            moveInDate: "2024-11-30", 
            emergencyContact: "Robert Williams (+27-84-555-0790) - Father"
          },
          property: {
            id: "prop1",
            name: "Blue Hills Apartments",
            address: "123 Main St, Cape Town, 8001"  
          },
          appliedAt: "2024-10-20T09:15:00Z",
          status: "pending"
        }
      ];
      
      setApplications(dummyData);
      setFilteredApplications(dummyData);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredApplications(applications);
    } else {
      const filtered = applications.filter(app => 
        app.fullName.toLowerCase().includes(term.toLowerCase()) ||
        app.email.toLowerCase().includes(term.toLowerCase()) ||
        app.property?.name.toLowerCase().includes(term.toLowerCase()) ||
        app.profile.occupation?.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredApplications(filtered);
    }
  };

  const handleApprove = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to approve ${userName}'s application?`)) {
      return;
    }

    try {
      setProcessing(userId);
      setError('');
      setSuccess('');
      
      if (!_user?.id) {
        setError('User not authenticated');
        return;
      }
      
      await managerApi.approveApplication(userId, _user.id);
      
      setSuccess(`${userName} ${t('managerApplications.approveSuccess')}`);
      setApplications(applications.filter(u => u.id !== userId));
      setFilteredApplications(filteredApplications.filter(u => u.id !== userId));
    } catch (err) {
      setError(`${t('managerApplications.approveFailed')} ${userName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleRejectClick = (userId: string, userName: string) => {
    setRejectingUserId(userId);
    setRejectingUserName(userName);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    try {
      setProcessing(rejectingUserId);
      setError('');
      setSuccess('');
      
      if (!_user?.id) {
        setError('User not authenticated');
        return;
      }
      
      await managerApi.rejectApplication(rejectingUserId, _user.id, rejectionReason);
      
      setSuccess(`${rejectingUserName}${t('managerApplications.rejectSuccess')}`);
      setApplications(applications.filter(u => u.id !== rejectingUserId));
      setFilteredApplications(filteredApplications.filter(u => u.id !== rejectingUserId));
      setShowRejectModal(false);
    } catch (err) {
      setError(`${t('managerApplications.rejectFailed')} ${rejectingUserName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessing(null);
      setRejectingUserId('');
      setRejectingUserName('');
      setRejectionReason('');
    }
  };

  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setRejectingUserId('');
    setRejectingUserName('');
    setRejectionReason('');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseInt(amount) : amount;
    return `R ${num.toLocaleString()}`;
  };

  // Calculate stats
  const totalApplications = applications.length;
  const avgIncome = applications.length > 0 
    ? Math.round(applications.reduce((sum, app) => sum + parseInt(app.profile.monthlyIncome || '0'), 0) / applications.length)
    : 0;
  const topProperty = applications.length > 0
    ? applications.reduce((acc, app) => {
        const propertyName = app.property?.name || 'Unknown';
        acc[propertyName] = (acc[propertyName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    : {};
  const mostPopularProperty = Object.keys(topProperty).length > 0 
    ? Object.keys(topProperty).reduce((a, b) => topProperty[a] > topProperty[b] ? a : b)
    : t('managerApplications.none');

  // Handle loading state
  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton backLink="/manager" showLogout />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t('managerApplications.loading')}</p>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }



  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton backLink="/manager" showLogout />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">{t('managerApplications.title')}</div>
          <div className="page-subtitle">{t('managerApplications.subtitle')}</div>
        </div>

        {error && (
          <div className="error-message" style={{ marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message" style={{ marginBottom: '16px' }}>
            {success}
          </div>
        )}

        <div className="dashboard-grid">
          <StatCard value={totalApplications.toString()} label={t('managerApplications.totalApplications')} />
          <StatCard value={filteredApplications.length.toString()} label={t('managerApplications.showing')} />
          <StatCard value={formatCurrency(avgIncome)} label={t('managerApplications.avgIncome')} />
          <StatCard value={mostPopularProperty} label={t('managerApplications.popularProperty')} />
        </div>

        <SearchFilter
          placeholder={t('managerApplications.searchPlaceholder')}
          onSearch={handleSearch}
          filters={[]}
          onFilterChange={() => {}}
        />

        {filteredApplications.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            background: '#f8f9fa',
            borderRadius: '12px',
            margin: '20px 0'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ marginBottom: '8px', color: '#2c3e50' }}>
              {searchTerm ? t('managerApplications.noMatching') : t('managerApplications.noPending')}
            </h3>
            <p style={{ color: '#6c757d' }}>
              {searchTerm 
                ? `${t('managerApplications.noMatchText')} "${searchTerm}"`
                : t('managerApplications.allProcessed')
              }
            </p>
            {searchTerm && (
              <button 
                type="button"
                onClick={() => handleSearch('')}
                style={{
                  marginTop: '20px',
                  padding: '12px 24px',
                  background: '#162F1B',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {t('managerApplications.clearSearch')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="results-info">
              <span>{filteredApplications.length} {filteredApplications.length === 1 ? t('managerApplications.application') : t('managerApplications.applications')}</span>
            </div>

            <div className="applications-list">
              {filteredApplications.map((application) => (
                <div 
                  key={application.id} 
                  className="application-card"
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '2px solid #e9ecef'
                  }}
                >
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>
                          {application.fullName}
                        </h3>
                        <p style={{ margin: '0', fontSize: '14px', color: '#6c757d' }}>
                          {t('managerApplications.applied')}: {formatDate(application.appliedAt)}
                        </p>
                      </div>
                      <span style={{
                        background: '#fff3cd',
                        color: '#856404',
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {t('managerApplications.pending')}
                      </span>
                    </div>
                    
                    {application.property && (
                      <div style={{
                        background: '#162F1B',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '12px'
                      }}>
                        <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>{t('managerApplications.appliedFor')}</div>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>{application.property.name}</div>
                        <div style={{ fontSize: '14px', opacity: 0.9 }}>{application.property.address}</div>
                      </div>
                    )}
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr', 
                    gap: '12px',
                    marginBottom: '16px',
                    padding: '16px',
                    background: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>{t('managerApplications.email')}</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>{application.email}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>{t('managerApplications.phone')}</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>{application.phone}</div>
                    </div>
                    {application.profile.unitNumber && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>{t('managerApplications.preferredUnit')}</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>{application.profile.unitNumber}</div>
                      </div>
                    )}
                    {application.profile.occupation && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>{t('managerApplications.occupation')}</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>{application.profile.occupation}</div>
                      </div>
                    )}
                    {application.profile.monthlyIncome && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>{t('managerApplications.monthlyIncome')}</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>{formatCurrency(application.profile.monthlyIncome)}</div>
                      </div>
                    )}
                    {application.profile.moveInDate && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>{t('managerApplications.moveInDate')}</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>{formatDate(application.profile.moveInDate)}</div>
                      </div>
                    )}
                    {application.profile.emergencyContact && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>{t('managerApplications.emergencyContact')}</div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>
                          {typeof application.profile.emergencyContact === 'string' 
                            ? application.profile.emergencyContact
                            : `${application.profile.emergencyContact.name} (${application.profile.emergencyContact.phone}) - ${application.profile.emergencyContact.relationship}`
                          }
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => handleApprove(application.id, application.fullName)}
                      disabled={processing === application.id}
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                    >
                      {processing === application.id ? t('managerApplications.processing') : t('managerApplications.approve')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRejectClick(application.id, application.fullName)}
                      disabled={processing === application.id}
                      className="btn btn-secondary"
                      style={{
                        flex: 1,
                        opacity: processing === application.id ? 0.6 : 1
                      }}
                    >
                      {processing === application.id ? t('managerApplications.processing') : t('managerApplications.reject')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <BottomNav items={navItems} responsive={false} />

      {showRejectModal && (
        <Modal
          isOpen={showRejectModal}
          title={t('managerApplications.rejectTitle')}
          onClose={handleRejectCancel}
        >
          <div style={{ marginBottom: '20px' }}>
            <p style={{ marginBottom: '16px', color: '#6c757d' }}>
              {t('managerApplications.rejectReason')} {rejectingUserName}{t('managerApplications.rejectReasonSuffix')}:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={t('managerApplications.rejectPlaceholder')}
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleRejectCancel}
              className="btn btn-secondary"
            >
              {t('managerApplications.cancel')}
            </button>
            <button
              type="button"
              onClick={handleRejectConfirm}
              disabled={processing === rejectingUserId}
              className="btn btn-secondary"
              style={{
                opacity: processing === rejectingUserId ? 0.6 : 1
              }}
            >
              {processing === rejectingUserId ? t('managerApplications.processing') : t('managerApplications.rejectButton')}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ManagerApplicationsPage;