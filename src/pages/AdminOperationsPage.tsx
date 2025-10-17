import React, { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import Modal from '../components/Modal.tsx';
import { adminApi, useApi } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';

function AdminOperationsPage() {
  const { t } = useLanguage();
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionResult, setActionResult] = useState<string | null>(null);
  
  const navItems = [
    { path: '/admin', label: t('nav.dashboard') },
    { path: '/admin/users', label: t('nav.users') },
    { path: '/admin/security', label: t('nav.security') },
    { path: '/admin/reports', label: t('nav.reports') }
  ];

  const { data: systemStats, loading: statsLoading, refetch: refetchStats } = useApi(() => adminApi.getSystemStats());
  const { data: databaseHealth, loading: healthLoading, refetch: refetchHealth } = useApi(() => adminApi.getDatabaseHealth());
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

  const handleSystemAction = (action: string) => {
    setSelectedAction(action);
    setShowActionModal(true);
    setActionResult(null);
  };

  const executeSystemAction = async () => {
    setProcessing(true);
    setActionResult(null);
    
    try {
      const result = await adminApi.triggerSystemAction(selectedAction);
      setActionResult(`Action "${selectedAction}" executed successfully`);
      
      if (selectedAction === 'clear-cache' || selectedAction === 'optimize-db') {
        await refetchStats();
        await refetchHealth();
      }
    } catch (error) {
      setActionResult(`Failed to execute action: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setProcessing(false);
    }
  };

  const stats = getPerformanceStats();

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton showLogout />
      
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
            <div className="table-title">System Actions</div>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>Clear Cache</h4>
              <p>Clear all system caches to improve performance</p>
            </div>
            <button 
              type="button" 
              className="btn-primary"
              onClick={() => handleSystemAction('clear-cache')}
            >
              Execute
            </button>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>Optimize Database</h4>
              <p>Run database optimization and indexing</p>
            </div>
            <button 
              type="button" 
              className="btn-primary"
              onClick={() => handleSystemAction('optimize-db')}
            >
              Execute
            </button>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>Backup System</h4>
              <p>Create a full system backup</p>
            </div>
            <button 
              type="button" 
              className="btn-primary"
              onClick={() => handleSystemAction('backup-system')}
            >
              Execute
            </button>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>Restart Services</h4>
              <p>Restart all background services</p>
            </div>
            <button 
              type="button" 
              className="btn-secondary"
              onClick={() => handleSystemAction('restart-services')}
            >
              Execute
            </button>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>Generate Health Report</h4>
              <p>Generate comprehensive system health report</p>
            </div>
            <button 
              type="button" 
              className="btn-primary"
              onClick={() => handleSystemAction('health-report')}
            >
              Execute
            </button>
          </div>
        </div>

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
            databaseHealth?.map((health: { metric: string; value: string; status: string; size?: string }, index: number) => (
              <div key={`health-${health.metric}-${index}`} className="list-item">
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
            apiEndpoints?.map((endpoint: { endpoint: string; successRate: number; status: string; responseTime: string }, index: number) => (
              <div key={`endpoint-${endpoint.endpoint}-${index}`} className="list-item">
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
            systemAlerts?.map((alert: { id: string; title: string; message: string; timestamp: string }, index: number) => (
              <div key={`alert-${alert.id || index}`} className="list-item">
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
      
      {showActionModal && (
        <Modal isOpen={showActionModal} onClose={() => setShowActionModal(false)} title="Execute System Action">
          <p>Are you sure you want to execute: <strong>{selectedAction}</strong>?</p>
          {actionResult && (
            <div className={`alert ${actionResult.includes('Failed') ? 'alert-error' : 'alert-success'}`} style={{ marginTop: '15px' }}>
              {actionResult}
            </div>
          )}
          <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => setShowActionModal(false)}
              disabled={processing}
            >
              {actionResult ? 'Close' : 'Cancel'}
            </button>
            {!actionResult && (
              <button 
                type="button" 
                className="btn-primary"
                onClick={executeSystemAction}
                disabled={processing}
              >
                {processing ? 'Executing...' : 'Execute'}
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AdminOperationsPage;
