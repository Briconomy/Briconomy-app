import React, { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import DataTable from '../components/DataTable.tsx';
import SearchFilter from '../components/SearchFilter.tsx';
import Icon from '../components/Icon.tsx';

function LeaseRenewalsPage() {
  const [renewals, setRenewals] = useState([
    {
      id: '1',
      tenantName: 'John Tenant',
      unitNumber: '2A',
      propertyName: 'Blue Hills Apartments',
      currentEndDate: '2024-12-31',
      daysUntilExpiry: 45,
      status: 'pending',
      renewalOfferSent: false,
      tenantResponse: null
    },
    {
      id: '2',
      tenantName: 'Jane Smith',
      unitNumber: '3C',
      propertyName: 'Blue Hills Apartments',
      currentEndDate: '2025-02-28',
      daysUntilExpiry: 104,
      status: 'pending',
      renewalOfferSent: true,
      tenantResponse: null
    },
    {
      id: '3',
      tenantName: 'Mike Johnson',
      unitNumber: '1B',
      propertyName: 'Green Valley Complex',
      currentEndDate: '2024-11-15',
      daysUntilExpiry: 30,
      status: 'offer_sent',
      renewalOfferSent: true,
      tenantResponse: 'pending'
    },
    {
      id: '4',
      tenantName: 'Sarah Wilson',
      unitNumber: '4D',
      propertyName: 'Sunset Towers',
      currentEndDate: '2024-10-01',
      daysUntilExpiry: 15,
      status: 'accepted',
      renewalOfferSent: true,
      tenantResponse: 'accepted'
    }
  ]);

  const [filteredRenewals, setFilteredRenewals] = useState(renewals);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const navItems = [
    { path: '/manager', label: 'Dashboard', active: false },
    { path: '/properties', label: 'Properties' },
    { path: '/manager/leases', label: 'Leases', active: true },
    { path: '/manager/payments', label: 'Payments' }
  ];

  const pendingRenewals = renewals.filter(r => r.status === 'pending').length;
  const offersSent = renewals.filter(r => r.renewalOfferSent).length;
  const acceptedRenewals = renewals.filter(r => r.tenantResponse === 'accepted').length;
  const expiringSoon = renewals.filter(r => r.daysUntilExpiry <= 30).length;

  const handleSearch = (term) => {
    setSearchTerm(term);
    applyFilters(term, statusFilter);
  };

  const handleFilterChange = (key, value) => {
    setStatusFilter(value);
    applyFilters(searchTerm, value);
  };

  const applyFilters = (search, status) => {
    let filtered = renewals;

    if (search) {
      filtered = filtered.filter(renewal =>
        renewal.tenantName.toLowerCase().includes(search.toLowerCase()) ||
        renewal.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
        renewal.propertyName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter(renewal => renewal.status === status);
    }

    setFilteredRenewals(filtered);
  };

  const handleSendRenewalOffer = (renewalId) => {
    setRenewals(prev => prev.map(renewal => 
      renewal.id === renewalId 
        ? { ...renewal, status: 'offer_sent', renewalOfferSent: true }
        : renewal
    ));
  };

  const renewalColumns = [
    { key: 'tenantName', label: 'Tenant' },
    { key: 'unitNumber', label: 'Unit' },
    { key: 'propertyName', label: 'Property' },
    { 
      key: 'currentEndDate', 
      label: 'Current End Date',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'daysUntilExpiry', 
      label: 'Days Left',
      render: (value) => (
        <span className={value <= 30 ? 'urgent' : 'normal'}>
          {value} days
        </span>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value, row) => (
        <span className={`status-badge ${
          value === 'accepted' ? 'status-paid' : 
          value === 'offer_sent' ? 'status-pending' : 'status-overdue'
        }`}>
          {value === 'pending' ? 'Pending' :
           value === 'offer_sent' ? 'Offer Sent' :
           value === 'accepted' ? 'Accepted' : 'Declined'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className="action-buttons">
          {!row.renewalOfferSent && (
            <button type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleSendRenewalOffer(row.id)}
            >
              Send Offer
            </button>
          )}
          {row.tenantResponse === 'pending' && (
            <span className="response-pending">Awaiting Response</span>
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
        { value: 'pending', label: 'Pending' },
        { value: 'offer_sent', label: 'Offer Sent' },
        { value: 'accepted', label: 'Accepted' }
      ]
    }
  ];

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Lease Renewals</div>
          <div className="page-subtitle">Manage lease renewal requests and offers</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={pendingRenewals} label="Pending" />
          <StatCard value={offersSent} label="Offers Sent" />
          <StatCard value={acceptedRenewals} label="Accepted" />
          <StatCard value={expiringSoon} label="Expiring Soon" />
        </div>

        <SearchFilter
          placeholder="Search renewals..."
          onSearch={handleSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <DataTable
          title="Renewal Overview"
          data={filteredRenewals}
          columns={renewalColumns}
          actions={null}
          onRowClick={(renewal) => {}}
        />

        <ChartCard title="Renewal Process">
          <div className="renewal-stats">
            <div className="stat-item">
              <div className="stat-value">{pendingRenewals}</div>
              <div className="stat-label">Pending Action</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{offersSent}</div>
              <div className="stat-label">Offers Sent</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{acceptedRenewals}</div>
              <div className="stat-label">Accepted</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{renewals.length}</div>
              <div className="stat-label">Total Renewals</div>
            </div>
          </div>
        </ChartCard>

        <div className="quick-actions">
          <ActionCard
            to="#"
            icon={<Icon name="sendBulkOffers" alt="Send Bulk Offers" />}
            title="Send Bulk Offers"
            description="Multiple tenants"
          />
          <ActionCard
            to="#"
            icon={<Icon name="trackResponses" alt="Track Responses" />}
            title="Track Responses"
            description="View status"
          />
          <ActionCard
            to="#"
            icon={<Icon name="report" alt="Generate Report" />}
            title="Generate Report"
            description="Renewal summary"
          />
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default LeaseRenewalsPage;
