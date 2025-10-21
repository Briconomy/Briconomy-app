import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import DataTable from '../components/DataTable.tsx';
import SearchFilter from '../components/SearchFilter.tsx';
import { leasesApi, useApi, formatCurrency } from '../services/api.ts';
import Icon from '../components/Icon.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

function LeaseManagementPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredLeases, setFilteredLeases] = useState([]);
  
  // Fetch real lease data from database
  const { data: leases, loading, error, refetch } = useApi(() => leasesApi.getAll(), []);

  const navItems = [
    { path: '/manager', label: t('nav.dashboard'), icon: 'performanceAnalytics' },
    { path: '/manager/properties', label: t('nav.properties'), icon: 'properties' },
    { path: '/manager/leases', label: t('nav.leases'), icon: 'lease', active: true },
    { path: '/manager/payments', label: t('nav.payments'), icon: 'payment' }
  ];

  // Filter leases based on search and status
  useEffect(() => {
    if (!leases) return;
    
    let filtered = leases;

    if (searchTerm) {
      filtered = filtered.filter(lease =>
        (lease.property?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lease.unit?.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lease.tenant?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lease.status?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lease => lease.status === statusFilter);
    }

    setFilteredLeases(filtered);
  }, [leases, searchTerm, statusFilter]);

  // Calculate statistics
  const getLeaseStats = () => {
    if (!leases) return { active: 0, expired: 0, totalRevenue: 0, expiringSoon: 0 };
    
    const activeLeases = leases.filter(l => l.status === 'active').length;
    const expiredLeases = leases.filter(l => l.status === 'expired').length;
    const totalMonthlyRevenue = leases
      .filter(l => l.status === 'active')
      .reduce((sum, l) => sum + (l.monthlyRent || 0), 0);
    
    const upcomingExpirations = leases.filter(l => {
      if (!l.endDate) return false;
      const daysUntilExpiry = (new Date(l.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    }).length;

    return {
      active: activeLeases,
      expired: expiredLeases,
      totalRevenue: totalMonthlyRevenue,
      expiringSoon: upcomingExpirations
    };
  };

  const stats = getLeaseStats();

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (_key, value) => {
    setStatusFilter(value);
  };

  const handleDeleteLease = async (leaseId) => {
    if (!confirm(t('message.confirm_delete'))) return;
    
    try {
      // Note: Need to implement delete method in leasesApi
      console.log('Delete lease:', leaseId);
      refetch(); // Refresh the data
      alert(t('message.deleted_successfully'));
    } catch (error) {
      console.error('Error deleting lease:', error);
      alert(t('message.failed_to_delete'));
    }
  };

  const leaseColumns = [
    { 
      key: 'tenant', 
      label: t('lease.tenant'),
      render: (value) => value?.fullName || 'N/A'
    },
    { 
      key: 'property', 
      label: t('lease.property'),
      render: (value) => value?.name || 'N/A'
    },
    { 
      key: 'unit', 
      label: t('lease.unit'),
      render: (value) => value?.unitNumber || 'N/A'
    },
    { 
      key: 'monthlyRent', 
      label: t('lease.monthly_rent'),
      render: (value) => `R${(value || 0).toLocaleString()}`
    },
    { 
      key: 'endDate', 
      label: t('lease.end_date'),
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    { 
      key: 'status', 
      label: t('common.status'),
      render: (value) => (
        <span className={`status-badge ${
          value === 'active' ? 'status-paid' : 
          value === 'expired' ? 'status-overdue' : 'status-pending'
        }`}>
          {value?.toUpperCase() || 'UNKNOWN'}
        </span>
      )
    }
  ];

  const filters = [
    {
      key: 'status',
      value: statusFilter,
      options: [
        { value: 'all', label: t('common.all_statuses') },
        { value: 'active', label: t('status.active') },
        { value: 'expired', label: t('status.expired') },
        { value: 'terminated', label: t('status.terminated') }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t('common.loading')}</p>
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
            <p>{t('common.error')}: {error}</p>
            <button type="button" onClick={refetch} className="btn btn-primary">
              {t('common.retry')}
            </button>
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
          <div className="page-title">{t('lease.management')}</div>
          <div className="page-subtitle">{t('lease.manage_tenant_leases')}</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={stats.active} label={t('lease.active_leases')} />
          <StatCard value={stats.expired} label={t('status.expired')} />
          <StatCard value={`R${(stats.totalRevenue / 1000).toFixed(0)}k`} label={t('lease.monthly_revenue')} />
          <StatCard value={stats.expiringSoon} label={t('lease.expiring_soon')} />
        </div>

        <SearchFilter
          placeholder={t('lease.search_placeholder')}
          onSearch={handleSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <DataTable
          title={t('lease.portfolio')}
          data={filteredLeases}
          columns={leaseColumns}
          actions={null}
          onRowClick={(_lease) => navigate(`/manager/leases/${_lease.id}`)}
        />

        <ChartCard title={t('lease.overview')}>
          <div className="lease-stats">
            <div className="stat-item">
              <div className="stat-value">{stats.active}</div>
              <div className="stat-label">{t('status.active')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.expired}</div>
              <div className="stat-label">{t('status.expired')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.expiringSoon}</div>
              <div className="stat-label">{t('lease.expiring_soon')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{leases ? leases.length : 0}</div>
              <div className="stat-label">{t('common.total')}</div>
            </div>
          </div>
        </ChartCard>

        <div className="quick-actions">
          <ActionCard
            to="/manager/leases/new"
            icon={<Icon name="createLease" alt={t('lease.create_lease')} />}
            title={t('lease.create_lease')}
            description={t('lease.new_lease_agreement')}
          />  
          <ActionCard
            to="/manager/renewals"
            icon={<Icon name="renewals" alt={t('lease.renewals')} />}
            title={t('lease.renewals')}
            description={t('lease.manage_renewals')}
          />
          <ActionCard
            onClick={() => navigate('/manager/terminations')}
            icon={<Icon name="terminations" alt={t('lease.terminations')} />}
            title={t('lease.terminations')}
            description={t('lease.handle_terminations')}
          />
          <ActionCard
            to="/manager/documents"
            icon={<Icon name="docLease" alt={t('common.documents')} />}
            title={t('common.documents')}
            description={t('lease.agreements')}
          />
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default LeaseManagementPage;
