import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import PaymentChart from '../components/PaymentChart.tsx';
import { paymentsApi, leasesApi, formatCurrency, formatDate, useApi } from '../services/api.ts';

interface PaymentMethod {
  id: string;
  type: 'bank_account' | 'credit_card' | 'debit_card' | 'eft';
  name: string;
  details: string;
  isDefault: boolean;
}

function TenantPaymentsPage() {
  const [user, setUser] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [processing, setProcessing] = useState(false);
  const [chartError, setChartError] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([]);

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

  const loadUserData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('briconomy_user') || localStorage.getItem('user') || '{}');
      setUser(userData);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const loadSavedPaymentMethods = () => {
    try {
      const saved = localStorage.getItem('briconomy_payment_methods');
      if (saved) {
        setSavedPaymentMethods(JSON.parse(saved));
      } else {
        // Default payment method
        setSavedPaymentMethods([{
          id: '1',
          type: 'bank_account',
          name: 'Primary Bank Account',
          details: '**** **** **** 1234',
          isDefault: true
        }]);
      }
    } catch (err) {
      console.error('Error loading payment methods:', err);
      setSavedPaymentMethods([]);
    }
  };

  useEffect(() => {
    loadUserData();
    loadSavedPaymentMethods();
  }, []);

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

  const renderPaymentChart = () => {
    if (chartError) {
      return (
        <div className="chart-error">
          <p>Unable to load payment history chart</p>
        </div>
      );
    }

    if (!payments || payments.length === 0) {
      return (
        <div className="chart-empty">
          <p>No payment history available</p>
        </div>
      );
    }

    return (
      <ChartCard title="Payment History">
        <ErrorBoundary onError={() => setChartError(true)}>
          <PaymentChart payments={payments} />
        </ErrorBoundary>
      </ChartCard>
    );
  };

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

        {nextPayment && (
          <div className="payment-reminder-card">
            <div className="reminder-content">
              <div className="reminder-icon">⏰</div>
              <div className="reminder-text">
                <h4>Payment Reminder</h4>
                <p>Your rent payment of {formatCurrency(nextPayment.amount)} is due in {getDaysUntilDue(nextPayment.dueDate)} days</p>
                <p className="due-date">Due Date: {formatDate(nextPayment.dueDate)}</p>
              </div>
              <button 
                type="button"
                className="btn btn-primary"
                onClick={() => handleMakePayment(nextPayment)}
              >
                Pay Now
              </button>
            </div>
          </div>
        )}

        {renderPaymentChart()}

        <div className="payment-schedule">
          <div className="section-header">
            <h3>Payment Schedule</h3>
            <div className="schedule-summary">
              <span className="summary-item">
                <strong>Total:</strong> {formatCurrency(payments?.reduce((sum, p) => sum + p.amount, 0) || 0)}
              </span>
              <span className="summary-item">
                <strong>Paid:</strong> {payments?.filter(p => p.status === 'paid').length || 0}
              </span>
              <span className="summary-item">
                <strong>Pending:</strong> {payments?.filter(p => p.status === 'pending').length || 0}
              </span>
            </div>
          </div>
          
          <div className="payments-list">
            {payments?.map((payment) => (
              <div key={payment.id} className="payment-item">
                <div className="payment-left">
                  <div className="payment-type-icon">
                    {payment.type === 'rent' ? '🏠' : '💰'}
                  </div>
                  <div className="payment-details">
                    <h4>{payment.type === 'rent' ? 'Rent Payment' : payment.type}</h4>
                    <div className="payment-meta">
                      <span className="payment-amount">{formatCurrency(payment.amount)}</span>
                      <span className="payment-due">Due: {formatDate(payment.dueDate)}</span>
                    </div>
                    {payment.paymentDate && (
                      <div className="payment-paid-info">
                        <span className="paid-date">Paid: {formatDate(payment.paymentDate)}</span>
                        {payment.method && (
                          <span className="payment-method">Method: {payment.method.replace('_', ' ')}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="payment-right">
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

            {payments?.length === 0 && (
              <div className="no-payments-state">
                <div className="no-payments-icon">📋</div>
                <h4>No Payments Found</h4>
                <p>No payment schedule is currently available. Please check back later or contact your property manager.</p>
              </div>
            )}
          </div>
        </div>

        <div className="payment-actions-section">
          <h3>Quick Actions</h3>
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
                
                {savedPaymentMethods.length > 0 && (
                  <div className="saved-payment-methods">
                    <h5>Saved Payment Methods</h5>
                    <div className="saved-methods-list">
                      {savedPaymentMethods.map((method) => (
                        <label key={method.id} className="saved-method-option">
                          <input
                            type="radio"
                            name="savedPaymentMethod"
                            value={method.id}
                            checked={paymentMethod === `saved_${method.id}`}
                            onChange={(e) => setPaymentMethod(`saved_${method.id}`)}
                          />
                          <div className="saved-method-info">
                            <div className="method-header">
                              <span className="method-icon">
                                {method.type === 'bank_account' ? '🏦' : 
                                 method.type === 'credit_card' || method.type === 'debit_card' ? '💳' : '📱'}
                              </span>
                              <div className="method-details">
                                <span className="method-name">{method.name}</span>
                                <span className="method-details-text">{method.details}</span>
                              </div>
                              {method.isDefault && (
                                <span className="default-badge">Default</span>
                              )}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="new-payment-methods">
                  <h5>New Payment Method</h5>
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
                
                <div className="add-payment-method">
                  <button 
                    type="button"
                    className="btn btn-link"
                    onClick={() => {
                      // Navigate to profile page with payment methods section active
                      window.location.href = '/tenant/profile';
                      // This would ideally use React Router, but for simplicity using direct navigation
                      setTimeout(() => {
                        // This is a workaround - in a real app, you'd use router state
                        const profileSection = document.querySelector('[data-section="payment-methods"]');
                        if (profileSection) {
                          profileSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                  >
                    + Add New Payment Method
                  </button>
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

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError?: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error) {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export default TenantPaymentsPage;
