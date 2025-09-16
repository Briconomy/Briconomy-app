import React from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { adminApi, useApi } from '../services/api.ts';

function AdminSecurityPage() {
  const navItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/security', label: 'Security', active: true },
    { path: '/admin/reports', label: 'Reports' }
  ];

  const { data: securityStats, loading: statsLoading } = useApi(() => adminApi.getSecurityStats());
  const { data: securityConfig, loading: configLoading } = useApi(() => adminApi.getSecurityConfig());
  const { data: securityAlerts, loading: alertsLoading } = useApi(() => adminApi.getSecurityAlerts());
  const { data: securitySettings, loading: settingsLoading } = useApi(() => adminApi.getSecuritySettings());

  const getSecurityStatsData = () => {
    if (statsLoading || !securityStats) {
      return {
        secureStatus: '100%',
        threats: '0',
        monitoring: '24/7',
        twoFactorEnabled: '2FA'
      };
    }
    
    const stats = securityStats[0];
    return {
      secureStatus: stats?.secureStatus || '100%',
      threats: stats?.threats?.toString() || '0',
      monitoring: stats?.monitoring || '24/7',
      twoFactorEnabled: stats?.twoFactorEnabled || '2FA'
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

  const stats = getSecurityStatsData();

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Security Management</div>
          <div className="page-subtitle">Monitor and configure system security</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={stats.secureStatus} label="Secure" />
          <StatCard value={stats.threats} label="Threats" />
          <StatCard value={stats.monitoring} label="Monitoring" />
          <StatCard value={stats.twoFactorEnabled} label="Enabled" />
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Authentication Methods</div>
          </div>
          
          {configLoading ? (
            <div className="list-item">
              <div className="item-info">
                <h4>Loading authentication methods...</h4>
              </div>
            </div>
          ) : (
            securityConfig?.map((config: any, index: number) => (
              <div key={index} className="list-item">
                <div className="item-info">
                  <h4>{config.method}</h4>
                  <p>{config.description}</p>
                </div>
                <span className={`status-badge status-${config.status}`}>{config.status}</span>
              </div>
            ))
          )}
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Security Alerts</div>
          </div>
          {alertsLoading ? (
            <div className="list-item">
              <div className="item-info">
                <h4>Loading security alerts...</h4>
              </div>
            </div>
          ) : (
            securityAlerts?.map((alert: any, index: number) => (
              <div key={index} className="list-item">
                <div className="item-info">
                  <h4>{alert.title}</h4>
                  <p>{formatAlertTime(alert.timestamp)} - {alert.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <ChartCard title="Access Logs">
          <div className="chart-placeholder">
            Chart.js Access Analytics
          </div>
        </ChartCard>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Security Settings</div>
          </div>
          {settingsLoading ? (
            <div className="list-item">
              <div className="item-info">
                <h4>Loading security settings...</h4>
              </div>
            </div>
          ) : (
            securitySettings?.map((setting: any, index: number) => (
              <div key={index} className="list-item">
                <div className="item-info">
                  <h4>{setting.setting}</h4>
                  <p>{setting.value}</p>
                </div>
                {setting.configurable && <button className="btn-secondary">Configure</button>}
              </div>
            ))
          )}
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default AdminSecurityPage;
