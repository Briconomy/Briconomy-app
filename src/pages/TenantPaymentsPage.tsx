import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import PaymentChart from '../components/PaymentChart.tsx';
import { paymentsApi, leasesApi, formatCurrency, formatDate, useApi } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.tsx';

interface PaymentMethod {
  id: string;
  type: 'bank_account' | 'credit_card' | 'debit_card' | 'eft';
  name: string;
  details: string;
  isDefault: boolean;
}

function TenantPaymentsPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');
  const [processing, setProcessing] = useState(false);
  const [chartError, setChartError] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([]);

  const navItems = [
    { path: '/tenant', label: t('nav.home'), icon: 'properties', active: false },
    { path: '/tenant/payments', label: t('nav.payments'), icon: 'payment', active: true },
    { path: '/tenant/requests', label: t('nav.requests'), icon: 'maintenance' },
    { path: '/tenant/profile', label: t('nav.profile'), icon: 'profile' }
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
    ?.filter((p: any) => p.status === 'pending')
    .reduce((sum: number, p: any) => sum + p.amount, 0) || 0;

  const nextPayment = payments
    ?.filter((p: any) => p.status === 'pending')
    .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const getDaysUntilDue = (dueDate: string | Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'overdue': return 'status-overdue';
      default: return 'status-pending';
    }
  };

  const handleMakePayment = (payment: any) => {
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
      payments: payments?.filter((p: any) => p.status === 'paid') || [],
      totalPaid: payments?.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + p.amount, 0) || 0,
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
        <TopNav showLogout showBackButton={true} />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t('payments.loadingPayments')}</p>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  const currentLease = leases?.[0];

  const renderPaymentChart = () => {
    if (!payments || payments.length === 0) {
      return (
        <div className="chart-empty">
          <p>{t('payments.noPaymentHistory')}</p>
        </div>
      );
    }

    return (
      <ChartCard title={t('payments.paymentHistoryChart')}>
        <ErrorBoundary onError={() => setChartError(true)}>
          <PaymentChart payments={payments} />
        </ErrorBoundary>
      </ChartCard>
    );
  };

  return (
    <div className="app-container mobile-only" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav showLogout showBackButton={true} />
      <div className="main-content" style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        <div className="page-header" style={{ marginBottom: '16px' }}>
          <div className="page-title">{t('nav.payments')}</div>
          <div className="page-subtitle">{t('payments.subtitle')}</div>
        </div>

        {currentLease && (
          <div className="lease-summary-card" style={{ marginBottom: '16px' }}>
            <h3>{t('payments.currentLease')}</h3>
            <div className="lease-summary">
              <div className="lease-item">
                <span>{t('payments.monthlyRent')} </span>
                <span className="lease-value">{formatCurrency(currentLease.monthlyRent)}</span>
              </div>
              <div className="lease-item">
                <span>{t('payments.unit')} </span>
                <span className="lease-value">{currentLease.unitId?.unitNumber || 'N/A'}</span>
              </div>
              <div className="lease-item">
                <span>{t('payments.property')} </span>
                <span className="lease-value">{currentLease.propertyId?.name || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-grid" style={{ marginBottom: '16px', gap: '12px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <StatCard value={formatCurrency(totalDue)} label={t('payments.totalDue')} />
          <StatCard value={nextPayment ? formatCurrency(nextPayment.amount) : 'R0'} label={t('payments.nextPayment')} />
          <StatCard value={nextPayment ? `${getDaysUntilDue(nextPayment.dueDate)} days` : 'N/A'} label={t('payments.daysUntilDue')} />
          <StatCard value={payments?.filter((p: any) => p.status === 'paid').length || 0} label={t('payments.paymentsMade')} />
        </div>

        {nextPayment && (
          <div className="payment-reminder-card" style={{ marginBottom: '16px' }}>
            <div className="reminder-content">
              <div className="reminder-icon">{t('payments.reminder')}</div>
              <div className="reminder-text">
                <h4>{t('payments.paymentReminder')}</h4>
                <p>{t('payments.rentDueIn').replace('{amount}', formatCurrency(nextPayment.amount)).replace('{days}', getDaysUntilDue(nextPayment.dueDate).toString())}</p>
                <p className="due-date">{t('payments.dueDate')} {formatDate(nextPayment.dueDate)}</p>
              </div>
              <button 
                type="button"
                className="btn btn-primary"
                onClick={() => handleMakePayment(nextPayment)}
              >
                {t('payments.payNow')}
              </button>
            </div>
          </div>
        )}

        {renderPaymentChart()}

        <div className="payment-methods-section" style={{ marginBottom: '16px' }}>
          <div className="section-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
            <h3>{t('payments.paymentMethods')}</h3>
            <button 
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => navigate('/tenant/manage-payment-methods')}
              style={{ marginTop: '4px' }}
            >
              {t('payments.managePaymentMethods')}
            </button>
          </div>
          <div className="payment-methods-summary">
            <p>{t('payments.quickCheckout')}</p>
          </div>
        </div>

        <div className="payment-actions-section" style={{ marginBottom: '16px' }}>
          <h3>{t('payments.quickActions')}</h3>
          <div className="quick-actions" style={{ display: 'flex', gap: '12px' }}>
            <ActionCard
              onClick={_handleDownloadStatement}
              icon={<Icon name="document" alt="Download Statement" />}
              title={t('payments.downloadStatement')}
              description={t('payments.paymentHistory')}
            />
            <ActionCard
              onClick={() => setShowPaymentForm(true)}
              icon={<Icon name="payment" alt="Make Payment" />}
              title={t('payments.makePayment')}
              description={t('payments.payRentOnline')}
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
                                  {method.type === 'bank_account' ? 'Bank' : 
                                   method.type === 'credit_card' || method.type === 'debit_card' ? 'Card' : 'Mobile'}
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
      </div>
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

  override render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

export default TenantPaymentsPage;
