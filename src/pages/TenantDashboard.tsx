import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import AIButton from '../components/AIButton.tsx';
import OfflineIndicator from '../components/OfflineIndicator.tsx';
import NotificationWidget from '../components/NotificationWidget.tsx';
import OnboardingTutorial from '../components/OnboardingTutorial.tsx';
import Icon from '../components/Icon.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { paymentsApi, dashboardApi, leasesApi, maintenanceApi, notificationsApi, formatCurrency, formatDate, useApi } from '../services/api.ts';

function TenantDashboard() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [_error, _setError] = useState<Error | null>(null);
  const [notifications, setNotifications] = useState<{ id: string; read: boolean }[]>([]);
  const tenantContext = user?.tenantContext || null;
  
  const navItems = [
    { path: '/tenant', label: t('nav.home'), icon: 'properties', active: true },
    { path: '/tenant/payments', label: t('nav.payments'), icon: 'payment' },
    { path: '/tenant/requests', label: t('nav.requests'), icon: 'maintenance' },
    { path: '/tenant/profile', label: t('nav.profile'), icon: 'profile' }
  ];

  // Only make API calls after user is loaded
  const { data: payments, loading: paymentsLoading, error: paymentsError, refetch: refetchPayments } = useApi(
    () => user?.id ? paymentsApi.getAll({ tenantId: user.id }) : Promise.resolve([]),
    [user?.id]
  );

  const { data: lease, loading: leaseLoading, error: leaseError, refetch: refetchLease } = useApi(
    () => user?.id ? leasesApi.getAll({ tenantId: user.id }) : Promise.resolve([]),
    [user?.id]
  );

  const { data: requests, loading: requestsLoading, error: requestsError } = useApi(
    () => user?.id ? maintenanceApi.getAll({ tenantId: user.id }) : Promise.resolve([]),
    [user?.id]
  );

  const { data: _stats, loading: statsLoading, error: statsError } = useApi(
    () => user?.id ? dashboardApi.getStats() : Promise.resolve(null),
    [user?.id]
  );

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

  useEffect(() => {
    refetchPayments();
    refetchLease();
  }, []);

  const loadNotifications = async () => {
    try {
      if (!user?.id) {
        console.warn('No user ID available for notifications');
        return;
      }
      const notificationsData = await notificationsApi.getAll(user.id);
      setNotifications(notificationsData.filter((n: { read: boolean }) => !n.read).slice(0, 5));
    } catch (err: unknown) {
      console.error('Error loading notifications:', err);
    }
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

  // Use real data from API calls
  const _paymentsData = Array.isArray(payments) ? payments : [];
  const leaseData = Array.isArray(lease) ? lease : [];
  const requestsData = Array.isArray(requests) ? requests : [];
  const notificationsData = notifications || [];

  const isLoading = authLoading || paymentsLoading || leaseLoading || requestsLoading || statsLoading;
  const hasError = paymentsError || leaseError || requestsError || statsError;
  
  // Calculate real dashboard metrics
  const upcomingPayment = getUpcomingPayment();
  const currentLease = leaseData?.[0] || null;
  const notProvidedLabel = t('profile.notProvided') || 'Not provided';
  const parseDateValue = (value: unknown): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (typeof value === 'string' && value.length > 0) {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    return null;
  };
  const unitDisplay = currentLease?.unit?.unitNumber || tenantContext?.unit?.unitNumber || notProvidedLabel;
  const propertyDisplay = currentLease?.property?.name || tenantContext?.property?.name || notProvidedLabel;
  const leaseSummary = currentLease
    ? {
        monthlyRent: currentLease?.monthlyRent,
        deposit: currentLease?.deposit,
        startDate: currentLease?.startDate,
        endDate: currentLease?.endDate,
        status: currentLease?.status
      }
    : tenantContext?.lease
      ? {
          monthlyRent: tenantContext.lease?.monthlyRent,
          deposit: tenantContext.lease?.deposit,
          startDate: tenantContext.lease?.startDate,
          endDate: tenantContext.lease?.endDate,
          status: tenantContext.lease?.status
        }
      : null;
  const leaseStartDate = leaseSummary?.startDate ? parseDateValue(leaseSummary.startDate) : null;
  const leaseEndDate = leaseSummary?.endDate ? parseDateValue(leaseSummary.endDate) : null;
  const leaseStatusBase = typeof leaseSummary?.status === 'string' ? leaseSummary.status.toLowerCase() : 'active';
  const statusTranslations: Record<string, string> = {
    active: t('status.active'),
    pending: t('requests.status_pending_badge') || 'Pending',
    approved: t('status.active'),
    draft: t('requests.status_pending_badge') || 'Pending'
  };
  const statusDisplay = statusTranslations[leaseStatusBase] || (typeof leaseSummary?.status === 'string' ? leaseSummary.status : t('status.active'));
  const leasePeriodDisplay = leaseSummary
    ? `${leaseStartDate ? formatDate(leaseStartDate.toISOString()) : t('profile.notProvided')} - ${leaseEndDate ? formatDate(leaseEndDate.toISOString()) : t('profile.notProvided')}`
    : t('profile.notProvided');
  const monthlyRentValue = Number(leaseSummary?.monthlyRent ?? 0);
  const depositValue = Number(leaseSummary?.deposit ?? 0);
  const normalizedMonthlyRent = Number.isFinite(monthlyRentValue) ? monthlyRentValue : 0;
  const normalizedDeposit = Number.isFinite(depositValue) ? depositValue : 0;
  const statusClass = leaseStatusBase === 'active' ? 'success' : 'warning';
  const pendingRequests = requestsData?.filter((r: { status: string }) => r.status === 'pending') || [];
  const unreadNotifications = notificationsData.filter((n: { read: boolean }) => !n.read).length;

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
          <div className="page-title-wrapper">
            <div className="page-title">{t('dashboard.welcome_back')}</div>
            
          </div>
          <div className="page-subtitle">
            {unitDisplay} - {propertyDisplay}
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

        {leaseSummary && (
          <div className="section-card lease-info-section">
            <div className="section-card-header">
              <div className="section-title">{t('tenant.lease_information')}</div>
            </div>
            <div className="lease-details-grid">
              <div className="lease-detail-item">
                <div className="lease-detail-label">{t('tenant.monthly_rent')}</div>
                <div className="lease-detail-value">{formatCurrency(normalizedMonthlyRent)}</div>
              </div>
              <div className="lease-detail-item">
                <div className="lease-detail-label">{t('tenant.security_deposit')}</div>
                <div className="lease-detail-value">{formatCurrency(normalizedDeposit)}</div>
              </div>
              <div className="lease-detail-item lease-detail-full">
                <div className="lease-detail-label">{t('tenant.lease_period')}</div>
                <div className="lease-detail-value">{leasePeriodDisplay}</div>
              </div>
              <div className="lease-detail-item">
                <div className="lease-detail-label">{t('common.status')}</div>
                <span className={`status-pill ${statusClass}`}>
                  {statusDisplay}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="quick-actions quick-actions-spaced">
          <ActionCard
            onClick={() => navigate('/tenant/payments')}
            icon={<Icon name="payment" alt="Pay Rent" size={48} />}
            title={t('dashboard.pay_rent')}
            description={t('dashboard.make_payment')}
          />
          <ActionCard
            onClick={() => navigate('/tenant/requests')}
            icon={<Icon name="maintenance" alt="Maintenance" size={48} />}
            title={t('dashboard.maintenance')}
            description={t('dashboard.report_issue')}
          />
          <ActionCard
            onClick={() => navigate('/tenant/messages')}
            icon={<Icon name="contact" alt="Contact" size={48} />}
            title="Contact Information"
            description="Emergency contacts & general help"
          />
          <ActionCard
            onClick={() => navigate('/tenant/profile')}
            icon={<Icon name="profile" alt="Profile" size={48} />}
            title={t('common.profile')}
            description={t('dashboard.update_info')}
          />
        </div>
        <div className="ai-button-container">
        <AIButton
              userId={user?.id || 'fallback-user'}
              language={localStorage.getItem('language') as 'en' | 'zu' || 'en'}
            />
        </div>

        <NotificationWidget />
      </div>

      <BottomNav items={navItems} responsive={false} />
      
      {/* Onboarding Tutorial */}
      <OnboardingTutorial />
      
      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default TenantDashboard;