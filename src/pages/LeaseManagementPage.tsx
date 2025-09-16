import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import DataTable from '../components/DataTable.tsx';
import SearchFilter from '../components/SearchFilter.tsx';

function LeaseManagementPage() {
  const navigate = useNavigate();
  
  const [leases, setLeases] = useState([
    {
      id: '1',
      tenantName: 'John Tenant',
      unitNumber: '2A',
      propertyName: 'Blue Hills Apartments',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      monthlyRent: 12500,
      deposit: 25000,
      status: 'active',
      lastPayment: '2024-08-01',
      nextPaymentDue: '2024-09-01'
    },
    {
      id: '2',
      tenantName: 'Jane Smith',
      unitNumber: '3C',
      propertyName: 'Blue Hills Apartments',
      startDate: '2024-03-01',
      endDate: '2025-02-28',
      monthlyRent: 15000,
      deposit: 30000,
      status: 'active',
      lastPayment: '2024-08-15',
      nextPaymentDue: '2024-09-01'
    },
    {
      id: '3',
      tenantName: 'Mike Johnson',
      unitNumber: '1B',
      propertyName: 'Green Valley Complex',
      startDate: '2024-06-01',
      endDate: '2025-05-31',
      monthlyRent: 10500,
      deposit: 21000,
      status: 'active',
      lastPayment: '2024-08-01',
      nextPaymentDue: '2024-09-01'
    },
    {
      id: '4',
      tenantName: 'Sarah Wilson',
      unitNumber: '4D',
      propertyName: 'Sunset Towers',
      startDate: '2024-01-15',
      endDate: '2024-07-14',
      monthlyRent: 8500,
      deposit: 17000,
      status: 'expired',
      lastPayment: '2024-06-15',
      nextPaymentDue: null
    }
  ]);

  const [showLeaseForm, setShowLeaseForm] = useState(false);
  const [filteredLeases, setFilteredLeases] = useState(leases);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const navItems = [
    { path: '/manager', label: 'Dashboard' },
    { path: '/manager/properties', label: 'Properties' },
    { path: '/manager/leases', label: 'Leases', active: true },
    { path: '/manager/payments', label: 'Payments' }
  ];

  const activeLeases = leases.filter(l => l.status === 'active').length;
  const expiredLeases = leases.filter(l => l.status === 'expired').length;
  const totalMonthlyRevenue = leases
    .filter(l => l.status === 'active')
    .reduce((sum, l) => sum + l.monthlyRent, 0);
  const upcomingExpirations = leases.filter(l => {
    const daysUntilExpiry = (new Date(l.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
  }).length;

  const handleSearch = (term) => {
    setSearchTerm(term);
    applyFilters(term, statusFilter);
  };

  const handleFilterChange = (key, value) => {
    setStatusFilter(value);
    applyFilters(searchTerm, value);
  };

  const applyFilters = (search, status) => {
    let filtered = leases;

    if (search) {
      filtered = filtered.filter(lease =>
        lease.tenantName.toLowerCase().includes(search.toLowerCase()) ||
        lease.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
        lease.propertyName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter(lease => lease.status === status);
    }

    setFilteredLeases(filtered);
  };

  const leaseColumns = [
    { key: 'tenantName', label: 'Tenant' },
    { key: 'unitNumber', label: 'Unit' },
    { key: 'propertyName', label: 'Property' },
    { 
      key: 'monthlyRent', 
      label: 'Rent',
      render: (value) => `R${value.toLocaleString()}`
    },
    { 
      key: 'endDate', 
      label: 'End Date',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`status-badge ${
          value === 'active' ? 'status-paid' : 
          value === 'expired' ? 'status-overdue' : 'status-pending'
        }`}>
          {value.toUpperCase()}
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

return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} showBackButton={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Lease Management</div>
          <div className="page-subtitle">Manage tenant leases and agreements</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={activeLeases} label="Active Leases" />
          <StatCard value={expiredLeases} label="Expired" />
          <StatCard value={`R${(totalMonthlyRevenue / 1000).toFixed(0)}k`} label="Monthly Revenue" />
          <StatCard value={upcomingExpirations} label="Expiring Soon" />
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
          onRowClick={(lease) => {}}
        />

        <ChartCard title="Lease Overview">
          <div className="lease-stats">
            <div className="stat-item">
              <div className="stat-value">{activeLeases}</div>
              <div className="stat-label">Active</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{expiredLeases}</div>
              <div className="stat-label">Expired</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{upcomingExpirations}</div>
              <div className="stat-label">Expiring Soon</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{leases.length}</div>
              <div className="stat-label">Total</div>
            </div>
          </div>
        </ChartCard>

        <div className="quick-actions">
          <ActionCard
            to="/manager/leases/new"
            icon="C"
            title="Create Lease"
            description="New lease agreement"
          />  
          <ActionCard
            onClick={() => {}}
            icon="R"
            title="Renewals"
            description="Manage lease renewals"
          />
          <ActionCard
            onClick={() => navigate('/manager/terminations')}
            icon="T"
            title="Terminations"
            description="Handle lease terminations"
          />
          <ActionCard
            to="/manager/documents"
            icon="D"
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
