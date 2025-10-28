import { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import AccessLogs from '../components/AccessLogs.tsx';
import Modal from '../components/Modal.tsx';
import { adminApi, useApi } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';

type SecurityStat = {
  secureStatus?: string;
  threats?: number;
  monitoring?: string;
  twoFactorEnabled?: string;
};

type SecuritySetting = {
  id?: string;
  setting: string;
  value: string;
  configurable: boolean;
  key?: string;
  updatedAt?: string;
  createdAt?: string;
};

type SecurityConfig = {
  method: string;
  description: string;
  status: string;
};

type SecurityAlert = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
};

function AdminSecurityPage() {
  const { t } = useLanguage();
  const [selectedSetting, setSelectedSetting] = useState<SecuritySetting | null>(null);
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<SecurityConfig | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [settingValue, setSettingValue] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const navItems = [
    { path: '/admin', label: t('nav.dashboard'), icon: 'performanceAnalytics' },
    { path: '/admin/users', label: t('nav.users'), icon: 'users' },
    { path: '/admin/security', label: t('nav.security'), icon: 'security', active: true },
    { path: '/admin/reports', label: t('nav.reports'), icon: 'report' }
  ];

  const { data: securityStats, loading: statsLoading } = useApi<SecurityStat[]>(() => adminApi.getSecurityStats());
  const { data: securitySettings, loading: settingsLoading, refetch: refetchSettings } = useApi<SecuritySetting[]>(() => adminApi.getSecuritySettings());
  const { data: securityConfig, loading: configLoading, refetch: refetchConfig } = useApi<SecurityConfig[]>(() => adminApi.getSecurityConfig());
  const { data: securityAlerts, loading: alertsLoading, refetch: refetchAlerts } = useApi<SecurityAlert[]>(() => adminApi.getSecurityAlerts());

  const getFallbackSecurityAlerts = (): SecurityAlert[] => [
    { id: '1', title: 'Failed Login Attempts', message: 'Multiple failed login attempts detected from IP 192.168.1.100', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: '2', title: 'Password Policy Update', message: 'Password policy updated to require 12 characters', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
    { id: '3', title: 'New Admin Account Created', message: 'New administrator account created: admin2@briconomy.com', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }
  ];

  const getFallbackSecuritySettings = (): SecuritySetting[] => [
    { id: 'fallback-session-timeout', setting: 'Session Timeout', value: '30 minutes', configurable: true },
    { id: 'fallback-password-expiry', setting: 'Password Expiry', value: '90 days', configurable: true },
    { id: 'fallback-max-login-attempts', setting: 'Max Login Attempts', value: '5 attempts', configurable: true },
    { id: 'fallback-ip-whitelist', setting: 'IP Whitelist', value: 'Disabled', configurable: true },
    { id: 'fallback-audit-logging', setting: 'Audit Logging', value: 'Enabled', configurable: false },
    { id: 'fallback-encryption-standard', setting: 'Encryption Standard', value: 'AES-256', configurable: false }
  ];

  const normalizeSettingName = (name: string) => name.trim().toLowerCase();
  const securitySettingOrder = [
    'session timeout',
    'password expiry',
    'max login attempts',
    'ip whitelist',
    'audit logging',
    'encryption standard'
  ];

  const getSettingOrderIndex = (name: string) => {
    const index = securitySettingOrder.indexOf(normalizeSettingName(name));
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };

  const formatUpdatedAt = (timestamp?: string) => {
    if (!timestamp) return '';
    const parsed = new Date(timestamp);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleString();
  };

  const getSecurityStatsData = () => {
    if (statsLoading || !securityStats) {
      return {
        secureStatus: '100%',
        threats: '0',
        monitoring: '24/7',
        twoFactorEnabled: '2FA'
      };
    }
    
  const stats = securityStats?.[0];
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

  const handleConfigureSetting = (setting: SecuritySetting) => {
    setSelectedSetting(setting);
    
    // Extract numeric values from formatted strings
    let currentValue = setting.value || '';
    if (setting.setting.toLowerCase().includes('timeout') && currentValue.includes('minutes')) {
      currentValue = currentValue.replace(/[^\d]/g, '');
    } else if (setting.setting.toLowerCase().includes('expiry') && currentValue.includes('days')) {
      currentValue = currentValue.replace(/[^\d]/g, '');
    } else if (setting.setting.toLowerCase().includes('attempts') && currentValue.includes('attempts')) {
      currentValue = currentValue.replace(/[^\d]/g, '');
    }
    
    setSettingValue(currentValue);
    setShowSettingModal(true);
  };

  const getInputType = (settingName: string) => {
    if (settingName.toLowerCase().includes('timeout') || settingName.toLowerCase().includes('expiry')) {
      return 'number';
    }
    if (settingName.toLowerCase().includes('attempts')) {
      return 'number';
    }
    return 'text';
  };

  const getPlaceholder = (settingName: string) => {
    if (settingName.toLowerCase().includes('timeout')) {
      return 'Enter timeout in minutes';
    }
    if (settingName.toLowerCase().includes('expiry')) {
      return 'Enter days until expiry';
    }
    if (settingName.toLowerCase().includes('attempts')) {
      return 'Enter maximum attempts';
    }
    if (settingName.toLowerCase().includes('whitelist')) {
      return 'Enter IP addresses (comma separated)';
    }
    return 'Enter new value';
  };

  const handleUpdateSetting = async () => {
    if (!selectedSetting) return;
    
    // Basic validation
    if (!settingValue || settingValue.trim() === '') {
      alert('Please enter a valid value');
      return;
    }

    // Validate numeric settings
    if (getInputType(selectedSetting.setting) === 'number') {
      const numValue = parseInt(settingValue);
      if (isNaN(numValue) || numValue < 0) {
        alert('Please enter a valid positive number');
        return;
      }
      if (selectedSetting.setting.toLowerCase().includes('timeout') && numValue > 1440) {
        alert('Session timeout cannot exceed 24 hours (1440 minutes)');
        return;
      }
      if (selectedSetting.setting.toLowerCase().includes('expiry') && numValue > 365) {
        alert('Password expiry cannot exceed 365 days');
        return;
      }
      if (selectedSetting.setting.toLowerCase().includes('attempts') && (numValue < 1 || numValue > 10)) {
        alert('Login attempts must be between 1 and 10');
        return;
      }
    }
    
    setProcessing(true);
    try {
      // Format the value appropriately
      let formattedValue = settingValue;
      if (selectedSetting.setting.toLowerCase().includes('timeout')) {
        formattedValue = `${settingValue} minutes`;
      } else if (selectedSetting.setting.toLowerCase().includes('expiry')) {
        formattedValue = `${settingValue} days`;
      } else if (selectedSetting.setting.toLowerCase().includes('attempts')) {
        formattedValue = `${settingValue} attempts`;
      }
      const targetId = selectedSetting.id && selectedSetting.id.length === 24 ? selectedSetting.id : null;
      await adminApi.updateSecuritySetting(targetId, selectedSetting.setting, formattedValue);
      
      await refetchSettings();
      
      setShowSettingModal(false);
      setSelectedSetting(null);
      alert('Security setting updated successfully');
    } catch (error) {
      console.error('Failed to update setting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Failed to update security setting: ${errorMessage}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleToggleAuthMethod = (method: SecurityConfig) => {
    setSelectedAuthMethod(method);
    setShowAuthModal(true);
  };

  const handleUpdateAuthMethod = async (enabled: boolean) => {
    if (!selectedAuthMethod) return;
    
    setProcessing(true);
    try {
      await adminApi.updateAuthMethod(selectedAuthMethod.method, enabled);
      
      // Force refresh of the config data with a small delay to ensure database update
      setTimeout(async () => {
        await refetchConfig();
      }, 100);
      
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
  const alertsToRender: SecurityAlert[] = securityAlerts?.length ? securityAlerts : getFallbackSecurityAlerts();
  const liveSettings = (securitySettings ?? []).map((setting) => ({
    ...setting,
    configurable: setting.configurable !== false
  }));
  const sortedLiveSettings = [...liveSettings].sort((a, b) => {
    const aIndex = getSettingOrderIndex(a.setting);
    const bIndex = getSettingOrderIndex(b.setting);
    if (aIndex !== bIndex) {
      return aIndex - bIndex;
    }
    return a.setting.localeCompare(b.setting);
  });
  const hasLiveData = sortedLiveSettings.length > 0;
  const settingsToRender: SecuritySetting[] = hasLiveData ? sortedLiveSettings : getFallbackSecuritySettings();

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton showLogout />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">{t('security.page_title')}</div>
          <div className="page-subtitle">{t('security.page_subtitle')}</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={stats.secureStatus} label={t('security.secure')} />
          <StatCard value={stats.threats} label={t('security.threats')} />
          <StatCard value={stats.monitoring} label={t('security.monitoring')} />
          <StatCard value={stats.twoFactorEnabled} label={t('security.enabled')} />
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">{t('security.auth_methods')}</div>
          </div>

          {configLoading ? (
            <div className="list-item">
              <div className="item-info">
                <h4>{t('security.loading_auth')}</h4>
              </div>
            </div>
          ) : securityConfig && securityConfig.length > 0 ? (
            securityConfig.map((config, index) => {
              const isEnabled = config.status === 'enabled';

              return (
                <div key={`auth-${config.method}-${index}`} className="list-item">
                  <div className="item-info">
                    <h4>{config.method}</h4>
                    <p>{config.description}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span
                      className={`status-badge status-${config.status}`}
                      style={{
                        minWidth: '80px',
                        width: '80px',
                        textAlign: 'center',
                        display: 'inline-block',
                        marginTop: '5px'
                      }}
                    >
                      {config.status}
                    </span>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{
                        padding: '10px 20px',
                        fontSize: '14px',
                        boxShadow: '0 3px 10px rgba(255, 137, 77, 0.3)',
                        width: '120px',
                        textAlign: 'center',
                        marginTop: '5px'
                      }}
                      onClick={() => handleToggleAuthMethod(config)}
                    >
                      {isEnabled ? t('security.disable') : t('security.enable')}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="list-item">
              <div className="item-info">
                <h4>No authentication methods found</h4>
                <p>Database connection issue or auth_config collection needs initialization. Check console for details.</p>
              </div>
              <button
                type="button"
                style={{
                  background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 3px 10px rgba(74, 144, 226, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => globalThis.location.reload()}
              >
                Retry
              </button>
            </div>
          )}
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">{t('security.alerts')}</div>
          </div>
          {alertsLoading ? (
            <div className="list-item">
              <div className="item-info">
                <h4>{t('security.loading_alerts')}</h4>
              </div>
            </div>
          ) : (
            alertsToRender.map((alert, index) => (
              <div key={`alert-${alert.id || index}`} className="list-item">
                <div className="item-info">
                  <h4>{alert.title}</h4>
                  <p>{formatAlertTime(alert.timestamp)} - {alert.message}</p>
                </div>
                <button 
                  type="button" 
                  style={{
                    background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
                    color: 'white',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 3px 10px rgba(108, 117, 125, 0.3)',
                    transition: 'all 0.3s ease',
                    minWidth: '80px',
                    marginTop: '5px',
                    marginBottom: '-15px'
                  }}
                  onClick={() => handleClearAlert(alert.id)}
                >
                  {t('common.clear')}
                </button>
              </div>
            ))
          )}
        </div>

        <div className="data-table">
          <AccessLogs maxItems={10} showFilters />
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">
              {t('security.settings')} 
              {hasLiveData ? 
                <span style={{ color: 'green', fontSize: '12px', marginLeft: '8px' }}>(Live Data)</span> : 
                <span style={{ color: 'orange', fontSize: '12px', marginLeft: '8px' }}>(Fallback Data)</span>
              }
            </div>
          </div>
          {settingsLoading ? (
            <div className="list-item">
              <div className="item-info">
                <h4>{t('security.loading_settings')}</h4>
              </div>
            </div>
          ) : (
            settingsToRender.map((setting, index) => {
              const updatedLabel = formatUpdatedAt(setting.updatedAt);
              const isConfigurable = setting.configurable !== false;
              const itemKey = setting.id ? `setting-${setting.id}` : `setting-${setting.setting}-${index}`;
              return (
                <div key={itemKey} className="list-item">
                  <div className="item-info">
                    <h4>{setting.setting} {!isConfigurable && <span style={{ color: '#999', fontSize: '12px' }}>(Read-only)</span>}</h4>
                    <p>{setting.value}</p>
                    {updatedLabel && (
                      <p style={{ fontSize: '12px', color: '#666' }}>Last updated {updatedLabel}</p>
                    )}
                  </div>
                  {isConfigurable ? (
                  <button 
                    type="button" 
                    style={{
                      background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(74, 144, 226, 0.3)',
                      transition: 'all 0.3s ease',
                      minWidth: '100px'
                    }}
                      onClick={() => handleConfigureSetting(setting)}
                    >
                      {t('security.configure')}
                    </button>
                  ) : (
                    <span style={{ 
                      color: '#999', 
                      fontSize: '12px', 
                      fontStyle: 'italic',
                      padding: '10px 20px'
                    }}>
                      System Managed
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
      
      {showAuthModal && selectedAuthMethod && (
        <Modal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} title={t('security.update_auth_method')}>
          <p>{t('security.confirm_auth_change')} <strong>{selectedAuthMethod.method}</strong>?</p>
          <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              style={{
                background: '#e9ecef',
                color: '#495057',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setShowAuthModal(false)}
              disabled={processing}
            >
              {t('common.cancel')}
            </button>
            <button 
              type="button" 
              style={{
                background: selectedAuthMethod.status === 'enabled'
                  ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                  : 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease'
              }}
              onClick={() => handleUpdateAuthMethod(selectedAuthMethod.status !== 'enabled')}
              disabled={processing}
            >
              {processing ? t('common.processing') : t('common.confirm')}
            </button>
          </div>
        </Modal>
      )}
      
      {showSettingModal && selectedSetting && (
        <Modal isOpen={showSettingModal} onClose={() => setShowSettingModal(false)} title={`Configure ${selectedSetting.setting}`}>
          <div className="form-group">
            <label>{selectedSetting.setting}</label>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
              Current value: <strong>{selectedSetting.value}</strong>
            </p>
            {selectedSetting.setting.toLowerCase().includes('whitelist') && selectedSetting.value.toLowerCase() === 'disabled' ? (
              <select
                className="form-control"
                value={settingValue}
                onChange={(e) => setSettingValue(e.target.value)}
                style={{ marginBottom: '10px' }}
              >
                <option value="Disabled">Disabled</option>
                <option value="Enabled">Enabled</option>
              </select>
            ) : (
              <input
                type={getInputType(selectedSetting.setting)}
                className="form-control"
                value={settingValue}
                onChange={(e) => setSettingValue(e.target.value)}
                placeholder={getPlaceholder(selectedSetting.setting)}
              />
            )}
            {selectedSetting.setting.toLowerCase().includes('timeout') && (
              <small style={{ color: '#666', fontSize: '11px' }}>
                Enter the number of minutes before session expires
              </small>
            )}
            {selectedSetting.setting.toLowerCase().includes('expiry') && (
              <small style={{ color: '#666', fontSize: '11px' }}>
                Enter the number of days before password expires
              </small>
            )}
            {selectedSetting.setting.toLowerCase().includes('attempts') && (
              <small style={{ color: '#666', fontSize: '11px' }}>
                Enter the maximum number of failed login attempts allowed
              </small>
            )}
          </div>
          <div className="modal-footer" style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              style={{
                background: '#e9ecef',
                color: '#495057',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => setShowSettingModal(false)}
              disabled={processing}
            >
              Cancel
            </button>
            <button 
              type="button" 
              style={{
                background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(74, 144, 226, 0.3)',
                transition: 'all 0.3s ease'
              }}
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
