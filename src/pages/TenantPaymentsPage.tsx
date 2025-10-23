import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import DataTable from '../components/DataTable.tsx';
import InvoiceViewer from '../components/InvoiceViewer.tsx';
import PaymentMethodSelector, { PaymentMethod } from '../components/PaymentMethodSelector.tsx';
import PaymentProofUploader from '../components/PaymentProofUploader.tsx';
import FakeCheckout from '../components/FakeCheckout.tsx';
import { invoicesApi, paymentsApi, documentsApi, useApi, formatCurrency, formatDate } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

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
  const [paymentReference, setPaymentReference] = useState('');
  const [proofFile, setProofFile] = useState<{ name: string; data: string; mimeType: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [generatedReference, setGeneratedReference] = useState('');

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
    const pending = invoices.filter(inv => inv.status !== 'paid') as any[];

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

  const handlePaymentComplete = async (reference: string) => {
    if (!selectedInvoice || !selectedPaymentMethod) {
      alert('Missing payment information');
      return;
    }

    setSubmitting(true);
    try {
      // Create payment record
      const paymentData = {
        tenantId: user?.id,
        leaseId: selectedInvoice.id,
        invoiceId: selectedInvoice.id,
        amount: selectedInvoice.amount,
        dueDate: selectedInvoice.dueDate,
        method: selectedPaymentMethod,
        reference: selectedPaymentMethod === 'card' ? reference : (paymentReference || ''),
        status: proofFile ? 'pending_approval' : 'paid',
        notes: paymentNotes,
        paymentDate: new Date().toISOString()
      };

      const createdPayment = await paymentsApi.create(paymentData);

      // Upload proof if provided
      if (proofFile) {
        await documentsApi.uploadPaymentProof(
          createdPayment.id,
          proofFile.name,
          proofFile.data,
          proofFile.mimeType,
          user?.id || '',
          selectedInvoice.id
        );
      }

      alert('Payment submitted successfully!');
      setShowCheckout(false);
      setPaymentMode(false);
      setSelectedInvoice(null);
      setSelectedPaymentMethod(null);
      setPaymentNotes('');
      setPaymentReference('');
      setProofFile(null);
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

    // For card payments, show fake checkout
    if (selectedPaymentMethod === 'card') {
      setShowCheckout(true);
      return;
    }

    // For manual methods, require proof
    if (!proofFile) {
      alert('Please upload proof of payment');
      return;
    }

    // Generate reference for manual payments
    const ref = `REF-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setGeneratedReference(ref);
    await handlePaymentComplete(ref);
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
          <div className="page-title">Payments</div>
          <div className="page-subtitle">View invoices and manage payments</div>
        </div>

        {/* Stats */}
        <div className="dashboard-grid">
          <StatCard value={formatCurrency(stats.totalDue)} label="Total Due" highlight={stats.totalDue > 0} />
          <StatCard value={stats.overdue} label="Overdue Invoices" highlight={stats.overdue > 0} />
          <StatCard
            value={stats.nextDue ? formatDate(stats.nextDue.dueDate) : 'N/A'}
            label="Next Due Date"
          />
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
            <strong>⚠️ You have {stats.overdue} overdue invoice(s)</strong>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>
              Please submit payment as soon as possible to avoid penalties.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          borderBottom: '1px solid var(--border-primary)',
          paddingBottom: '12px'
        }}>
          <button
            onClick={() => {
              setActiveTab('invoices');
              setPaymentMode(false);
            }}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: activeTab === 'invoices' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'invoices' ? 'white' : 'var(--text-secondary)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: activeTab === 'invoices' ? '600' : '500',
              fontSize: '14px'
            }}
          >
            📋 Invoices
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              padding: '8px 16px',
              border: 'none',
              background: activeTab === 'history' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'history' ? 'white' : 'var(--text-secondary)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: activeTab === 'history' ? '600' : '500',
              fontSize: '14px'
            }}
          >
            ✅ Payment History
          </button>
        </div>

        {/* Invoices Tab */}
        {activeTab === 'invoices' && !paymentMode && (
          <div>
            {!invoices || invoices.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                  No invoices
                </div>
                <div style={{ fontSize: '13px' }}>
                  You don't have any outstanding invoices
                </div>
              </div>
            ) : (
              <div>
                {(invoices as Invoice[]).map(invoice => (
                  <InvoiceViewer
                    key={invoice.id}
                    invoice={invoice}
                    onDownload={async (id, format) => {
                      try {
                        await invoicesApi.download(id, format);
                      } catch (error) {
                        alert('Failed to download invoice');
                      }
                    }}
                  />
                ))}
              </div>
            )}

            {/* Quick Action */}
            {(invoices as Invoice[] || []).some(inv => inv.status !== 'paid') && (
              <div style={{ marginTop: '24px' }}>
                <button
                  onClick={() => {
                    setSelectedInvoice((invoices as Invoice[]).find(inv => inv.status !== 'paid') || null);
                    setPaymentMode(true);
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px' }}
                >
                  💳 Pay Now
                </button>
              </div>
            )}
          </div>
        )}

        {/* Payment Mode */}
        {activeTab === 'invoices' && paymentMode && selectedInvoice && (
          <div>
            {/* Back Button */}
            <button
              onClick={() => {
                setPaymentMode(false);
                setSelectedInvoice(null);
                setSelectedPaymentMethod(null);
                setPaymentNotes('');
                setPaymentReference('');
                setProofFile(null);
              }}
              style={{
                marginBottom: '20px',
                padding: '8px 12px',
                background: 'none',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ← Back to Invoices
            </button>

            {/* Selected Invoice */}
            <div style={{
              background: 'var(--background)',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
                SELECTED INVOICE
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                background: 'var(--surface)',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {selectedInvoice.invoiceNumber}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>
                    Due: {formatDate(selectedInvoice.dueDate)}
                  </div>
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>
                  {formatCurrency(selectedInvoice.amount)}
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <PaymentMethodSelector
              selected={selectedPaymentMethod}
              onChange={setSelectedPaymentMethod}
            />

            {/* Payment Proof Upload (for manual methods) */}
            {selectedPaymentMethod && selectedPaymentMethod !== 'card' && (
              <PaymentProofUploader
                onFileSelected={(name, data, mimeType) => {
                  setProofFile({ name, data, mimeType });
                }}
              />
            )}

            {/* Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                Additional Notes (optional)
              </label>
              <textarea
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="e.g., 'Payment includes deposit refund'"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--border-primary)',
                  borderRadius: '8px',
                  fontFamily: 'inherit',
                  fontSize: '13px',
                  minHeight: '60px',
                  resize: 'none'
                }}
              />
            </div>

            {/* Manual Payment Reference */}
            {selectedPaymentMethod && selectedPaymentMethod !== 'card' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
                  Payment Reference (optional)
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="e.g., cheque number or bank reference"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    fontSize: '13px'
                  }}
                />
              </div>
            )}

            {/* Submit Button */}
            <div style={{ marginBottom: '20px' }}>
              <button
                onClick={handleSubmitPayment}
                disabled={!selectedPaymentMethod || (selectedPaymentMethod !== 'card' && !proofFile) || submitting}
                className="btn btn-primary"
                style={{ width: '100%', padding: '14px' }}
              >
                {submitting ? '⏳ Processing...' : `Pay ${formatCurrency(selectedInvoice.amount)}`}
              </button>
            </div>
          </div>
        )}

        {/* Payment History Tab */}
        {activeTab === 'history' && (
          <div>
            {!payments || payments.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                  No payment history
                </div>
                <div style={{ fontSize: '13px' }}>
                  Your payments will appear here
                </div>
              </div>
            ) : (
              <DataTable
                title="Payment History"
                data={payments as any[]}
                columns={paymentHistoryColumns}
                actions={null}
              />
            )}
          </div>
        )}
      </div>

      {/* Fake Checkout Modal */}
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
