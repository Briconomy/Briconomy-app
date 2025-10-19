import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { adminApi, useApi } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useNavigate } from 'react-router-dom';

function AdminUsersPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const navItems = [
    { path: '/admin', label: t('nav.dashboard'), icon: 'performanceAnalytics' },
    { path: '/admin/users', label: t('nav.users'), icon: 'users', active: true },
    { path: '/admin/security', label: t('nav.security'), icon: 'security' },
    { path: '/admin/reports', label: t('nav.reports'), icon: 'report' }
  ];

  const { data: userStats, loading: statsLoading } = useApi(() => adminApi.getUserStats());
  const { data: userActivities, loading: activitiesLoading } = useApi(() => adminApi.getUserActivities());

  const getUserStatsData = () => {
    if (statsLoading || !userStats) {
      return {
        totalUsers: '10',
        activeUsers: '8',
        totalRoles: '5',
        pendingUsers: '2'
      };
    }
    
    const stats = userStats[0];
    return {
      totalUsers: stats?.totalUsers?.toString() || '10',
      activeUsers: stats?.activeUsers?.toString() || '8',
      totalRoles: stats?.totalRoles?.toString() || '5',
      pendingUsers: stats?.pendingUsers?.toString() || '2'
    };
  };

  const formatActivityTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return activityTime.toLocaleDateString();
    }
  };

  const stats = getUserStatsData();

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton showLogout />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">{t('common.user_management')}</div>
          <div className="page-subtitle">{t('admin.manage_users_desc')}</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={stats.totalUsers} label={t('dashboard.total_users')} />
          <StatCard value={stats.activeUsers} label={t('status.active')} />
          <StatCard value={stats.totalRoles} label={t('admin.roles')} />
          <StatCard value={stats.pendingUsers} label={t('status.pending')} />
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">{t('admin.user_list')}</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button"
                onClick={() => navigate('/admin/pending-users')}
                className="btn btn-secondary"
                style={{
                  background: '#f39c12',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px'
                }}
              >
                Pending ({stats.pendingUsers})
              </button>
              <a href="/admin/add-user" className="btn btn-primary">{t('common.add_user')}</a>
            </div>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>Sarah Johnson</h4>
              <p>admin@briconomy.com</p>
            </div>
            <span className="status-badge status-admin">{t('admin.admin')}</span>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>Michael Chen</h4>
              <p>manager1@briconomy.com</p>
            </div>
            <span className="status-badge status-manager">{t('admin.manager')}</span>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>Emma Thompson</h4>
              <p>tenant1@briconomy.com</p>
            </div>
            <span className="status-badge status-tenant">{t('admin.tenant')}</span>
          </div>
        </div>

        <ChartCard title={t('admin.role_distribution')}>
          <div className="chart-placeholder">
            Chart.js {t('admin.role_distribution')} Chart
          </div>
        </ChartCard>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">{t('admin.recent_activity')}</div>
          </div>
          {activitiesLoading ? (
            <div className="list-item">
              <div className="item-info">
                <h4>{t('common.loading')}...</h4>
              </div>
            </div>
          ) : (
            userActivities?.map((activity: any, index: number) => (
              <div key={index} className="list-item">
                <div className="item-info">
                  <h4>{activity.action}</h4>
                  <p>{formatActivityTime(activity.timestamp)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default AdminUsersPage;
