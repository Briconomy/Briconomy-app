import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { adminApi, useApi } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
function AdminReportsPage() {
  const { t } = useLanguage();
  
  const navItems = [
    { path: '/admin', label: t('nav.dashboard') },
    { path: '/admin/users', label: t('nav.users') },
    { path: '/admin/security', label: t('nav.security') },
    { path: '/admin/reports', label: t('nav.reports'), active: true }
  ];

  const { data: financialStats, loading: statsLoading, error: statsError } = useApi(() => adminApi.getFinancialStats());
  const { data: availableReports, loading: reportsLoading, error: reportsError } = useApi(() => adminApi.getAvailableReports());
  const { data: reportActivities, loading: activitiesLoading, error: activitiesError } = useApi(() => adminApi.getReportActivities());

  const getFinancialStatsData = () => {
    if (statsError || !financialStats || (Array.isArray(financialStats) && financialStats.length === 0)) {
      return {
        monthlyRevenue: 'R840k',
        occupancyRate: '88%',
        collectionRate: '95%',
        activeReports: '24'
      };
    }
    
    if (statsLoading) {
      return {
        monthlyRevenue: t('common.loading') + '...',
        occupancyRate: t('common.loading') + '...',
        collectionRate: t('common.loading') + '...',
        activeReports: t('common.loading') + '...'
      };
    }
    
    const stats = Array.isArray(financialStats) ? financialStats[0] : financialStats;
    return {
      monthlyRevenue: `R${(stats.monthlyRevenue / 1000).toFixed(0)}k`,
      occupancyRate: `${stats.occupancyRate}%`,
      collectionRate: `${stats.collectionRate}%`,
      activeReports: stats.activeReports?.toString() || '24'
    };
  };

  const getFallbackReports = () => [
    { title: t('reports.financial') + ' ' + t('reports.title'), description: 'Monthly financial summary report', status: 'ready' },
    { title: t('reports.occupancy') + ' ' + t('reports.title'), description: 'Property occupancy analysis report', status: 'pending' },
    { title: t('reports.maintenance') + ' ' + t('reports.title'), description: 'Maintenance cost analysis report', status: 'ready' },
    { title: t('reports.performance') + ' ' + t('reports.title'), description: 'System performance metrics report', status: 'processing' }
  ];

  const getFallbackActivities = () => [
    { 
      action: t('reports.financial') + ' ' + t('reports.title') + ' ' + t('reports.generate'),
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      details: 'System generated monthly report automatically'
    },
    { 
      action: t('reports.occupancy') + ' analysis updated',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      details: 'Automated analysis completed successfully'
    },
    { 
      action: t('reports.maintenance') + ' ' + t('reports.title') + ' ' + t('reports.generate'),
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      details: 'Weekly maintenance summary completed'
    }
  ];

  const formatActivityTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return '1 day ago';
    } else {
      return `${diffDays} days ago`;
    }
  };

  const stats = getFinancialStatsData();

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">{t('reports.title')} & {t('nav.analytics')}</div>
          <div className="page-subtitle">{t('reports.title')} {t('dashboard.analytics_insights')}</div>
        </div>

        {(statsError || reportsError || activitiesError) && (
          <div className="alert alert-warning mb-4">
            <p>API connection failed - Using fallback data</p>
          </div>
        )}
        
        <div className="dashboard-grid">
          <StatCard value={stats.monthlyRevenue} label={t('payments.monthly_revenue')} />
          <StatCard value={stats.occupancyRate} label={t('reports.occupancy')} />
          <StatCard value={stats.collectionRate} label={t('payments.collection_rate')} />
          <StatCard value={stats.activeReports} label={t('reports.active_reports')} />
        </div>

        <ChartCard title={t('reports.financial_overview')}>
          <div className="chart-placeholder">
            Chart.js {t('reports.financial')}
          </div>
        </ChartCard>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">{t('reports.available')}</div>
          </div>
          
          {reportsLoading ? (
            <div className="list-item">
              <div className="item-info">
                <h4>{t('common.loading')}...</h4>
              </div>
            </div>
          ) : (
            (availableReports || getFallbackReports()).map((report: { title: string; description: string; status: string }, index: number) => (
              <div key={`report-${report.title}-${index}`} className="list-item">
                <div className="item-info">
                  <h4>{report.title}</h4>
                  <p>{report.description}</p>
                </div>
                <span className={`status-badge status-${report.status}`}>{report.status}</span>
              </div>
            ))
          )}
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">{t('reports.generate')}</div>
          </div>
          
          <div className="form-group">
            <label className="form-label">{t('reports.type')}</label>
            <select className="form-select">
              <option>{t('reports.financial')}</option>
              <option>{t('reports.occupancy')}</option>
              <option>{t('reports.maintenance')}</option>
              <option>{t('reports.performance')}</option>
              <option>{t('reports.custom')}</option>
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{t('common.from_date')}</label>
              <input type="date" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">{t('common.to_date')}</label>
              <input type="date" className="form-input" />
            </div>
          </div>
          
          <button type="button" className="btn-primary btn-block">{t('reports.generate')}</button>
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">{t('reports.recent_activity')}</div>
          </div>
          {activitiesLoading ? (
            <div className="list-item">
              <div className="item-info">
                <h4>{t('common.loading')}...</h4>
              </div>
            </div>
          ) : (
            (reportActivities || getFallbackActivities()).map((activity: { action: string; timestamp: string; details: string }, index: number) => (
              <div key={`activity-${activity.timestamp}-${index}`} className="list-item">
                <div className="item-info">
                  <h4>{activity.action}</h4>
                  <p>{formatActivityTime(activity.timestamp)} - {activity.details}</p>
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

export default AdminReportsPage;
