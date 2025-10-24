import { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import DataTable from '../components/DataTable.tsx';
import SearchFilter from '../components/SearchFilter.tsx';
import { paymentsApi, useApi, formatCurrency, formatDate } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

interface Payment {
  id: string;
  invoiceNumber?: string;
  amount: number;
  dueDate: string;
  status: string;
  method?: string;
  tenant?: { fullName: string };
  property?: { name: string };
  proofUrl?: string;
  reference?: string;
  notes?: string;
}

function ManagerPaymentsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');

  const navItems = [
    { path: '/manager', label: t('nav.dashboard'), icon: 'performanceAnalytics' },
    { path: '/manager/properties', label: t('nav.properties'), icon: 'properties' },
    { path: '/manager/leases', label: t('nav.leases'), icon: 'lease' },
    { path: '/manager/payments', label: t('nav.payments'), icon: 'payment', active: true }
  ];

  const { data: payments, loading: paymentsLoading, error: _paymentsError, refetch: refetchPayments } = useApi(
    () => paymentsApi.getAll({ managerId: user?.id }),
    [user?.id]
  );


  // Calculate stats
  const getPaymentStats = () => {
    if (!payments) return { totalDue: 0, pendingApproval: 0, overdue: 0, paid: 0 };

    const today = new Date();
    const totalDue = payments
      .filter(p => p.status !== 'paid')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const pendingApproval = payments.filter(p => p.status === 'pending_approval').length;

    const overdue = payments.filter(p => {
      if (p.status === 'paid') return false;
      const dueDate = new Date(p.dueDate);
      const daysDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDue > 14;
    }).length;

    const paid = payments.filter(p => p.status === 'paid').length;

    return { totalDue, pendingApproval, overdue, paid };
  };

  const stats = getPaymentStats();

  // Filter payments
  useEffect(() => {
    if (!payments) return;

    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        (payment.tenant?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.property?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Sort by due date, overdue first
    filtered.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter]);

  const handleApprovePayment = async () => {
    if (!selectedPayment) return;

    try {
      await paymentsApi.approve(selectedPayment.id, user?.id || '', approvalNotes);
      alert('Payment approved successfully!');
      setReviewMode(false);
      setSelectedPayment(null);
      setApprovalNotes('');
      refetchPayments();
    } catch (error) {
      alert('Failed to approve payment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleRejectPayment = async () => {
    if (!selectedPayment) return;
    if (!approvalNotes) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      await paymentsApi.reject(selectedPayment.id, user?.id || '', approvalNotes);
      alert('Payment rejected');
      setReviewMode(false);
      setSelectedPayment(null);
      setApprovalNotes('');
      refetchPayments();
    } catch (error) {
      alert('Failed to reject payment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'overdue': return 'status-overdue';
      case 'pending_approval': return 'status-pending';
      default: return 'status-pending';
    }
  };

  const paymentColumns = [
    {
      key: 'tenant',
      label: t('common.tenant'),
      render: (value: { fullName: string } | undefined) => value?.fullName || 'N/A'
    },
    {
      key: 'property',
      label: t('common.property'),
      render: (value: { name: string } | undefined) => value?.name || 'N/A'
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (value: string) => formatDate(value)
    },
    {
      key: 'status',
      label: t('common.status'),
      render: (value: string) => (
        <span className={`status-badge ${getStatusColor(value)}`}>
          {value?.toUpperCase() || 'N/A'}
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
        { value: 'pending', label: 'Pending' },
        { value: 'pending_approval', label: 'Pending Approval' },
        { value: 'paid', label: 'Paid' },
        { value: 'overdue', label: 'Overdue' }
      ]
    }
  ];

  if (paymentsLoading) {
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

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />

      <div className="main-content">
        <div className="page-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="page-title">Payments</div>
              <div className="page-subtitle">Manage tenant payments and invoices</div>
            </div>
            <button
              type="button"
              onClick={() => refetchPayments()}
              disabled={paymentsLoading}
              className="btn btn-secondary"
              style={{ fontSize: '13px', padding: '8px 12px' }}
              title="Refresh payment data"
            >
              {paymentsLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="dashboard-grid">
          <StatCard value={formatCurrency(stats.totalDue)} label="Total Due" />
          <StatCard value={stats.pendingApproval} label="Pending Approval" highlight={stats.pendingApproval > 0} />
          <StatCard value={stats.overdue} label="Overdue (14+ days)" highlight={stats.overdue > 0} />
          <StatCard value={stats.paid} label="Paid This Month" />
        </div>

        {/* Alerts */}
        {stats.overdue > 0 && (
          <div style={{
            background: 'var(--error-light, rgba(231, 76, 60, 0.1))',
            border: '1px solid var(--error-color, #e74c3c)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            color: 'var(--error-color, #e74c3c)'
          }}>
            <strong>{stats.overdue} payments are overdue by more than 14 days</strong>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>
              Consider sending escalation notices to tenants.
            </p>
          </div>
        )}

        {/* Search & Filter */}
        <SearchFilter
          placeholder="Search tenant, property, or invoice..."
          onSearch={setSearchTerm}
          filters={filters}
          onFilterChange={(_key, value) => setStatusFilter(value)}
        />

        {/* Payments Table */}
        <DataTable
          title="Payment Records"
          data={filteredPayments}
          columns={paymentColumns}
          actions={null}
          onRowClick={(payment) => {
            setSelectedPayment(payment);
            setReviewMode(true);
          }}
        />

        {filteredPayments.length === 0 && !paymentsLoading && (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
              No payments found
            </div>
            <div style={{ fontSize: '13px' }}>
              {searchTerm ? 'Try adjusting your search' : 'No payments to display'}
            </div>
          </div>
        )}
      </div>

      {/* Payment Review Modal */}
      {reviewMode && selectedPayment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--surface)',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: 'var(--shadow-lg)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>
                Review Payment
              </h2>
              <button
                type="button"
                onClick={() => {
                  setReviewMode(false);
                  setSelectedPayment(null);
                  setApprovalNotes('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            </div>

            {/* Payment Details */}
            <div style={{
              background: 'var(--background)',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>TENANT</div>
                <div style={{ fontSize: '16px', fontWeight: '600' }}>
                  {selectedPayment.tenant?.fullName}
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>PROPERTY</div>
                <div style={{ fontSize: '16px' }}>
                  {selectedPayment.property?.name}
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>AMOUNT</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--primary)' }}>
                  {formatCurrency(selectedPayment.amount)}
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>DUE DATE</div>
                <div style={{ fontSize: '16px' }}>
                  {formatDate(selectedPayment.dueDate)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>STATUS</div>
                <span className={`status-badge ${getStatusColor(selectedPayment.status)}`}>
                  {selectedPayment.status?.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Approval Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                {selectedPayment.status === 'pending_approval' ? 'Approval Notes (optional)' : 'Reason for Action'}
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any notes..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  minHeight: '80px',
                  resize: 'none'
                }}
              />
            </div>

            {selectedPayment.status === 'pending_approval' && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setReviewMode(false);
                    setSelectedPayment(null);
                    setApprovalNotes('');
                  }}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleRejectPayment}
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={handleApprovePayment}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  Approve
                </button>
              </div>
            )}
            {selectedPayment.status !== 'pending_approval' && (
              <button
                type="button"
                onClick={() => {
                  setReviewMode(false);
                  setSelectedPayment(null);
                  setApprovalNotes('');
                }}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}

      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default ManagerPaymentsPage;
