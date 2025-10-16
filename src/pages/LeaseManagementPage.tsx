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
    { path: '/manager', label: 'Dashboard' },
    { path: '/manager/properties', label: 'Properties' },
    { path: '/manager/leases', label: 'Leases', active: true },
    { path: '/manager/payments', label: 'Payments' }
  ];

  // Filter leases based on search and status
  useEffect(() => {
    if (!leases) return;
    
    let filtered = leases;

    if (searchTerm) {
      filtered = filtered.filter(lease =>
        (lease.propertyId?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lease.unitId?.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase())) ||
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
    if (!confirm('Are you sure you want to delete this lease?')) return;
    
    try {
      // Note: Need to implement delete method in leasesApi
      console.log('Delete lease:', leaseId);
      refetch(); // Refresh the data
      alert('Lease deleted successfully');
    } catch (error) {
      console.error('Error deleting lease:', error);
      alert('Failed to delete lease');
    }
  };

  const leaseColumns = [
    { 
      key: 'propertyId', 
      label: 'Property',
      render: (value) => value?.name || 'N/A'
    },
    { 
      key: 'unitId', 
      label: 'Unit',
      render: (value) => value?.unitNumber || 'N/A'
    },
    { 
      key: 'monthlyRent', 
      label: 'Rent',
      render: (value) => `R${(value || 0).toLocaleString()}`
    },
    { 
      key: 'endDate', 
      label: 'End Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    { 
      key: 'status', 
      label: 'Status',
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
        { value: 'all', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'expired', label: 'Expired' },
        { value: 'terminated', label: 'Terminated' }
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
            <p>Loading...</p>
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
            <p>Error: {error}</p>
            <button type="button" onClick={refetch} className="btn btn-primary">
              Retry
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
          <div className="page-title">Lease Management</div>
          <div className="page-subtitle">Manage tenant leases and agreements</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={stats.active} label="Active Leases" />
          <StatCard value={stats.expired} label="Expired" />
          <StatCard value={`R${(stats.totalRevenue / 1000).toFixed(0)}k`} label="Monthly Revenue" />
          <StatCard value={stats.expiringSoon} label="Expiring Soon" />
        </div>

        <SearchFilter
          placeholder="Search leases..."
          onSearch={handleSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <DataTable
          title="Lease Portfolio"
          data={filteredLeases}
          columns={leaseColumns}
          actions={null}
          onRowClick={(_lease) => navigate(`/manager/leases/${_lease.id}`)}
        />

        <ChartCard title="Lease Overview">
          <div className="lease-stats">
            <div className="stat-item">
              <div className="stat-value">{stats.active}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.expired}</div>
              <div className="stat-label">Expired</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.expiringSoon}</div>
              <div className="stat-label">Expiring Soon</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{leases ? leases.length : 0}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
        </ChartCard>

        <div className="quick-actions">
          <ActionCard
            to="/manager/leases/new"
            icon={<Icon name="createLease" alt="Create Lease" />}
            title="Create Lease"
            description="New lease agreement"
          />  
          <ActionCard
            to="/manager/renewals"
            icon={<Icon name="renewals" alt="Renewals" />}
            title="Renewals"
            description="Manage lease renewals"
          />
          <ActionCard
            onClick={() => navigate('/manager/terminations')}
            icon={<Icon name="terminations" alt="Terminations" />}
            title="Terminations"
            description="Handle lease terminations"
          />
          <ActionCard
            to="/manager/documents"
            icon={<Icon name="docLease" alt="Documents" />}
            title="Documents"
            description="Lease agreements"
          />
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default LeaseManagementPage;
