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

  const getUserStatsData = () => {
    if (statsLoading || !userStats) {
      return {
        totalUsers: '0',
        activeUsers: '0',
        totalRoles: '0',
        pendingUsers: '0',
        roleDistribution: {
          admins: 0,
          managers: 0,
          tenants: 0,
          caretakers: 0
        }
      };
    }
    
    const stats = userStats[0];
    return {
      totalUsers: stats?.totalUsers?.toString() || '0',
      activeUsers: stats?.activeUsers?.toString() || '0',
      totalRoles: stats?.totalRoles?.toString() || '0',
      pendingUsers: stats?.pendingUsers?.toString() || '0'
    };
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
          <div className="table-header" style={{ flexDirection: 'column', gap: '16px', alignItems: 'flex-start' }}>
            <div className="table-title">{t('admin.user_list')}</div>
            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
              <button
                type="button"
                onClick={() => navigate('/admin/pending-users')}
                className="btn btn-secondary user-pending-btn"
                style={{
                  background: '#f39c12',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '15px'
                }}
              >
                {t('admin.pending')} ({stats.pendingUsers})
              </button>
              <a href="/admin/add-user" className="btn btn-primary adduser-btn">
                {t('common.add_user')}
                <span style={{
                  padding: '10px 1px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '6px',
                }}>
                </span>
              </a>
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

        <ChartCard title={t('admin.user_logins')}>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#2c3e50' }}>
                {t('admin.login_activity_last_7_days')}
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '220px', gap: '4px', padding: '10px', background: '#f8f9fa', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '80%', height: '90px', background: 'linear-gradient(180deg, #5dade2 0%, #3498db 100%)', borderRadius: '4px 4px 0 0', marginBottom: '8px' }}></div>
                  <div style={{ fontSize: '11px', color: '#6c757d', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{t('time.mon')}</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#2c3e50' }}>24</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '80%', height: '124px', background: 'linear-gradient(180deg, #5dade2 0%, #3498db 100%)', borderRadius: '4px 4px 0 0', marginBottom: '8px' }}></div>
                  <div style={{ fontSize: '11px', color: '#6c757d', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{t('time.tue')}</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#2c3e50' }}>31</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '80%', height: '112px', background: 'linear-gradient(180deg, #5dade2 0%, #3498db 100%)', borderRadius: '4px 4px 0 0', marginBottom: '8px' }}></div>
                  <div style={{ fontSize: '11px', color: '#6c757d', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{t('time.wed')}</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#2c3e50' }}>28</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '80%', height: '140px', background: 'linear-gradient(180deg, #5dade2 0%, #3498db 100%)', borderRadius: '4px 4px 0 0', marginBottom: '8px', boxShadow: '0 2px 4px rgba(52, 152, 219, 0.3)' }}></div>
                  <div style={{ fontSize: '11px', color: '#6c757d', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{t('time.thu')}</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#2c3e50' }}>38</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '80%', height: '150px', background: 'linear-gradient(180deg, #5dade2 0%, #3498db 100%)', borderRadius: '4px 4px 0 0', marginBottom: '8px', boxShadow: '0 2px 4px rgba(52, 152, 219, 0.3)' }}></div>
                  <div style={{ fontSize: '11px', color: '#6c757d', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{t('time.fri')}</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#2c3e50' }}>42</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '80%', height: '70px', background: 'linear-gradient(180deg, #bdc3c7 0%, #95a5a6 100%)', borderRadius: '4px 4px 0 0', marginBottom: '8px' }}></div>
                  <div style={{ fontSize: '11px', color: '#6c757d', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{t('time.sat')}</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#2c3e50' }}>18</div>
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ width: '80%', height: '56px', background: 'linear-gradient(180deg, #bdc3c7 0%, #95a5a6 100%)', borderRadius: '4px 4px 0 0', marginBottom: '8px' }}></div>
                  <div style={{ fontSize: '11px', color: '#6c757d', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{t('time.sun')}</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#2c3e50' }}>14</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>{t('admin.total_logins')}</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#3498db' }}>195</div>
                <div style={{ fontSize: '11px', color: '#27ae60' }}>{t('admin.percentage_vs_last_week')}</div>
              </div>
              <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
                <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>{t('admin.peak_day')}</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#f39c12' }}>Friday</div>
                <div style={{ fontSize: '11px', color: '#6c757d' }}>42 {t('admin.logins')}</div>
              </div>
            </div>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e9ecef' }}>
              <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px' }}>{t('admin.recent_user_activity')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '10px', background: '#fff', border: '1px solid #e9ecef', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#2c3e50' }}>Sarah Johnson (Admin)</div>
                    <div style={{ fontSize: '11px', color: '#6c757d' }}>Logged in from Chrome • 10.0.0.145</div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#6c757d', whiteSpace: 'nowrap' }}>2 min ago</div>
                </div>
                <div style={{ padding: '10px', background: '#fff', border: '1px solid #e9ecef', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#2c3e50' }}>Michael Chen (Manager)</div>
                    <div style={{ fontSize: '11px', color: '#6c757d' }}>Logged in from Safari • 10.0.0.198</div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#6c757d', whiteSpace: 'nowrap' }}>15 min ago</div>
                </div>
                <div style={{ padding: '10px', background: '#fff', border: '1px solid #e9ecef', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#2c3e50' }}>Emma Thompson (Tenant)</div>
                    <div style={{ fontSize: '11px', color: '#6c757d' }}>Logged in from Mobile • 10.0.0.224</div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#6c757d', whiteSpace: 'nowrap' }}>1 hour ago</div>
                </div>
                <div style={{ padding: '10px', background: '#fff', border: '1px solid #e9ecef', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#2c3e50' }}>James Wilson (Caretaker)</div>
                    <div style={{ fontSize: '11px', color: '#6c757d' }}>Logged in from Firefox • 10.0.0.167</div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#6c757d', whiteSpace: 'nowrap' }}>2 hours ago</div>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default AdminUsersPage;
