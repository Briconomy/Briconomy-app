import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { adminApi } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface PendingUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profile: {
    property?: string;
    unitNumber?: string;
    occupation?: string;
    monthlyIncome?: string;
    emergencyContact?: string;
    moveInDate?: string;
  };
  appliedAt?: string;
  status: string;
}

function AdminPendingUsersPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navItems = [
    { path: '/admin', label: t('nav.dashboard'), icon: 'performanceAnalytics' },
    { path: '/admin/users', label: t('nav.users'), icon: 'users', active: true },
    { path: '/admin/security', label: t('nav.security'), icon: 'security' },
    { path: '/admin/reports', label: t('nav.reports'), icon: 'report' }
  ];

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching pending users...');
      const users = await adminApi.getPendingUsers();
      console.log('Pending users received:', users);
      setPendingUsers(users);
    } catch (err) {
      setError('Failed to load pending users');
      console.error('Error fetching pending users:', err);
    } finally {
      setLoading(false);
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
      
      await adminApi.approvePendingUser(userId);
      
      setSuccess(`${userName} has been approved and account created!`);
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    } catch (err) {
      setError(`Failed to approve ${userName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessing(null);
    }
  };

  const handleDecline = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to decline ${userName}'s application?`)) {
      return;
    }

    try {
      setProcessing(userId);
      setError('');
      setSuccess('');
      
      await adminApi.declinePendingUser(userId);
      
      setSuccess(`${userName}'s application has been declined.`);
      setPendingUsers(pendingUsers.filter(u => u.id !== userId));
    } catch (err) {
      setError(`Failed to decline ${userName}: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setProcessing(null);
    }
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

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton showLogout />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Pending User Applications</div>
          <div className="page-subtitle">Review and approve or decline prospective tenant applications</div>
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

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading pending applications...</p>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 20px',
            background: '#f8f9fa',
            borderRadius: '12px',
            margin: '20px 0'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
            <h3 style={{ marginBottom: '8px', color: '#2c3e50' }}>No Pending Applications</h3>
            <p style={{ color: '#6c757d' }}>All applications have been processed</p>
            <button 
              type="button"
              onClick={() => navigate('/admin/users')}
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
              Back to Users
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '20px', color: '#6c757d', fontSize: '14px' }}>
              {pendingUsers.length} pending {pendingUsers.length === 1 ? 'application' : 'applications'}
            </div>

            {pendingUsers.map((user) => (
              <div 
                key={user.id} 
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
                        {user.fullName}
                      </h3>
                      <p style={{ margin: '0', fontSize: '14px', color: '#6c757d' }}>
                        Applied: {formatDate(user.appliedAt)}
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
                      PENDING
                    </span>
                  </div>
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
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Email</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>{user.email}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Phone</div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>{user.phone}</div>
                  </div>
                  {user.profile.property && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Preferred Property</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#162F1B' }}>{user.profile.property}</div>
                    </div>
                  )}
                  {user.profile.unitNumber && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Preferred Unit</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>{user.profile.unitNumber}</div>
                    </div>
                  )}
                  {user.profile.occupation && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Occupation</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>{user.profile.occupation}</div>
                    </div>
                  )}
                  {user.profile.monthlyIncome && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Monthly Income</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>R {parseInt(user.profile.monthlyIncome).toLocaleString()}</div>
                    </div>
                  )}
                  {user.profile.moveInDate && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Preferred Move-in Date</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>{formatDate(user.profile.moveInDate)}</div>
                    </div>
                  )}
                  {user.profile.emergencyContact && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Emergency Contact</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50' }}>{user.profile.emergencyContact}</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => handleApprove(user.id, user.fullName)}
                    disabled={processing === user.id}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: processing === user.id ? '#ccc' : '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: processing === user.id ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {processing === user.id ? 'Processing...' : '✓ Approve'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDecline(user.id, user.fullName)}
                    disabled={processing === user.id}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: processing === user.id ? '#ccc' : '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: processing === user.id ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {processing === user.id ? 'Processing...' : '✗ Decline'}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default AdminPendingUsersPage;
