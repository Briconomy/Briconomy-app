import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import { leasesApi, formatCurrency } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';

function LeaseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [lease, setLease] = useState(null);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { path: '/manager', label: t('nav.dashboard'), icon: 'performanceAnalytics' },
    { path: '/manager/properties', label: t('nav.properties'), icon: 'properties' },
    { path: '/manager/leases', label: t('nav.leases'), icon: 'lease', active: true },
    { path: '/manager/payments', label: t('nav.payments'), icon: 'payment' }
  ];

  useEffect(() => {
    const fetchLease = async () => {
      try {
        setLoading(true);
        const leases = await leasesApi.getAll();
        const foundLease = leases.find(l => l.id === id);
        setLease(foundLease);
      } catch (error) {
        console.error('Error fetching lease:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLease();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="page-header">
            <div className="page-title">{t('common.loading')}...</div>
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
          <div className="page-header">
            <div className="page-title">{t('lease.not_found')}</div>
            <div className="page-subtitle">{t('lease.not_found_message')}</div>
          </div>
          <button
            onClick={() => navigate('/manager/leases')}
            className="btn btn-primary"
            style={{ marginTop: '20px' }}
          >
            {t('common.back_to_leases')}
          </button>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  const daysUntilExpiry = lease.endDate
    ? Math.ceil((new Date(lease.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">{t('lease.details')}</div>
          <div className="page-subtitle">
            {lease.leaseNumber || `Lease #${lease.id.slice(-6)}`}
          </div>
        </div>

        <div className="dashboard-grid">
          <StatCard 
            value={formatCurrency(lease.monthlyRent || 0)} 
            label={t('lease.monthly_rent')} 
          />
          <StatCard 
            value={formatCurrency(lease.deposit || 0)} 
            label={t('lease.deposit')} 
          />
          <StatCard 
            value={daysUntilExpiry !== null ? `${daysUntilExpiry} ${t('common.days')}` : 'N/A'} 
            label={t('lease.days_until_expiry')} 
          />
          <StatCard 
            value={lease.status?.toUpperCase() || 'N/A'} 
            label={t('common.status')} 
          />
        </div>

        <div className="details-card" style={{ 
          background: 'var(--surface)', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
            {t('lease.tenant_information')}
          </h3>
          <div className="detail-row">
            <span className="detail-label">{t('lease.tenant')}:</span>
            <span className="detail-value">{lease.tenant?.fullName || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t('lease.email')}:</span>
            <span className="detail-value">{lease.tenant?.email || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t('lease.phone')}:</span>
            <span className="detail-value">{lease.tenant?.phone || 'N/A'}</span>
          </div>
        </div>

        <div className="details-card" style={{ 
          background: 'var(--surface)', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
            {t('lease.property_information')}
          </h3>
          <div className="detail-row">
            <span className="detail-label">{t('lease.property')}:</span>
            <span className="detail-value">{lease.property?.name || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t('common.address')}:</span>
            <span className="detail-value">{lease.property?.address || 'N/A'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t('lease.unit')}:</span>
            <span className="detail-value">{lease.unit?.unitNumber || 'N/A'}</span>
          </div>
        </div>

        <div className="details-card" style={{ 
          background: 'var(--surface)', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>
            {t('lease.lease_terms')}
          </h3>
          <div className="detail-row">
            <span className="detail-label">{t('lease.start_date')}:</span>
            <span className="detail-value">
              {lease.startDate ? new Date(lease.startDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t('lease.end_date')}:</span>
            <span className="detail-value">
              {lease.endDate ? new Date(lease.endDate).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t('lease.renewal_option')}:</span>
            <span className="detail-value">
              {lease.renewalOption ? t('common.yes') : t('common.no')}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">{t('lease.terms')}:</span>
            <span className="detail-value">{lease.terms || 'N/A'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={() => navigate('/manager/leases')}
            className="btn btn-secondary"
            style={{ flex: 1 }}
          >
            {t('common.back')}
          </button>
          <button
            onClick={() => navigate(`/manager/renewals`)}
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={lease.status !== 'active'}
          >
            {t('lease.renew_lease')}
          </button>
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />

      <style>{`
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-primary);
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: var(--text-secondary);
          font-size: 14px;
        }
        .detail-value {
          color: var(--text-primary);
          font-size: 14px;
          text-align: right;
          max-width: 60%;
        }
      `}</style>
    </div>
  );
}

export default LeaseDetailsPage;
