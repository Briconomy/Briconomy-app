import { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import AIButton from '../components/AIButton.tsx';
import OfflineIndicator from '../components/OfflineIndicator.tsx';
import NotificationWidget from '../components/NotificationWidget.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { paymentsApi, dashboardApi, leasesApi, maintenanceApi, notificationsApi, formatCurrency, formatDate, useApi } from '../services/api.ts';

function TenantDashboard() {
  const { t } = useLanguage();
  const [user, setUser] = useState<{ id?: string; name?: string; email?: string } | null>(null);
  const [_error, _setError] = useState<Error | null>(null);
  const [notifications, setNotifications] = useState<{ id: string; read: boolean }[]>([]);
  
  const navItems = [
    { path: '/tenant', label: t('nav.home'), active: true },
    { path: '/tenant/payments', label: t('nav.payments') },
    { path: '/tenant/requests', label: t('nav.requests') },
    { path: '/tenant/profile', label: t('nav.profile') }
  ];

  const { data: payments, loading: paymentsLoading, error: paymentsError, refetch: _refetchPayments } = useApi(
    () => paymentsApi.getAll(user?.id ? { tenantId: user.id } : {}),
    [user?.id]
  );

  const { data: lease, loading: leaseLoading, error: leaseError } = useApi(
    () => leasesApi.getAll(user?.id ? { tenantId: user.id } : {}),
    [user?.id]
  );

  const { data: requests, loading: requestsLoading, error: requestsError } = useApi(
    () => maintenanceApi.getAll(user?.id ? { tenantId: user.id } : {}),
    [user?.id]
  );

  const { data: _stats, loading: statsLoading, error: statsError } = useApi(
    () => dashboardApi.getStats(),
    []
  );

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

  const loadUserData = () => {
    try {
      const userRaw = localStorage.getItem('briconomy_user');
      const userData = userRaw ? JSON.parse(userRaw) : null;
      setUser(userData);
    } catch (err: unknown) {
      console.error('Error loading user data:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      if (user?.id) {
        const notificationsData = await notificationsApi.getAll(user.id || '68bde3529b1d854514fa336a');
        setNotifications(notificationsData.filter((n: { read: boolean }) => !n.read).slice(0, 5));
      }
    } catch (err: unknown) {
      console.error('Error loading notifications:', err);
    }
  };

  const getMockData = () => {
    return {
      payments: [],
      lease: [],
      requests: [],
      notifications: []
    };
  };

  type PaymentLite = { status?: string; dueDate?: string | Date; amount?: number };
  const getUpcomingPayment = () => {
    const list: PaymentLite[] = Array.isArray(payments) ? (payments as PaymentLite[]) : [];
    if (list.length === 0) return null;
    return (
      list
        .filter((p) => p.status === 'pending')
        .sort((a, b) => new Date(a.dueDate || '').getTime() - new Date(b.dueDate || '').getTime())[0] || null
    );
  };

  const getDaysUntilDue = (dueDate: string | Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const useMockData = paymentsError || leaseError || requestsError || statsError;
  const mockData = getMockData();
  
  const _paymentsData = payments || (useMockData ? mockData.payments : []);
  const leaseData = Array.isArray(lease) ? lease : [];
  const requestsData = Array.isArray(requests) ? requests : [];
  const notificationsData = (() => {
    if (notifications.length > 0) return notifications;
    return useMockData ? mockData.notifications : [];
  })();

  const isLoading = paymentsLoading || leaseLoading || requestsLoading || statsLoading;
  const hasError = paymentsError || leaseError || requestsError || statsError;
  const upcomingPayment = hasError ? null : getUpcomingPayment();
  const currentLease = hasError ? null : leaseData?.[0];
  const pendingRequests = hasError ? [] : requestsData?.filter((r: { status: string }) => r.status === 'pending') || [];
  const unreadNotifications = hasError ? 0 : notificationsData.length;

if (isLoading) {
    return (
      <div className="app-container mobile-only">
  <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t('tenant.loading_dashboard')}...</p>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="page-title">{t('dashboard.welcome_back')}</div>
            
          </div>
          <div className="page-subtitle">
            {currentLease?.unitId?.unitNumber || t('tenant.unit')} - {currentLease?.propertyId?.name || t('tenant.property')}
          </div>
          {hasError && (
            <div className="offline-indicator">
              <span>{t('tenant.offline_message')}</span>
            </div>
          )}
        </div>
        
        <div className="dashboard-grid">
          <StatCard 
            value={upcomingPayment ? formatCurrency(upcomingPayment.amount || 0) : 'R0'} 
            label={t('dashboard.rent_due')} 
          />
          <StatCard 
            value={upcomingPayment ? `${getDaysUntilDue(upcomingPayment.dueDate || new Date())} days` : 'N/A'} 
            label={t('dashboard.due_date')} 
          />
          <StatCard 
            value={pendingRequests.length.toString()} 
            label={t('dashboard.requests')} 
          />
          <StatCard 
            value={unreadNotifications.toString()} 
            label={t('dashboard.notifications')} 
          />
        </div>

        {currentLease && (
          <div className="lease-info-card">
            <h3>{t('tenant.lease_information')}</h3>
            <div className="lease-details">
              <div className="lease-row">
                <span>{t('tenant.monthly_rent')}: </span>
                <span className="lease-value">{formatCurrency(currentLease?.monthlyRent || 0)}</span>
              </div>
              <div className="lease-row">
                <span>{t('tenant.lease_period')}: </span>
                <span className="lease-value">
                  {formatDate(currentLease?.startDate || '')} - {formatDate(currentLease?.endDate || '')}
                </span>
              </div>
              <div className="lease-row">
                <span>{t('tenant.security_deposit')}: </span>
                <span className="lease-value">{formatCurrency(currentLease?.deposit || 0)}</span>
              </div>
              <div className="lease-row">
                <span>{t('common.status')}: </span>
                <span className={`lease-status ${currentLease?.status === 'active' ? 'status-active' : ''}`}>
                  {(currentLease?.status || 'unknown').charAt(0).toUpperCase() + (currentLease?.status || 'unknown').slice(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="quick-actions" style={{ marginTop: '8px' }}>
          <ActionCard
            onClick={() => globalThis.location.href = '/tenant/payments'}
            icon="P"
            title={t('dashboard.pay_rent')}
            description={t('dashboard.make_payment')}
          />
          <ActionCard
            onClick={() => globalThis.location.href = '/tenant/requests'}
            icon="M"
            title={t('dashboard.maintenance')}
            description={t('dashboard.report_issue')}
          />
          <ActionCard
            onClick={() => globalThis.location.href = '/tenant/messages'}
            icon="C"
            title={t('dashboard.contact')}
            description={t('dashboard.message_management')}
          />
          <ActionCard
            onClick={() => globalThis.location.href = '/tenant/profile'}
            icon="U"
            title={t('dashboard.profile')}
            description={t('dashboard.update_info')}
          />
        </div>
        <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center' }}>
        <AIButton 
              userId={user?.id || 'fallback-user'} 
              language={localStorage.getItem('language') as 'en' | 'zu' || 'en'}
            />
        </div>
        
        <NotificationWidget />
      </div>
      
      <BottomNav items={navItems} responsive={false} />
      
      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default TenantDashboard;