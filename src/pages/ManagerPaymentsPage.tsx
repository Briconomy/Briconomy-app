import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import DataTable from '../components/DataTable.tsx';
import SearchFilter from '../components/SearchFilter.tsx';
import PaymentChart from '../components/PaymentChart.tsx';
import Icon from '../components/Icon.tsx';
import { paymentsApi, useApi } from '../services/api.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

// Simple error boundary for chart rendering
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }
  override componentDidCatch(_error, _errorInfo) {}
  override render() {
    if (this.state.hasError) {
      return <div style={{ padding: '24px', textAlign: 'center', color: '#a94442' }}>Unable to render chart. Please check your data.</div>;
    }
    return this.props.children;
  }
}

function ManagerPaymentsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: payments, loading: _loading, error: _error, refetch: _refetch } = useApi(
    () => user?.id ? paymentsApi.getAll({ managerId: user.id }) : Promise.resolve([]),
    [user?.id]
  );

  const paymentsData = Array.isArray(payments) ? payments : [];

  const navItems = [
    { path: '/manager', label: t('nav.dashboard'), icon: 'performanceAnalytics', active: false },
    { path: '/manager/properties', label: t('nav.properties'), icon: 'properties' },
    { path: '/manager/leases', label: t('nav.leases'), icon: 'lease' },
    { path: '/manager/payments', label: t('nav.payments'), icon: 'payment', active: true }
  ];

  useEffect(() => {
    applyFilters(searchTerm, statusFilter);
  }, [payments, searchTerm, statusFilter]);

  const totalRevenue = paymentsData
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
    
  const pendingPayments = paymentsData.filter(p => p.status === 'pending').length;
  const overduePayments = paymentsData.filter(p => p.status === 'overdue').length;
  const collectedThisMonth = paymentsData
    .filter(p => {
      if (!p.paymentDate || p.status !== 'paid') return false;
      const paymentDate = new Date(p.paymentDate);
      const currentDate = new Date();
      return paymentDate.getMonth() === currentDate.getMonth() && 
             paymentDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const applyFilters = (search, status) => {
    let filtered = paymentsData;

    if (search) {
      filtered = filtered.filter(payment =>
        payment.tenantName?.toLowerCase().includes(search.toLowerCase()) ||
        payment.propertyName?.toLowerCase().includes(search.toLowerCase()) ||
        payment.unitNumber?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter(payment => payment.status === status);
    }

    setFilteredPayments(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    applyFilters(term, statusFilter);
  };

  const handleFilterChange = (_key, value) => {
    setStatusFilter(value);
    applyFilters(searchTerm, value);
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
  <TopNav showLogout showBackButton />
      
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
          onRowClick={(_payment) => {}}
        />

        <ChartCard title="Payment Trends">
          <ErrorBoundary>
            {Array.isArray(payments) && payments.length > 0 ? (
              <PaymentChart payments={payments} />
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: '#888' }}>No payment data available.</div>
            )}
          </ErrorBoundary>
        </ChartCard>

        <div className="quick-actions">
          <ActionCard
            to="#"
            icon={<Icon name="notifications" alt="Send Reminders" />}
            title="Send Reminders"
            description="Notify tenants"
          />
          <ActionCard
            to="#"
            icon={<Icon name="report" alt="Generate Report" />}
            title="Generate Report"
            description="Payment summary"
          />
          <ActionCard
            to="#"
            icon={<Icon name="archive" alt="Export Data" />}
            title="Export Data"
            description="Download CSV"
            onClick={() => {
              const exportRows = Array.isArray(filteredPayments) && filteredPayments.length > 0
                ? filteredPayments
                : Array.isArray(payments)
                  ? payments
                  : [];

              if (exportRows.length === 0) {
                globalThis.alert('No payment data available to export.');
                return;
              }

              const headers = ["Tenant", "Property", "Unit", "Amount", "Due Date", "Status"];
              const csvRows = [headers.join(",")];
              const wrap = (value: unknown) => {
                if (value === null || value === undefined) {
                  return '""';
                }
                const normalized = String(value).replace(/"/g, '""');
                return `"${normalized}"`;
              };

              exportRows.forEach((p) => {
                csvRows.push([
                  wrap(p?.tenantName ?? ''),
                  wrap(p?.propertyName ?? ''),
                  wrap(p?.unitNumber ?? ''),
                  wrap(p?.amount ?? ''),
                  wrap(p?.dueDate ?? ''),
                  wrap(p?.status ?? '')
                ].join(","));
              });

              const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "payments.csv";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
            }}
          />
  </div>

      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default ManagerPaymentsPage;
