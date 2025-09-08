import React, { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import DataTable from '../components/DataTable.tsx';
import SearchFilter from '../components/SearchFilter.tsx';

function LeaseTerminationsPage() {
  const [terminations, setTerminations] = useState([
    {
      id: '1',
      tenantName: 'John Tenant',
      unitNumber: '2A',
      propertyName: 'Blue Hills Apartments',
      currentEndDate: '2024-12-31',
      terminationDate: null,
      reason: null,
      status: 'active',
      terminationFee: 0,
      documentsRequired: true
    },
    {
      id: '2',
      tenantName: 'Jane Smith',
      unitNumber: '3C',
      propertyName: 'Blue Hills Apartments',
      currentEndDate: '2025-02-28',
      terminationDate: '2024-09-15',
      reason: 'Tenant requested early termination',
      status: 'pending',
      terminationFee: 7500,
      documentsRequired: true
    },
    {
      id: '3',
      tenantName: 'Mike Johnson',
      unitNumber: '1B',
      propertyName: 'Green Valley Complex',
      currentEndDate: '2024-11-15',
      terminationDate: '2024-10-01',
      reason: 'Lease violation',
      status: 'approved',
      terminationFee: 0,
      documentsRequired: false
    },
    {
      id: '4',
      tenantName: 'Sarah Wilson',
      unitNumber: '4D',
      propertyName: 'Sunset Towers',
      currentEndDate: '2024-10-01',
      terminationDate: null,
      reason: null,
      status: 'active',
      terminationFee: 0,
      documentsRequired: true
    }
  ]);

  const [filteredTerminations, setFilteredTerminations] = useState(terminations);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const navItems = [
    { path: '/manager', label: 'Dashboard', active: false },
    { path: '/properties', label: 'Properties' },
    { path: '/manager/leases', label: 'Leases', active: true },
    { path: '/manager/payments', label: 'Payments' }
  ];

  const activeLeases = terminations.filter(t => t.status === 'active').length;
  const pendingTerminations = terminations.filter(t => t.status === 'pending').length;
  const approvedTerminations = terminations.filter(t => t.status === 'approved').length;
  const pendingDocuments = terminations.filter(t => t.documentsRequired && t.status !== 'approved').length;

  const handleSearch = (term) => {
    setSearchTerm(term);
    applyFilters(term, statusFilter);
  };

  const handleFilterChange = (key, value) => {
    setStatusFilter(value);
    applyFilters(searchTerm, value);
  };

  const applyFilters = (search, status) => {
    let filtered = terminations;

    if (search) {
      filtered = filtered.filter(termination =>
        termination.tenantName.toLowerCase().includes(search.toLowerCase()) ||
        termination.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
        termination.propertyName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter(termination => termination.status === status);
    }

    setFilteredTerminations(filtered);
  };

  const handleInitiateTermination = (terminationId) => {
    setTerminations(prev => prev.map(termination => 
      termination.id === terminationId 
        ? { ...termination, status: 'pending' }
        : termination
    ));
  };

  const handleApproveTermination = (terminationId) => {
    setTerminations(prev => prev.map(termination => 
      termination.id === terminationId 
        ? { ...termination, status: 'approved' }
        : termination
    ));
  };

  const terminationColumns = [
    { key: 'tenantName', label: 'Tenant' },
    { key: 'unitNumber', label: 'Unit' },
    { key: 'propertyName', label: 'Property' },
    { 
      key: 'currentEndDate', 
      label: 'Current End Date',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'terminationDate', 
      label: 'Termination Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`status-badge ${
          value === 'active' ? 'status-paid' : 
          value === 'pending' ? 'status-pending' : 'status-overdue'
        }`}>
          {value === 'active' ? 'Active' :
           value === 'pending' ? 'Pending' :
           value === 'approved' ? 'Terminated' : 'Rejected'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className="action-buttons">
          {row.status === 'active' && (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => handleInitiateTermination(row.id)}
            >
              Initiate
            </button>
          )}
          {row.status === 'pending' && (
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => handleApproveTermination(row.id)}
            >
              Approve
            </button>
          )}
          {row.documentsRequired && row.status !== 'approved' && (
            <span className="docs-required">Docs Required</span>
          )}
        </div>
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
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Terminated' }
      ]
    }
  ];

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Lease Terminations</div>
          <div className="page-subtitle">Manage lease termination requests and processes</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={activeLeases} label="Active Leases" />
          <StatCard value={pendingTerminations} label="Pending" />
          <StatCard value={approvedTerminations} label="Terminated" />
          <StatCard value={pendingDocuments} label="Docs Pending" />
        </div>

        <SearchFilter
          placeholder="Search terminations..."
          onSearch={handleSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <DataTable
          title="Termination Overview"
          data={filteredTerminations}
          columns={terminationColumns}
          actions={null}
          onRowClick={(termination) => {}}
        />

        <ChartCard title="Termination Process">
          <div className="termination-stats">
            <div className="stat-item">
              <div className="stat-value">{activeLeases}</div>
              <div className="stat-label">Active Leases</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{pendingTerminations}</div>
              <div className="stat-label">Pending Action</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{approvedTerminations}</div>
              <div className="stat-label">Terminated</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{terminations.length}</div>
              <div className="stat-label">Total Leases</div>
            </div>
          </div>
        </ChartCard>

        <div className="quick-actions">
          <ActionCard
            to="#"
            icon="D"
            title="Document Center"
            description="Termination docs"
          />
          <ActionCard
            to="#"
            icon="F"
            title="Fee Calculator"
            description="Calculate costs"
          />
          <ActionCard
            to="#"
            icon="R"
            title="Generate Report"
            description="Termination summary"
          />
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default LeaseTerminationsPage;
