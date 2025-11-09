import { useState } from 'react';
import { Link } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import AnnouncementSystem from '../components/AnnouncementSystem.tsx';
import AIButton from '../components/AIButton.tsx';
import OnboardingTutorial from '../components/OnboardingTutorial.tsx';
import LanguageSelector from '../components/LanguageSelector.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import Icon from '../components/Icon.tsx';
import { adminApi, useApi } from '../services/api.ts';

function AdminDashboard() {
  const { t } = useLanguage();
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  const navItems = [
    { path: '/admin', label: t('nav.dashboard'), icon: 'performanceAnalytics', active: true },
    { path: '/admin/users', label: t('nav.users'), icon: 'users' },
    { path: '/admin/security', label: t('nav.security'), icon: 'security' },
    { path: '/admin/reports', label: t('nav.reports'), icon: 'report' }
  ];

  const { data: systemStats, loading: statsLoading } = useApi(() => adminApi.getSystemStats());

  // Use real data from API - no hardcoded fallbacks
  const getStatsData = () => {
    if (statsLoading || !systemStats) {
      return {
        totalUsers: '0',
        totalProperties: '0',
        uptime: 'N/A',
        responseTime: 'N/A'
      };
    }
    
    type SystemStat = {
      category: string;
      totalUsers?: number;
      totalProperties?: number;
      uptime?: string;
      responseTime?: string;
    };
    const overviewStats = systemStats.find((stat: SystemStat) => stat.category === 'overview');
    return {
      totalUsers: overviewStats?.totalUsers?.toString() || '0',
      totalProperties: overviewStats?.totalProperties?.toString() || '0',
      uptime: overviewStats?.uptime || 'N/A',
      responseTime: overviewStats?.responseTime || 'N/A'
    };
  };

  const stats = getStatsData();

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton showLogout />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title-wrapper">
            <div className="page-title">{t('dashboard.admin')}</div>

          </div>
          <div className="page-subtitle">{t('dashboard.system_overview')}</div>
        </div>

        <div className="dashboard-grid">
          <StatCard value={stats.totalUsers} label={t('dashboard.total_users')} />
          <StatCard value={stats.totalProperties} label={t('nav.properties')} />
          <StatCard value={stats.uptime} label={t('dashboard.uptime')} />
          <StatCard value={stats.responseTime} label={t('dashboard.response')} />
        </div>

        <ChartCard title={t('nav.reports')}>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#2c3e50' }}>
                {t('dashboard.system_performance')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>{t('dashboard.api_requests')}</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#27ae60' }}>12,847</div>
                  <div style={{ fontSize: '11px', color: '#27ae60' }}>↑ 8.2% {t('dashboard.from_last_week')}</div>
                </div>
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>{t('dashboard.avg_response')}</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#3498db' }}>142ms</div>
                  <div style={{ fontSize: '11px', color: '#27ae60' }}>↓ 3.1% {t('dashboard.faster')}</div>
                </div>
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>{t('dashboard.active_sessions')}</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#f39c12' }}>247</div>
                  <div style={{ fontSize: '11px', color: '#6c757d' }}>{t('dashboard.realtime_users')}</div>
                </div>
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>{t('dashboard.error_rate')}</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#e74c3c' }}>0.3%</div>
                  <div style={{ fontSize: '11px', color: '#27ae60' }}>↓ 0.2% {t('dashboard.improved')}</div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e9ecef' }}>
              <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px' }}>{t('dashboard.recent_reports')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '10px', background: '#fff', border: '1px solid #e9ecef', borderRadius: '4px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#2c3e50' }}>{t('dashboard.monthly_financial_summary')}</div>
                  <div style={{ fontSize: '11px', color: '#6c757d' }}>{t('dashboard.generated_hours_ago')}</div>
                </div>
                <div style={{ padding: '10px', background: '#fff', border: '1px solid #e9ecef', borderRadius: '4px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#2c3e50' }}>{t('dashboard.user_activity_report')}</div>
                  <div style={{ fontSize: '11px', color: '#6c757d' }}>{t('dashboard.generated_today')}</div>
                </div>
                <div style={{ padding: '10px', background: '#fff', border: '1px solid #e9ecef', borderRadius: '4px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#2c3e50' }}>{t('dashboard.maintenance_overview')}</div>
                  <div style={{ fontSize: '11px', color: '#6c757d' }}>{t('dashboard.generated_yesterday')}</div>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>

        <div className="quick-actions">
          <Link 
            to="/admin/users" 
            className="action-card"
          >
            <div className="action-icon">
              <Icon name="users" alt="Users" size={48} color="#162F1B" />
            </div>
            <div className="action-title">{t('nav.users')}</div>
            <div className="action-desc">{t('dashboard.manage_users')}</div>
          </Link>
          
          <Link 
            to="/admin/security" 
            className="action-card"
          >
            <div className="action-icon">
              <Icon name="security" alt="Security" size={48} />
            </div>
            <div className="action-title">{t('nav.security')}</div>
            <div className="action-desc">{t('dashboard.system_security')}</div>
          </Link>
          
          <Link 
            to="/admin/operations" 
            className="action-card"
          >
            <div className="action-icon">
              <Icon name="manage" alt="Operations" size={48} />
            </div>
            <div className="action-title">{t('dashboard.operations')}</div>
            <div className="action-desc">{t('dashboard.performance_health')}</div>
          </Link>
          
          <Link 
            to="/admin/reports" 
            className="action-card"
          >
            <div className="action-icon">
              <Icon name="report" alt="Reports" size={48} />
            </div>
            <div className="action-title">{t('nav.reports')}</div>
            <div className="action-desc">{t('dashboard.analytics_insights')}</div>
          </Link>
          
          <button 
            type="button"
            onClick={() => setShowAnnouncements(true)}
            className="action-card"
          >
            <div className="action-icon">
              <Icon name="announcements" alt="Announcements" size={48} color="#162F1B" />
            </div>
            <div className="action-title">{t('dashboard.announcements')}</div>
            <div className="action-desc">{t('dashboard.system_wide_notifications')}</div>
          </button>

          <button 
            type="button"
            onClick={() => setShowLanguageSelector(true)}
            className="action-card"
          >
            <div className="action-icon">
              <Icon name="language" alt="Language" size={48} color="#162F1B" />
            </div>
            <div className="action-title">{t('settings.change_language')}</div>
            <div className="action-desc">{t('settings.language_description')}</div>
          </button>
        </div>
        <div className="ai-button-container">
        <AIButton 
              userId="admin-user-1" 
              language={localStorage.getItem('language') as 'en' | 'zu' || 'en'}
              userRole="admin"
            />
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
      
      {/* Onboarding Tutorial */}
      <OnboardingTutorial />
      
      {/* Announcement System Modal */}
      {showAnnouncements && (
        <AnnouncementSystem 
          onClose={() => setShowAnnouncements(false)}
          userRole="admin"
        />
      )}

      {/* Language Selector Modal */}
      {showLanguageSelector && (
        <LanguageSelector
          isOpen={showLanguageSelector}
          onClose={() => setShowLanguageSelector(false)}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
