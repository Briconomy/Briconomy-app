import { useState, useEffect, useRef } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import InvoiceViewer from '../components/InvoiceViewer.tsx';
import PaymentMethodSelector, { PaymentMethod, PAYMENT_METHODS } from '../components/PaymentMethodSelector.tsx';
import FakeCheckout from '../components/FakeCheckout.tsx';
import Icon from '../components/Icon.tsx';
import { invoicesApi, paymentsApi, useApi, formatCurrency, formatDate } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { notificationService } from '../services/notifications.ts';
import { WebSocketManager } from '../utils/websocket-manager.ts';

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
  const { showToast } = useToast();
  const wsManagerRef = useRef<WebSocketManager | null>(null);
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

  // Fetch invoices (used for both tabs)
  const { data: invoices, loading: invoicesLoading, refetch: refetchInvoices } = useApi(
    () => invoicesApi.getAll({ tenantId: user?.id }),
    [user?.id]
  );

  const refetchInvoicesRef = useRef(refetchInvoices);
  useEffect(() => {
    refetchInvoicesRef.current = refetchInvoices;
  }, [refetchInvoices]);

  // #COMPLETION_DRIVE: WebSocket listener to auto-refetch invoices across both tabs on payment status change
  // #SUGGEST_VERIFY: Verify real-time updates sync invoices and payment history tabs simultaneously
  useEffect(() => {
    if (!user?.id) return;

    const handleWebSocketMessage = (data: unknown) => {
      const message = data as Record<string, unknown>;
      if (message.type === 'notification') {
        const notifData = message.data as Record<string, unknown> | undefined;
        if (notifData && (notifData.type === 'payment_received' || notifData.type === 'payment_submitted')) {
          refetchInvoicesRef.current();
        }
      }
    };

    wsManagerRef.current = new WebSocketManager({
      userId: user.id,
      onMessage: handleWebSocketMessage,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000
    });

    wsManagerRef.current.connect();

    return () => {
      if (wsManagerRef.current) {
        wsManagerRef.current.disconnect();
      }
    };
  }, [user?.id]);

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
      .toSorted((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0] || null;

    return { totalDue, overdue, nextDue };
  };

  const stats = getStats();
  const invoiceList = Array.isArray(invoices) ? (invoices as Invoice[]) : [];
  const paidInvoices = invoiceList.filter(inv => inv.status === 'paid');
  const invoiceSingular = t('payments.invoiceSingular') || 'invoice';
  const invoicePlural = t('payments.invoicePlural') || 'invoices';
  const overdueLabel = stats.overdue === 1 ? invoiceSingular : invoicePlural;
  // #COMPLETION_DRIVE: Assuming translation templates supply {count} and {label} placeholders for overdue banner text
  // #SUGGEST_VERIFY: Switch languages and confirm overdue banner renders expected values
  const overdueBannerTitleTemplate = t('payments.overdueBannerTitle') || 'You have {count} overdue {label}';
  const overdueBannerText = t('payments.overdueBannerText') || 'Please submit payment to avoid penalties.';
  const notAvailableLabel = t('common.notAvailable') || 'N/A';
  const invoicesTabLabel = t('payments.tab.invoices') || 'Invoices';
  const historyTabLabel = t('payments.tab.history') || t('payments.paymentHistory') || 'Payment History';
  const emptyInvoicesTitle = t('payments.emptyInvoicesTitle') || 'No invoices';
  const emptyInvoicesDescription = t('payments.emptyInvoicesDescription') || 'You do not have any outstanding invoices.';
  const emptyHistoryTitle = t('payments.emptyHistoryTitle') || 'No payment history';
  const emptyHistoryDescription = t('payments.emptyHistoryDescription') || 'Your payments will appear here once processed.';
  const backToInvoicesLabel = t('payments.backToInvoices') || 'Back to invoices';
  const selectedInvoiceTitle = t('payments.selectedInvoice') || 'Selected invoice';
  // #COMPLETION_DRIVE: Assuming translation template includes {date} placeholder for selected invoice subtitle
  // #SUGGEST_VERIFY: Switch languages and confirm due date text renders correctly
  const selectedInvoiceDueTemplate = t('payments.selectedInvoiceDue') || 'Due {date}';
  const additionalNotesLabel = t('payments.additionalNotes') || 'Additional notes';
  const notesPlaceholder = t('payments.notesPlaceholder') || 'Add context for this payment';
  const processingPaymentLabel = t('payments.processingPayment') || 'Processing payment...';

  const handlePaymentComplete = async (reference: string) => {
    if (!selectedInvoice || !selectedPaymentMethod) {
      showToast(t('payments.missingInfo') || 'Missing payment information', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const paymentData = {
        tenantId: user?.id,
        leaseId: selectedInvoice.leaseId || selectedInvoice.id,
        invoiceId: selectedInvoice.id,
        invoiceNumber: selectedInvoice.invoiceNumber,
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
      const methodLabel = PAYMENT_METHODS.find(method => method.id === selectedPaymentMethod)?.label ?? 'Unknown';
      notificationService.sendPaymentConfirmation(selectedInvoice.amount, methodLabel);

      showToast(t('payments.submitSuccess') || 'Payment submitted successfully!', 'success');
      setShowCheckout(false);
      setPaymentMode(false);
      setSelectedInvoice(null);
      setSelectedPaymentMethod(null);
      setPaymentNotes('');
      setGeneratedReference('');
      refetchInvoices();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : (t('payments.unknownError') || 'Unknown error');
      // #COMPLETION_DRIVE: Assuming translation template includes {message} placeholder for submit error toast
      // #SUGGEST_VERIFY: Force payment failure and verify error message renders in selected language
      const submitErrorTemplate = t('payments.submitError') || 'Failed to submit payment: {message}';
      showToast(submitErrorTemplate.replace('{message}', errorMessage), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitPayment = () => {
    if (!selectedInvoice || !selectedPaymentMethod) {
      showToast(t('payments.selectMethodError') || 'Please select a payment method', 'error');
      return;
    }

    setShowCheckout(true);
  };

  if (invoicesLoading) {
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
          <div className="page-title">{t('payments.title')}</div>
          <div className="page-subtitle">{t('payments.subtitle')}</div>
        </div>

        <div className="dashboard-grid">
          <StatCard value={formatCurrency(stats.totalDue)} label={t('payments.totalDue')} />
          <StatCard value={stats.overdue} label={t('payments.overdueInvoices') || 'Overdue Invoices'} />
          <StatCard value={stats.nextDue ? formatDate(stats.nextDue.dueDate) : notAvailableLabel} label={t('payments.nextDueDate') || 'Next Due Date'} />
        </div>

        {stats.overdue > 0 && (
          <div className="alert-banner">
            <div className="alert-banner-icon">
              <Icon name="alert" alt={t('payments.alertAlt') || 'Overdue invoices'} size={40} />
            </div>
            <div className="alert-banner-content">
              <div className="alert-title">{overdueBannerTitleTemplate.replace('{count}', stats.overdue.toString()).replace('{label}', overdueLabel)}</div>
              <div className="alert-text">{overdueBannerText}</div>
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
            {invoicesTabLabel}
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
            {historyTabLabel}
          </button>
        </div>

        {activeTab === 'invoices' && !paymentMode && (
          <div>
            {invoiceList.length === 0 ? (
              <div className="section-card empty-state-card">
                <Icon name="invoice" alt={invoicesTabLabel} size={48} />
                <div className="empty-state-title">{emptyInvoicesTitle}</div>
                <div className="empty-state-text">{emptyInvoicesDescription}</div>
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
                      } catch (error) {
                        console.error('Download failed:', error);
                        showToast(t('payments.downloadError') || 'Failed to download invoice', 'error');
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
                  {backToInvoicesLabel}
                </button>
              </div>
              <div className="card-divider">
                <div className="section-title">{selectedInvoiceTitle}</div>
                <div className="section-subtitle">{selectedInvoiceDueTemplate.replace('{date}', formatDate(selectedInvoice.dueDate))}</div>
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
                <label className="form-label" htmlFor="payment-notes">{additionalNotesLabel}</label>
                <textarea
                  id="payment-notes"
                  className="form-textarea"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder={notesPlaceholder}
                />
              </div>

              <div className="card-actions">
                <button
                  type="button"
                  className="btn btn-primary full-width-button"
                  onClick={handleSubmitPayment}
                  disabled={!selectedPaymentMethod || submitting}
                >
                  {submitting
                    ? processingPaymentLabel
                    // #COMPLETION_DRIVE: Assuming translation template includes {amount} placeholder for payment button
                    // #SUGGEST_VERIFY: Trigger payment modal and confirm amount displays correctly across languages
                    : (t('payments.payAmount') || `Pay {amount}`).replace('{amount}', formatCurrency(selectedInvoice.amount))}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            {paidInvoices.length === 0 ? (
              <div className="section-card empty-state-card">
                <Icon name="payment" alt={historyTabLabel} size={48} />
                <div className="empty-state-title">{emptyHistoryTitle}</div>
                <div className="empty-state-text">{emptyHistoryDescription}</div>
              </div>
            ) : (
              <div className="support-grid">
                {paidInvoices.map(invoice => (
                  <InvoiceViewer
                    key={invoice.id}
                    invoice={invoice}
                    onDownload={async (id, format) => {
                      try {
                        await invoicesApi.download(id, format);
                      } catch (error) {
                        console.error('Download failed:', error);
                        showToast(t('payments.downloadError') || 'Failed to download invoice', 'error');
                      }
                    }}
                    onPay={() => {}}
                  />
                ))}
              </div>
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
