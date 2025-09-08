import _React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import PaymentChart from '../components/PaymentChart.tsx';
import { paymentsApi, leasesApi, formatCurrency, formatDate, useApi } from '../services/api.ts';

function TenantPaymentsPage() {
  const [user, setUser] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [processing, setProcessing] = useState(false);

  const navItems = [
    { path: '/tenant', label: 'Home', active: false },
    { path: '/tenant/payments', label: 'Payments', active: true },
    { path: '/tenant/requests', label: 'Requests' },
    { path: '/tenant/profile', label: 'Profile' }
  ];

  const { data: payments, loading: paymentsLoading, refetch: refetchPayments } = useApi(
    () => paymentsApi.getAll({ tenantId: user?.id || '507f1f77bcf86cd799439012' }),
    [user?.id]
  );

  const { data: leases, loading: leasesLoading } = useApi(
    () => leasesApi.getAll({ tenantId: user?.id || '507f1f77bcf86cd799439012' }),
    [user?.id]
  );

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
  const userData = JSON.parse(localStorage.getItem('briconomy_user') || localStorage.getItem('user') || '{}');
      setUser(userData);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const totalDue = payments
    ?.filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0) || 0;

  const nextPayment = payments
    ?.filter(p => p.status === 'pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const getDaysUntilDue = (dueDate: string | Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'overdue': return 'status-overdue';
      default: return 'status-pending';
    }
  };

  const handleMakePayment = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentForm(true);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedPayment) return;

    setProcessing(true);
    try {
      await paymentsApi.updateStatus(selectedPayment.id, 'paid');
      await refetchPayments();
      setShowPaymentForm(false);
      setSelectedPayment(null);
      setPaymentMethod('bank_transfer');
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const _handleDownloadStatement = () => {
    const statementData = {
      payments: payments?.filter(p => p.status === 'paid') || [],
      totalPaid: payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0) || 0,
      generatedDate: new Date().toISOString(),
      tenant: user
    };

    const blob = new Blob([JSON.stringify(statementData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-statement-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (paymentsLoading || leasesLoading) {
    return (
      <div className="app-container mobile-only">
  <TopNav showLogout />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading payments...</p>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  const currentLease = leases?.[0];

  return (
    <div className="app-container mobile-only">
  <TopNav showLogout />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Payments</div>
          <div className="page-subtitle">Manage your rent and utilities</div>
        </div>
        
        {currentLease && (
          <div className="lease-summary-card">
            <h3>Current Lease</h3>
            <div className="lease-summary">
              <div className="lease-item">
                <span>Monthly Rent:</span>
                <span className="lease-value">{formatCurrency(currentLease.monthlyRent)}</span>
              </div>
              <div className="lease-item">
                <span>Unit:</span>
                <span className="lease-value">{currentLease.unitId?.unitNumber || 'N/A'}</span>
              </div>
              <div className="lease-item">
                <span>Property:</span>
                <span className="lease-value">{currentLease.propertyId?.name || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="dashboard-grid">
          <StatCard value={formatCurrency(totalDue)} label="Total Due" />
          <StatCard value={nextPayment ? formatCurrency(nextPayment.amount) : 'R0'} label="Next Payment" />
          <StatCard value={nextPayment ? `${getDaysUntilDue(nextPayment.dueDate)} days` : 'N/A'} label="Days Until Due" />
          <StatCard value={payments?.filter(p => p.status === 'paid').length || 0} label="Payments Made" />
        </div>

        <ChartCard title="Payment History">
          <PaymentChart payments={payments} />
        </ChartCard>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Payment Schedule</div>
          </div>
          
          {payments?.map((payment) => (
            <div key={payment.id} className="list-item">
              <div className="item-info">
                <h4>{payment.type === 'rent' ? 'Rent Payment' : payment.type}</h4>
                <p>Due: {formatDate(payment.dueDate)} - {formatCurrency(payment.amount)}</p>
                {payment.paymentDate && (
                  <p className="text-sm text-gray-600">Paid: {formatDate(payment.paymentDate)}</p>
                )}
                {payment.method && (
                  <p className="text-sm text-gray-600">Method: {payment.method.replace('_', ' ')}</p>
                )}
              </div>
              <div className="item-actions">
                <span className={`status-badge ${getPaymentStatusColor(payment.status)}`}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
        {payment.status === 'pending' && (
                  <button 
          className="btn btn-primary btn-sm"
          type="button"
                    onClick={() => handleMakePayment(payment)}
                  >
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="quick-actions">
          <ActionCard
            onClick={_handleDownloadStatement}
            icon="S"
            title="Download Statement"
            description="Get your payment history"
          />
          <ActionCard
            onClick={() => setShowPaymentForm(true)}
            icon="P"
            title="Make Payment"
            description="Pay your rent online"
          />
          <ActionCard
            to="/tenant/profile"
            icon="M"
            title="Payment Methods"
            description="Manage payment options"
          />
        </div>
      </div>
      
      {showPaymentForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Make Payment</h3>
              <button type="button" className="close-btn" onClick={() => setShowPaymentForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="payment-details">
                <p><strong>Amount:</strong> {selectedPayment ? formatCurrency(selectedPayment.amount) : 'R0'}</p>
                <p><strong>Type:</strong> {selectedPayment?.type || 'Rent'}</p>
                <p><strong>Due Date:</strong> {selectedPayment ? formatDate(selectedPayment.dueDate) : 'N/A'}</p>
              </div>
              
              <div className="payment-methods">
                <h4>Select Payment Method</h4>
                <div className="payment-options">
                  <label className="payment-option">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Bank Transfer</span>
                  </label>
                  <label className="payment-option">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>Credit/Debit Card</span>
                  </label>
                  <label className="payment-option">
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="eft"
                      checked={paymentMethod === 'eft'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>EFT</span>
                  </label>
                </div>
              </div>
              
              <div className="form-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentForm(false)}
                  disabled={processing}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePaymentSubmit}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default TenantPaymentsPage;