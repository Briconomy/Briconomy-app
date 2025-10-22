import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { leasesApi, useApi, formatCurrency, formatDate } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

function TenantLeasePage() {
  const navigate = useNavigate();
  const { t: _t } = useLanguage();
  const { user } = useAuth();
  const [downloading, setDownloading] = useState(false);

  const { data: lease, loading, error, refetch } = useApi(
    () => user?.id ? leasesApi.getMyLease(user.id) : Promise.resolve(null),
    [user?.id]
  );

  const navItems = [
    { path: '/tenant', label: 'Home', active: true },
    { path: '/tenant/payments', label: 'Payments' },
    { path: '/tenant/requests', label: 'Requests' },
    { path: '/tenant/profile', label: 'Profile' }
  ];

  const handleDownloadLease = async () => {
    if (!lease?.id) return;

    setDownloading(true);
    try {
      await leasesApi.downloadDocument(lease.id);
      alert('Lease document download initiated!');
    } catch (err) {
      console.error('Error downloading lease:', err);
      alert('Failed to download lease document. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="loading-state">
            <p>Loading your lease...</p>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="error-state">
            <p>Error loading lease: {error}</p>
            <button type="button" onClick={refetch} className="btn btn-primary">
              Retry
            </button>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="empty-state">
            <p>No active lease found</p>
            <small>You don't have an active lease agreement at this time.</small>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">My Lease</div>
          <div className="page-subtitle">View your lease agreement details</div>
        </div>

        <div className="lease-details-card" style={{ 
          background: '#fff', 
          borderRadius: '12px', 
          padding: '20px', 
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div className="detail-group" style={{ marginBottom: '16px' }}>
            <strong style={{ display: 'block', color: '#7f8c8d', marginBottom: '4px' }}>
              Lease Number
            </strong>
            <p style={{ margin: 0, fontSize: '16px' }}>
              {lease.leaseNumber || 'N/A'}
            </p>
          </div>

          <div className="detail-group" style={{ marginBottom: '16px' }}>
            <strong style={{ display: 'block', color: '#7f8c8d', marginBottom: '4px' }}>
              Property
            </strong>
            <p style={{ margin: 0, fontSize: '16px' }}>
              {lease.property?.name || 'N/A'}
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: '#95a5a6' }}>
              {lease.property?.address || ''}
            </p>
          </div>

          <div className="detail-group" style={{ marginBottom: '16px' }}>
            <strong style={{ display: 'block', color: '#7f8c8d', marginBottom: '4px' }}>
              Unit
            </strong>
            <p style={{ margin: 0, fontSize: '16px' }}>
              {lease.unit?.unitNumber || 'N/A'}
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: '#95a5a6' }}>
              {lease.unit?.bedrooms ? `${lease.unit.bedrooms} bed` : ''} 
              {lease.unit?.bathrooms ? ` · ${lease.unit.bathrooms} bath` : ''}
            </p>
          </div>

          <div className="detail-group" style={{ marginBottom: '16px' }}>
            <strong style={{ display: 'block', color: '#7f8c8d', marginBottom: '4px' }}>
              Lease Period
            </strong>
            <p style={{ margin: 0, fontSize: '16px' }}>
              {lease.startDate ? formatDate(lease.startDate) : 'N/A'} - {lease.endDate ? formatDate(lease.endDate) : 'N/A'}
            </p>
          </div>

          <div className="detail-group" style={{ marginBottom: '16px' }}>
            <strong style={{ display: 'block', color: '#7f8c8d', marginBottom: '4px' }}>
              Monthly Rent
            </strong>
            <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#3498db' }}>
              {lease.monthlyRent ? formatCurrency(lease.monthlyRent) : 'N/A'}
            </p>
          </div>

          <div className="detail-group" style={{ marginBottom: '16px' }}>
            <strong style={{ display: 'block', color: '#7f8c8d', marginBottom: '4px' }}>
              Deposit
            </strong>
            <p style={{ margin: 0, fontSize: '16px' }}>
              {lease.deposit ? formatCurrency(lease.deposit) : 'N/A'}
            </p>
          </div>

          <div className="detail-group" style={{ marginBottom: '16px' }}>
            <strong style={{ display: 'block', color: '#7f8c8d', marginBottom: '4px' }}>
              Status
            </strong>
            <p style={{ margin: 0, fontSize: '16px' }}>
              <span className={`status-badge ${
                lease.status === 'active' ? 'status-paid' : 
                lease.status === 'pending' ? 'status-pending' : 'status-overdue'
              }`}>
                {lease.status === 'active' ? '✅ Active' :
                 lease.status === 'pending' ? '🟡 Pending' :
                 lease.status === 'expired' ? '🔴 Expired' : lease.status}
              </span>
            </p>
          </div>

          {lease.terms && (
            <div className="detail-group" style={{ marginBottom: '16px' }}>
              <strong style={{ display: 'block', color: '#7f8c8d', marginBottom: '4px' }}>
                Additional Terms
              </strong>
              <p style={{ margin: 0, fontSize: '14px', color: '#7f8c8d' }}>
                {lease.terms}
              </p>
            </div>
          )}

          <div className="detail-group" style={{ marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleDownloadLease}
              disabled={downloading}
              style={{ width: '100%' }}
            >
              {downloading ? 'Downloading...' : '📄 Download Lease Document'}
            </button>
          </div>
        </div>

        <div className="info-card" style={{
          background: '#ecf0f1',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>Need Help?</h3>
          <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
            If you have questions about your lease, please contact your property manager.
          </p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/tenant/messages')}
            style={{ marginTop: '8px' }}
          >
            💬 Message Manager
          </button>
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default TenantLeasePage;
