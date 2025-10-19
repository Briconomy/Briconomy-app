import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import AccessLogs from '../components/AccessLogs.tsx';

function AccessLogsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const supportedRoles = new Set(['admin', 'manager', 'caretaker', 'tenant']);
  const resolvedRole = supportedRoles.has(user?.userType ?? '') ? (user?.userType as 'admin' | 'manager' | 'caretaker' | 'tenant') : 'tenant';

  const navItemsByRole: Record<'admin' | 'manager' | 'caretaker' | 'tenant', { path: string; label: string; icon: string }[]> = {
    admin: [
      { path: '/admin', label: t('nav.dashboard'), icon: 'performanceAnalytics' },
      { path: '/admin/users', label: t('nav.users'), icon: 'users' },
      { path: '/admin/security', label: t('nav.security'), icon: 'security' },
      { path: '/admin/reports', label: t('nav.reports'), icon: 'report' }
    ],
    manager: [
      { path: '/manager', label: t('nav.dashboard'), icon: 'performanceAnalytics' },
      { path: '/manager/properties', label: t('nav.properties'), icon: 'properties' },
      { path: '/manager/leases', label: t('nav.leases'), icon: 'lease' },
      { path: '/manager/payments', label: t('nav.payments'), icon: 'payment' }
    ],
    caretaker: [
      { path: '/caretaker', label: t('nav.tasks'), icon: 'tasks' },
      { path: '/caretaker/schedule', label: t('nav.schedule'), icon: 'schedule' },
      { path: '/caretaker/history', label: t('nav.history'), icon: 'history' },
      { path: '/caretaker/profile', label: t('nav.profile'), icon: 'profile' }
    ],
    tenant: [
      { path: '/tenant', label: t('nav.home'), icon: 'properties' },
      { path: '/tenant/payments', label: t('nav.payments'), icon: 'payment' },
      { path: '/tenant/requests', label: t('nav.requests'), icon: 'maintenance' },
      { path: '/tenant/profile', label: t('nav.profile'), icon: 'profile' }
    ]
  };

  const getNavItems = () => navItemsByRole[resolvedRole];

  const getBackLink = () => {
    switch (resolvedRole) {
      case 'admin':
        return '/admin/security';
      case 'manager':
        return '/manager';
      case 'caretaker':
        return '/caretaker/profile';
      default:
        return '/tenant/profile';
    }
  };

  const getPageTitle = () => {
    return t('security.access_logs') || 'Access Logs';
  };

  const getPageSubtitle = () => {
    switch (resolvedRole) {
      case 'admin':
        return 'System-wide access logs and audit trail';
      case 'manager':
        return 'Property management access logs';
      case 'caretaker':
        return 'Caretaker activity logs';
      default:
        return 'Your account activity history';
    }
  };

  // For non-admin users, filter logs to their user ID only
  const getUserFilter = () => {
    if (resolvedRole === 'admin') {
      return undefined; // Show all logs for admin
    }
    return user?.id; // Filter to current user only
  };

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton backLink={getBackLink()} />
      
      <div className="main-content" style={{ padding: '20px' }}>
        <div className="page-header" style={{ marginBottom: '24px' }}>
          <div className="page-title" style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '8px'
          }}>
            {getPageTitle()}
          </div>
          <div className="page-subtitle" style={{
            fontSize: '16px',
            color: '#6c757d',
            marginBottom: '16px'
          }}>
            {getPageSubtitle()}
          </div>
        </div>
        
        <div className="access-logs-container" style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
          overflow: 'hidden'
        }}>
          <AccessLogs 
            userId={getUserFilter()}
            maxItems={100}
            showFilters={user?.userType === 'admin'}
          />
        </div>
      </div>
      
      <BottomNav items={getNavItems()} responsive={false} />
    </div>
  );
}

export default AccessLogsPage;