import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import DataTable from '../components/DataTable.tsx';
import SearchFilter from '../components/SearchFilter.tsx';
import PaymentChart from '../components/PaymentChart.tsx';

function ManagerPaymentsPage() {
  const [payments, setPayments] = useState([
    {
      id: '1',
      tenantName: 'John Tenant',
      propertyName: 'Blue Hills Apartments',
      unitNumber: '2A',
      amount: 12500,
      dueDate: '2024-09-01',
      status: 'paid',
      paymentDate: '2024-08-30',
      paymentMethod: 'EFT'
    },
    {
      id: '2',
      tenantName: 'Jane Smith',
      propertyName: 'Blue Hills Apartments',
      unitNumber: '3C',
      amount: 15000,
      dueDate: '2024-09-01',
      status: 'pending',
      paymentDate: null,
      paymentMethod: null
    },
    {
      id: '3',
      tenantName: 'Mike Johnson',
      propertyName: 'Green Valley Complex',
      unitNumber: '1B',
      amount: 10500,
      dueDate: '2024-09-01',
      status: 'overdue',
      paymentDate: null,
      paymentMethod: null
    },
    {
      id: '4',
      tenantName: 'Sarah Wilson',
      propertyName: 'Sunset Towers',
      unitNumber: '4D',
      amount: 8500,
      dueDate: '2024-08-15',
      status: 'paid',
      paymentDate: '2024-08-14',
      paymentMethod: 'Cash'
    }
  ]);

  const [filteredPayments, setFilteredPayments] = useState(payments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const navItems = [
    { path: '/manager', label: 'Dashboard', active: false },
    { path: '/manager/properties', label: 'Properties' },
    { path: '/manager/leases', label: 'Leases' },
    { path: '/manager/payments', label: 'Payments', active: true }
  ];

  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
    
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const overduePayments = payments.filter(p => p.status === 'overdue').length;
  const collectedThisMonth = payments
    .filter(p => {
      const paymentDate = new Date(p.paymentDate);
      const currentDate = new Date();
      return p.status === 'paid' && 
             paymentDate.getMonth() === currentDate.getMonth() && 
             paymentDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const handleSearch = (term) => {
    setSearchTerm(term);
    applyFilters(term, statusFilter);
  };

  const handleFilterChange = (key, value) => {
    setStatusFilter(value);
    applyFilters(searchTerm, value);
  };

  const applyFilters = (search, status) => {
    let filtered = payments;

    if (search) {
      filtered = filtered.filter(payment =>
        payment.tenantName.toLowerCase().includes(search.toLowerCase()) ||
        payment.propertyName.toLowerCase().includes(search.toLowerCase()) ||
        payment.unitNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter(payment => payment.status === status);
    }

    setFilteredPayments(filtered);
  };

  const paymentColumns = [
    { key: 'tenantName', label: 'Tenant' },
    { key: 'propertyName', label: 'Property' },
    { key: 'unitNumber', label: 'Unit' },
    { 
      key: 'amount', 
      label: 'Amount',
      render: (value) => `R${value.toLocaleString()}`
    },
    { 
      key: 'dueDate', 
      label: 'Due Date',
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <span className={`status-badge ${
          value === 'paid' ? 'status-paid' : 
          value === 'pending' ? 'status-pending' : 'status-overdue'
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
        { value: 'paid', label: 'Paid' },
        { value: 'pending', label: 'Pending' },
        { value: 'overdue', label: 'Overdue' }
      ]
    }
  ];

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} showBackButton={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Payment Management</div>
          <div className="page-subtitle">Track rent collection and payments</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={`R${(totalRevenue / 1000).toFixed(0)}k`} label="Total Revenue" />
          <StatCard value={pendingPayments} label="Pending" />
          <StatCard value={overduePayments} label="Overdue" />
          <StatCard value={`R${(collectedThisMonth / 1000).toFixed(0)}k`} label="This Month" />
        </div>

        <SearchFilter
          placeholder="Search payments..."
          onSearch={handleSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <DataTable
          title="Payment Overview"
          data={filteredPayments}
          columns={paymentColumns}
          actions={null}
          onRowClick={(payment) => {}}
        />

        <ChartCard title="Payment Trends">
          <PaymentChart payments={payments} />
        </ChartCard>

        <div className="quick-actions">
          <ActionCard
            to="#"
            icon="R"
            title="Send Reminders"
            description="Notify tenants"
          />
          <ActionCard
            to="#"
            icon="G"
            title="Generate Report"
            description="Payment summary"
          />
          <ActionCard
            to="#"
            icon="E"
            title="Export Data"
            description="Download CSV"
          />
        </div>

      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default ManagerPaymentsPage;
