import { useState, useEffect, useRef } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ManagerInvoiceViewer from '../components/ManagerInvoiceViewer.tsx';
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
  const [searchTenant, setSearchTenant] = useState('');
  const [searchProperty, setSearchProperty] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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
  const allInvoices = Array.isArray(invoices) ? (invoices as Invoice[]) : [];

  const filteredInvoices = allInvoices.filter(inv => {
    const tenantMatch = !searchTenant || (inv.tenant?.fullName || '').toLowerCase().includes(searchTenant.toLowerCase());
    const propertyMatch = !searchProperty || (inv.property?.name || '').toLowerCase().includes(searchProperty.toLowerCase());
    const minPriceMatch = !minPrice || inv.amount >= parseFloat(minPrice);
    const maxPriceMatch = !maxPrice || inv.amount <= parseFloat(maxPrice);
    return tenantMatch && propertyMatch && minPriceMatch && maxPriceMatch;
  });

  const hasActiveFilters = searchTenant || searchProperty || minPrice || maxPrice;

  const clearFilters = () => {
    setSearchTenant('');
    setSearchProperty('');
    setMinPrice('');
    setMaxPrice('');
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
          <div className="page-title">Payments</div>
          <div className="page-subtitle">Manage tenant payments and invoices</div>
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

        <div className="section-card" style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary"
              style={{ fontSize: '13px', padding: '8px 12px' }}
            >
              {showFilters ? '▼ Filters' : '▶ Filters'} {hasActiveFilters && `(${searchTenant || searchProperty || minPrice || maxPrice ? '1' : '0'})`}
            </button>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '6px 10px', color: 'var(--error-color)' }}
              >
                Clear filters
              </button>
            )}
          </div>

          {showFilters && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              padding: '12px 0',
              borderTop: '1px solid var(--border-primary)',
              paddingTop: '12px'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Tenant Name
                </label>
                <input
                  type="text"
                  value={searchTenant}
                  onChange={(e) => setSearchTenant(e.target.value)}
                  placeholder="Search tenant..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Property Name
                </label>
                <input
                  type="text"
                  value={searchProperty}
                  onChange={(e) => setSearchProperty(e.target.value)}
                  placeholder="Search property..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Min Price
                </label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min amount..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Max Price
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max amount..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border-primary)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {filteredInvoices.length === 0 ? (
          <div className="section-card empty-state-card">
            <Icon name="invoice" alt="Invoices" size={48} />
            <div className="empty-state-title">
              {allInvoices.length === 0 ? 'No invoices' : 'No matching invoices'}
            </div>
            <div className="empty-state-text">
              {allInvoices.length === 0 ? 'No invoices to display' : 'Try adjusting your filters'}
            </div>
          </div>
        ) : (
          <div className="support-grid">
            {filteredInvoices.map(invoice => (
              <ManagerInvoiceViewer
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
