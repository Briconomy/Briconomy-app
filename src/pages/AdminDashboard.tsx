import { useState } from 'react';
import { Link } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import AnnouncementSystem from '../components/AnnouncementSystem.tsx';
import AIButton from '../components/AIButton.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { adminApi, useApi } from '../services/api.ts';

function AdminDashboard() {
  const { t } = useLanguage();
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  
  const navItems = [
    { path: '/admin', label: t('nav.dashboard'), active: true },
    { path: '/admin/users', label: t('nav.users') },
    { path: '/admin/security', label: t('nav.security') },
    { path: '/admin/reports', label: t('nav.reports') }
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
    
    const overviewStats = systemStats.find((stat: any) => stat.category === 'overview');
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="page-title">{t('dashboard.admin')}</div>
            
          </div>
          <div className="page-subtitle">{t('dashboard.system_overview')}</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={stats.totalUsers} label={t('dashboard.total_users')} />
          <StatCard value={stats.totalProperties} label={t('nav.properties')} />
          <StatCard value={stats.uptime} label="Uptime" />
          <StatCard value={stats.responseTime} label="Response" />
        </div>

        <ChartCard title={t('nav.reports')}>
          <div className="chart-placeholder">
            Chart.js Performance Analytics
          </div>
        </ChartCard>

        <div className="quick-actions">
          <Link 
            to="/admin/users" 
            className="action-card"
          >
            <div className="action-icon">U</div>
            <div className="action-title">{t('nav.users')}</div>
            <div className="action-desc">{t('dashboard.manage_users')}</div>
          </Link>
          
          <Link 
            to="/admin/security" 
            className="action-card"
          >
            <div className="action-icon">S</div>
            <div className="action-title">{t('nav.security')}</div>
            <div className="action-desc">{t('dashboard.system_security')}</div>
          </Link>
          
          <Link 
            to="/admin/operations" 
            className="action-card"
          >
            <div className="action-icon">O</div>
            <div className="action-title">Operations</div>
            <div className="action-desc">{t('dashboard.performance_health')}</div>
          </Link>
          
          <Link 
            to="/admin/reports" 
            className="action-card"
          >
            <div className="action-icon">R</div>
            <div className="action-title">{t('nav.reports')}</div>
            <div className="action-desc">{t('dashboard.analytics_insights')}</div>
          </Link>
          
          <button 
            type="button"
            onClick={() => setShowAnnouncements(true)}
            className="action-card"
            style={{ cursor: 'pointer', border: 'none', background: 'none', padding: 0, width: '100%' }}
          >
            <div className="action-icon">A</div>
            <div className="action-title">Announcements</div>
            <div className="action-desc">System-wide notifications</div>
          </button>
        </div>
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <AIButton 
              userId="admin-user-1" 
              language={localStorage.getItem('language') as 'en' | 'zu' || 'en'}
              userRole="admin"
            />
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
      
      {/* Announcement System Modal */}
      {showAnnouncements && (
        <AnnouncementSystem 
          onClose={() => setShowAnnouncements(false)}
        />
      )}
    </div>
  );
}

export default AdminDashboard;
