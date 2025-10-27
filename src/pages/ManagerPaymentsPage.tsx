import { useState, useEffect, useRef } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import InvoiceViewer from '../components/InvoiceViewer.tsx';
import Icon from '../components/Icon.tsx';
import { invoicesApi, useApi, formatCurrency, formatDate } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
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

function ManagerPaymentsPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();
  const wsManagerRef = useRef<WebSocketManager | null>(null);

  const navItems = [
    { path: '/manager', label: t('nav.dashboard'), icon: 'performanceAnalytics' },
    { path: '/manager/properties', label: t('nav.properties'), icon: 'properties' },
    { path: '/manager/leases', label: t('nav.leases'), icon: 'lease' },
    { path: '/manager/payments', label: t('nav.payments'), icon: 'payment', active: true }
  ];

  const { data: invoices, loading: invoicesLoading, refetch: refetchInvoices } = useApi(
    () => invoicesApi.getAll({ managerId: user?.id }),
    [user?.id]
  );

  const refetchInvoicesRef = useRef(refetchInvoices);
  useEffect(() => {
    refetchInvoicesRef.current = refetchInvoices;
  }, [refetchInvoices]);

  // #COMPLETION_DRIVE: WebSocket listener to auto-refetch invoices on payment received
  // #SUGGEST_VERIFY: Verify all managers receive real-time updates when tenant pays (synced with tenant and history pages)
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
    if (!invoices) return { totalDue: 0, overdue: 0, paid: 0 };

    const today = new Date();
    const invoiceList = Array.isArray(invoices) ? (invoices as Invoice[]) : [];

    const totalDue = invoiceList
      .filter(inv => inv.status !== 'paid')
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);

    const overdue = invoiceList.filter(inv => {
      if (inv.status === 'paid') return false;
      const dueDate = new Date(inv.dueDate);
      return dueDate < today;
    }).length;

    const paid = invoiceList.filter(inv => inv.status === 'paid').length;

    return { totalDue, overdue, paid };
  };

  const stats = getStats();
  const invoiceList = Array.isArray(invoices) ? (invoices as Invoice[]) : [];

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="page-title">Payments</div>
              <div className="page-subtitle">Manage tenant payments and invoices</div>
            </div>
            <button
              type="button"
              onClick={() => refetchInvoices()}
              disabled={invoicesLoading}
              className="btn btn-secondary"
              style={{ fontSize: '13px', padding: '8px 12px' }}
              title="Refresh payment data"
            >
              {invoicesLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="dashboard-grid">
          <StatCard value={formatCurrency(stats.totalDue)} label="Total Due" />
          <StatCard value={stats.overdue} label="Overdue Invoices" />
          <StatCard value={stats.paid} label="Paid Invoices" />
        </div>

        {stats.overdue > 0 && (
          <div className="alert-banner">
            <div className="alert-banner-icon">
              <Icon name="alert" alt="Overdue invoices" size={40} />
            </div>
            <div className="alert-banner-content">
              <div className="alert-title">{`You have ${stats.overdue} overdue ${stats.overdue === 1 ? 'invoice' : 'invoices'}`}</div>
              <div className="alert-text">Please send reminders to tenants to avoid late payments.</div>
            </div>
          </div>
        )}

        {invoiceList.length === 0 ? (
          <div className="section-card empty-state-card">
            <Icon name="invoice" alt="Invoices" size={48} />
            <div className="empty-state-title">No invoices</div>
            <div className="empty-state-text">No invoices to display</div>
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
                    showToast('Failed to download invoice', 'error');
                  }
                }}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default ManagerPaymentsPage;
