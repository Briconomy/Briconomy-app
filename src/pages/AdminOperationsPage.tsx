import React from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { adminApi, useApi } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';

function AdminOperationsPage() {
  const { t } = useLanguage();
  
  const navItems = [
    { path: '/admin', label: t('nav.dashboard') },
    { path: '/admin/users', label: t('nav.users') },
    { path: '/admin/security', label: t('nav.security') },
    { path: '/admin/reports', label: t('nav.reports') }
  ];

  const { data: systemStats, loading: statsLoading } = useApi(() => adminApi.getSystemStats());
  const { data: databaseHealth, loading: healthLoading } = useApi(() => adminApi.getDatabaseHealth());
  const { data: apiEndpoints, loading: endpointsLoading } = useApi(() => adminApi.getApiEndpoints());
  const { data: systemAlerts, loading: alertsLoading } = useApi(() => adminApi.getSystemAlerts());

  const getPerformanceStats = () => {
    if (statsLoading || !systemStats) {
      return {
        uptime: '99.9%',
        responseTime: '245ms',
        errorRate: '0.1%',
        health: '98%'
      };
    }
    
    const performanceStats = systemStats.find((stat: any) => stat.category === 'performance');
    return {
      uptime: performanceStats?.uptime || '99.9%',
      responseTime: performanceStats?.responseTime || '245ms',
      errorRate: performanceStats?.errorRate || '0.1%',
      health: performanceStats?.health || '98%'
    };
  };

  const formatAlertTime = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return alertTime.toLocaleDateString();
    }
  };

  const stats = getPerformanceStats();

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">{t('admin.operations')}</div>
          <div className="page-subtitle">{t('admin.operations_desc')}</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={stats.uptime} label={t('admin.uptime')} />
          <StatCard value={stats.responseTime} label={t('admin.response')} />
          <StatCard value={stats.errorRate} label={t('admin.error_rate')} />
          <StatCard value={stats.health} label={t('admin.health')} />
        </div>

        <ChartCard title={t('admin.system_performance')}>
          <div className="chart-placeholder">
            Chart.js {t('admin.performance_analytics')}
          </div>
        </ChartCard>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">{t('admin.database_health')}</div>
          </div>
          
          {healthLoading ? (
            <div className="list-item">
              <div className="item-info">
                <h4>{t('common.loading')}...</h4>
              </div>
            </div>
          ) : (
            databaseHealth?.map((health: any, index: number) => (
              <div key={index} className="list-item">
                <div className="item-info">
                  <h4>{health.metric}</h4>
                  <p>{health.value}</p>
                </div>
                <span className={`status-badge status-${health.status}`}>
                  {health.size || health.status}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">{t('admin.api_endpoints')}</div>
          </div>
          
          {endpointsLoading ? (
            <div className="list-item">
              <div className="item-info">
                <h4>{t('common.loading')}...</h4>
              </div>
            </div>
          ) : (
            apiEndpoints?.map((endpoint: any, index: number) => (
              <div key={index} className="list-item">
                <div className="item-info">
                  <h4>{endpoint.endpoint}</h4>
                  <p>{endpoint.successRate}% {t('admin.success_rate')}</p>
                </div>
                <span className={`status-badge status-${endpoint.status}`}>
                  {endpoint.responseTime}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">{t('admin.system_alerts')}</div>
          </div>
          {alertsLoading ? (
            <div className="list-item">
              <div className="item-info">
                <h4>{t('common.loading')}...</h4>
              </div>
            </div>
          ) : (
            systemAlerts?.map((alert: any, index: number) => (
              <div key={index} className="list-item">
                <div className="item-info">
                  <h4>{alert.title}</h4>
                  <p>{formatAlertTime(alert.timestamp)} - {alert.message}</p>
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

export default AdminOperationsPage;
