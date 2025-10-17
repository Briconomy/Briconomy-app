import React, { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import Modal from '../components/Modal.tsx';
import { adminApi, useApi } from '../services/api.ts';

function AdminSecurityPage() {
  const [selectedSetting, setSelectedSetting] = useState<any>(null);
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [settingValue, setSettingValue] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const navItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/security', label: 'Security', active: true },
    { path: '/admin/reports', label: 'Reports' }
  ];

  const { data: securityStats, loading: statsLoading, refetch: refetchStats } = useApi(() => adminApi.getSecurityStats());
  const { data: securityConfig, loading: configLoading, refetch: refetchConfig } = useApi(() => adminApi.getSecurityConfig());
  const { data: securityAlerts, loading: alertsLoading, refetch: refetchAlerts } = useApi(() => adminApi.getSecurityAlerts());
  const { data: securitySettings, loading: settingsLoading, refetch: refetchSettings } = useApi(() => adminApi.getSecuritySettings());

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

  const handleConfigureSetting = (setting: any) => {
    setSelectedSetting(setting);
    setSettingValue(setting.value || '');
    setShowSettingModal(true);
  };

  const handleUpdateSetting = async () => {
    if (!selectedSetting) return;
    
    setProcessing(true);
    try {
      await adminApi.updateSecuritySetting(selectedSetting.setting, settingValue);
      await refetchSettings();
      setShowSettingModal(false);
      setSelectedSetting(null);
      alert('Security setting updated successfully');
    } catch (error) {
      console.error('Failed to update setting:', error);
      alert('Failed to update security setting');
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleAuthMethod = (method: any) => {
    setSelectedAuthMethod(method);
    setShowAuthModal(true);
  };

  const handleUpdateAuthMethod = async (enabled: boolean) => {
    if (!selectedAuthMethod) return;
    
    setProcessing(true);
    try {
      await adminApi.updateAuthMethod(selectedAuthMethod.method, enabled);
      await refetchConfig();
      setShowAuthModal(false);
      setSelectedAuthMethod(null);
      alert(`Authentication method ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('Failed to update auth method:', error);
      alert('Failed to update authentication method');
    } finally {
      setProcessing(false);
    }
  };

  const handleClearAlert = async (alertId: string) => {
    try {
      await adminApi.clearSecurityAlert(alertId);
      await refetchAlerts();
      alert('Security alert cleared');
    } catch (error) {
      console.error('Failed to clear alert:', error);
      alert('Failed to clear security alert');
    }
  };

  const stats = getSecurityStatsData();

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton showLogout />
      
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
            securityConfig?.map((config: { method: string; description: string; status: string }, index: number) => (
              <div key={`auth-${config.method}-${index}`} className="list-item">
                <div className="item-info">
                  <h4>{config.method}</h4>
                  <p>{config.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className={`status-badge status-${config.status}`}>{config.status}</span>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => handleToggleAuthMethod(config)}
                  >
                    {config.status === 'enabled' ? 'Disable' : 'Enable'}
                  </button>
                </div>
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
            securityAlerts?.map((alert: { id: string; title: string; message: string; timestamp: string }, index: number) => (
              <div key={`alert-${alert.id || index}`} className="list-item">
                <div className="item-info">
                  <h4>{alert.title}</h4>
                  <p>{formatAlertTime(alert.timestamp)} - {alert.message}</p>
                </div>
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => handleClearAlert(alert.id)}
                >
                  Clear
                </button>
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
            securitySettings?.map((setting: { setting: string; value: string; configurable: boolean }, index: number) => (
              <div key={`setting-${setting.setting}-${index}`} className="list-item">
                <div className="item-info">
                  <h4>{setting.setting}</h4>
                  <p>{setting.value}</p>
                </div>
                {setting.configurable && (
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => handleConfigureSetting(setting)}
                  >
                    Configure
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
      
      {showAuthModal && selectedAuthMethod && (
        <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} title="Update Authentication Method">
          <p>Do you want to {selectedAuthMethod.status === 'enabled' ? 'disable' : 'enable'} the authentication method: <strong>{selectedAuthMethod.method}</strong>?</p>
          <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => setShowAuthModal(false)}
              disabled={processing}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn-primary"
              onClick={() => handleUpdateAuthMethod(selectedAuthMethod.status !== 'enabled')}
              disabled={processing}
            >
              {processing ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </Modal>
      )}
      
      {showSettingModal && selectedSetting && (
        <Modal isOpen={showSettingModal} onClose={() => setShowSettingModal(false)} title="Configure Security Setting">
          <div className="form-group">
            <label>{selectedSetting.setting}</label>
            <input
              type="text"
              className="form-control"
              value={settingValue}
              onChange={(e) => setSettingValue(e.target.value)}
              placeholder="Enter new value"
            />
          </div>
          <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => setShowSettingModal(false)}
              disabled={processing}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn-primary"
              onClick={handleUpdateSetting}
              disabled={processing}
            >
              {processing ? 'Saving...' : 'Save'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AdminSecurityPage;
