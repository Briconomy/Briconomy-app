import { useEffect, useMemo, useState } from 'react';
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

type LeaseStatus = 'active' | 'expired' | 'terminated' | string;

type Lease = {
  id?: string;
  _id?: string;
  propertyId?: { name?: string } | null;
  unitId?: { unitNumber?: string } | null;
  status?: LeaseStatus | null;
  monthlyRent?: number | null;
  endDate?: string | null;
};

type LeaseStats = {
  active: number;
  expired: number;
  totalRevenue: number;
  expiringSoon: number;
};

function LeaseManagementPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredLeases, setFilteredLeases] = useState<Lease[]>([]);
  
  // Fetch real lease data from database
  const { data: leases, loading, error, refetch } = useApi<Lease[]>(() => leasesApi.getAll(), []);

  const normalizedLeases = useMemo(() => (Array.isArray(leases) ? leases : []), [leases]);

  const navItems = [
    { path: '/manager', label: t('nav.dashboard'), icon: 'performanceAnalytics' },
    { path: '/manager/properties', label: t('nav.properties'), icon: 'properties' },
    { path: '/manager/leases', label: t('nav.leases'), icon: 'lease', active: true },
    { path: '/manager/payments', label: t('nav.payments'), icon: 'payment' }
  ];

  // Filter leases based on search and status
  useEffect(() => {
    let filtered = normalizedLeases;

    if (searchTerm) {
      filtered = filtered.filter(lease =>
        lease.propertyId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lease.unitId?.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lease.status?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lease => lease.status === statusFilter);
    }

    setFilteredLeases(filtered);
  }, [normalizedLeases, searchTerm, statusFilter]);

  // Calculate statistics
  const stats = useMemo<LeaseStats>(() => {
    const active = normalizedLeases.filter((lease) => lease.status === 'active').length;
    const expired = normalizedLeases.filter((lease) => lease.status === 'expired').length;
    const totalRevenue = normalizedLeases
      .filter((lease) => lease.status === 'active')
      .reduce((sum, lease) => sum + (lease.monthlyRent ?? 0), 0);

    const expiringSoon = normalizedLeases.filter((lease) => {
      if (!lease.endDate) {
        return false;
      }
      const daysUntilExpiry = (new Date(lease.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    }).length;

    return {
      active,
      expired,
      totalRevenue,
      expiringSoon
    };
  }, [normalizedLeases]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (_key: string, value: string) => {
    setStatusFilter(value);
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
      render: (value: Lease['propertyId']) => value?.name || 'N/A'
    },
    { 
      key: 'unit', 
      label: t('lease.unit'),
      render: (value: Lease['unitId']) => value?.unitNumber || 'N/A'
    },
    { 
      key: 'monthlyRent', 
      label: t('lease.monthly_rent'),
      render: (value: Lease['monthlyRent']) => formatCurrency(value ?? 0)
    },
    { 
      key: 'endDate', 
      label: t('lease.end_date'),
      render: (value: Lease['endDate']) => (value ? new Date(value).toLocaleDateString() : 'N/A')
    },
    { 
      key: 'status', 
      label: t('common.status'),
      render: (value: Lease['status']) => (
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
            <p>{t('common.error')}: {String(error)}</p>
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
          onRowClick={(lease: Lease) => {
            const leaseId = lease.id ?? lease._id;
            if (leaseId) {
              navigate(`/manager/leases/${leaseId}`);
            }
          }}
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
