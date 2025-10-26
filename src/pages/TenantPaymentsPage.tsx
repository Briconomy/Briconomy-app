import { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import DataTable from '../components/DataTable.tsx';
import InvoiceViewer from '../components/InvoiceViewer.tsx';
import PaymentMethodSelector, { PaymentMethod } from '../components/PaymentMethodSelector.tsx';
import FakeCheckout from '../components/FakeCheckout.tsx';
import Icon from '../components/Icon.tsx';
import { invoicesApi, paymentsApi, documentsApi, useApi, formatCurrency, formatDate } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { notificationService } from '../services/notifications.ts';

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: string;
  description?: string;
  tenant?: { fullName: string };
  property?: { name: string; address: string };
  propertyId?: string;
  managerId?: string;
  leaseId?: string;
}

interface PaymentFormData {
  invoiceId: string;
  amount: number;
  method: PaymentMethod | null;
  proofFile?: { name: string; data: string; mimeType: string };
  reference?: string;
  notes?: string;
}

function TenantPaymentsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'invoices' | 'history'>('invoices');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentMode, setPaymentMode] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [_generatedReference, setGeneratedReference] = useState('');

  const navItems = [
    { path: '/tenant', label: t('nav.home'), icon: 'properties' },
    { path: '/tenant/payments', label: t('nav.payments'), icon: 'payment', active: true },
    { path: '/tenant/requests', label: t('nav.requests'), icon: 'maintenance' },
    { path: '/tenant/profile', label: t('nav.profile'), icon: 'profile' }
  ];

  // Fetch invoices
  const { data: invoices, loading: invoicesLoading, refetch: refetchInvoices } = useApi(
    () => invoicesApi.getAll({ tenantId: user?.id }),
    [user?.id]
  );

  // Fetch payment history
  const { data: payments, loading: paymentsLoading, refetch: refetchPayments } = useApi(
    () => paymentsApi.getAll({ tenantId: user?.id }),
    [user?.id]
  );

  // Calculate stats
  const getStats = () => {
    if (!invoices) return { totalDue: 0, overdue: 0, nextDue: null };

    const today = new Date();
    const pending: Invoice[] = invoices.filter(inv => inv.status !== 'paid');

    const totalDue = pending.reduce((sum, inv) => sum + (inv.amount || 0), 0);

    const overdue = pending.filter(inv => {
      const dueDate = new Date(inv.dueDate);
      return dueDate < today;
    }).length;

    const nextDue = pending
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0] || null;

    return { totalDue, overdue, nextDue };
  };

  const stats = getStats();
  const invoiceList = Array.isArray(invoices) ? (invoices as Invoice[]) : [];
  const pendingInvoices = invoiceList.filter(inv => inv.status !== 'paid');
  const overdueLabel = stats.overdue === 1 ? 'invoice' : 'invoices';

  const handlePaymentComplete = async (reference: string) => {
    if (!selectedInvoice || !selectedPaymentMethod) {
      alert('Missing payment information');
      return;
    }

    setSubmitting(true);
    try {
      const paymentData = {
        tenantId: user?.id,
        leaseId: selectedInvoice.leaseId || selectedInvoice.id,
        invoiceId: selectedInvoice.id,
        propertyId: selectedInvoice.propertyId,
        managerId: selectedInvoice.managerId,
        amount: selectedInvoice.amount,
        dueDate: selectedInvoice.dueDate,
        method: selectedPaymentMethod,
        reference: reference,
        status: 'paid',
        notes: paymentNotes,
        paymentDate: new Date().toISOString()
      };

      await paymentsApi.create(paymentData);

      await invoicesApi.update(selectedInvoice.id, {
        status: 'paid',
        paidAt: new Date().toISOString()
      });

      // #COMPLETION_DRIVE: Send payment confirmation notification to trigger manager update
      // #SUGGEST_VERIFY: Backend creates notification that broadcasts to manager via WebSocket
      notificationService.sendPaymentConfirmation(selectedInvoice.amount, selectedPaymentMethod.label || 'Unknown');

      alert('Payment submitted successfully!');
      setShowCheckout(false);
      setPaymentMode(false);
      setSelectedInvoice(null);
      setSelectedPaymentMethod(null);
      setPaymentNotes('');
      setGeneratedReference('');
      refetchInvoices();
      refetchPayments();
    } catch (error) {
      alert('Failed to submit payment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedInvoice || !selectedPaymentMethod) {
      alert('Please select a payment method');
      return;
    }

    setShowCheckout(true);
  };

  const paymentHistoryColumns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice',
      render: (value: string) => value || 'N/A'
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'paymentDate',
      label: 'Date Paid',
      render: (value?: string) => value ? formatDate(value) : 'Pending'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`status-badge ${
          value === 'paid' ? 'status-paid' :
          value === 'pending_approval' ? 'status-pending' :
          value === 'overdue' ? 'status-overdue' : 'status-pending'
        }`}>
          {value?.toUpperCase()}
        </span>
      )
    }
  ];

  if (invoicesLoading || paymentsLoading) {
    return (
      <div className="app-container mobile-only page-wrapper">
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
    <div className="app-container mobile-only page-wrapper">
      <TopNav showLogout showBackButton />

      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Payments</div>
          <div className="page-subtitle">View invoices and manage payments</div>
        </div>

        <div className="dashboard-grid">
          <StatCard value={formatCurrency(stats.totalDue)} label="Total Due" highlight={stats.totalDue > 0} />
          <StatCard value={stats.overdue} label="Overdue Invoices" highlight={stats.overdue > 0} />
          <StatCard value={stats.nextDue ? formatDate(stats.nextDue.dueDate) : 'N/A'} label="Next Due Date" />
        </div>

        {stats.overdue > 0 && (
          <div className="alert-banner">
            <div className="alert-banner-icon">
              <Icon name="alert" alt="Overdue invoices" size={40} />
            </div>
            <div className="alert-banner-content">
              <div className="alert-title">{`You have ${stats.overdue} overdue ${overdueLabel}`}</div>
              <div className="alert-text">Please submit payment to avoid penalties.</div>
            </div>
          </div>
        )}

        <div className="tab-controls">
          <button
            type="button"
            className={`tab-button ${activeTab === 'invoices' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveTab('invoices');
              setPaymentMode(false);
            }}
          >
            Invoices
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'history' ? 'is-active' : ''}`}
            onClick={() => {
              setActiveTab('history');
              setPaymentMode(false);
              setSelectedInvoice(null);
            }}
          >
            Payment History
          </button>
        </div>

        {activeTab === 'invoices' && !paymentMode && (
          <div>
            {invoiceList.length === 0 ? (
              <div className="section-card empty-state-card">
                <Icon name="invoice" alt="Invoices" size={48} />
                <div className="empty-state-title">No invoices</div>
                <div className="empty-state-text">You do not have any outstanding invoices.</div>
              </div>
            ) : (
              <div className="support-grid">
                {invoiceList.map(invoice => (
                  <InvoiceViewer
                    key={invoice.id}
                    invoice={invoice}
                    onDownload={async (id, format) => {
                      try {
                        await invoicesApi.download(id, format);
                      } catch (_error) {
                        alert('Failed to download invoice');
                      }
                    }}
                    onPay={(selectedInv) => {
                      setSelectedInvoice(selectedInv);
                      setPaymentMode(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'invoices' && paymentMode && selectedInvoice && (
          <div className="support-grid">
            <div className="section-card">
              <div className="action-stack">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setPaymentMode(false);
                    setSelectedInvoice(null);
                    setSelectedPaymentMethod(null);
                    setPaymentNotes('');
                  }}
                >
                  Back to invoices
                </button>
              </div>
              <div className="card-divider">
                <div className="section-title">Selected invoice</div>
                <div className="section-subtitle">Due {formatDate(selectedInvoice.dueDate)}</div>
              </div>
              <div className="invoice-summary">
                <div className="invoice-meta">
                  <span>{selectedInvoice.invoiceNumber}</span>
                  <span>{formatDate(selectedInvoice.issueDate)}</span>
                </div>
                <div className="invoice-amount">{formatCurrency(selectedInvoice.amount)}</div>
              </div>
            </div>

            <div className="section-card">
              <PaymentMethodSelector selected={selectedPaymentMethod} onChange={setSelectedPaymentMethod} />

              <div className="card-divider">
                <label className="form-label" htmlFor="payment-notes">Additional notes</label>
                <textarea
                  id="payment-notes"
                  className="form-textarea"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Add context for this payment"
                />
              </div>

              <div className="card-actions">
                <button
                  type="button"
                  className="btn btn-primary full-width-button"
                  onClick={handleSubmitPayment}
                  disabled={!selectedPaymentMethod || submitting}
                >
                  {submitting ? 'Processing payment...' : `Pay ${formatCurrency(selectedInvoice.amount)}`}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {!payments || payments.length === 0 ? (
              <div className="section-card empty-state-card">
                <Icon name="payment" alt="Payments" size={48} />
                <div className="empty-state-title">No payment history</div>
                <div className="empty-state-text">Your payments will appear here once processed.</div>
              </div>
            ) : (
              <DataTable
                title="Payment History"
                data={payments || []}
                columns={paymentHistoryColumns}
                actions={null}
                onRowClick={() => {}}
              />
            )}
          </div>
        )}
      </div>

      {showCheckout && selectedInvoice && (
        <FakeCheckout
          amount={selectedInvoice.amount}
          invoiceNumber={selectedInvoice.invoiceNumber}
          tenantName={selectedInvoice.tenant?.fullName || 'Tenant'}
          onComplete={async (reference) => {
            setGeneratedReference(reference);
            await handlePaymentComplete(reference);
          }}
          onCancel={() => {
            setShowCheckout(false);
          }}
          isLoading={submitting}
        />
      )}

      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default TenantPaymentsPage;
