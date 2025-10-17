import React, { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import Modal from '../components/Modal.tsx';
import { adminApi, useApi } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';

function AdminSecurityPage() {
  const { t } = useLanguage();
  const [selectedSetting, setSelectedSetting] = useState<any>(null);
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [selectedAuthMethod, setSelectedAuthMethod] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [settingValue, setSettingValue] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const navItems = [
    { path: '/admin', label: t('nav.dashboard'), icon: 'performanceAnalytics' },
    { path: '/admin/users', label: t('nav.users'), icon: 'users' },
    { path: '/admin/security', label: t('nav.security'), icon: 'security', active: true },
    { path: '/admin/reports', label: t('nav.reports'), icon: 'report' }
  ];

  const { data: securityStats, loading: statsLoading, refetch: refetchStats } = useApi(() => adminApi.getSecurityStats());
  const { data: securityConfig, loading: configLoading, refetch: refetchConfig } = useApi(() => adminApi.getSecurityConfig());
  const { data: securityAlerts, loading: alertsLoading, refetch: refetchAlerts } = useApi(() => adminApi.getSecurityAlerts());
  const { data: securitySettings, loading: settingsLoading, error: settingsError, refetch: refetchSettings } = useApi(() => adminApi.getSecuritySettings());

  // Debug logging
  console.log('Security settings data:', securitySettings);
  console.log('Settings loading:', settingsLoading);
  console.log('Settings error:', settingsError);
  console.log('Using fallback?', !securitySettings || securitySettings.length === 0);

  const getFallbackSecurityConfig = () => [
    { method: 'Email & Password', description: 'Standard email and password authentication', status: 'enabled' },
    { method: 'Two-Factor Authentication (2FA)', description: 'SMS or authenticator app verification', status: 'enabled' },
    { method: 'OAuth (Google)', description: 'Sign in with Google account', status: 'enabled' },
    { method: 'Biometric Authentication', description: 'Fingerprint or face recognition', status: 'disabled' },
    { method: 'SSO (Single Sign-On)', description: 'Enterprise single sign-on integration', status: 'disabled' }
  ];

  const getFallbackSecurityAlerts = () => [
    { id: '1', title: 'Failed Login Attempts', message: 'Multiple failed login attempts detected from IP 192.168.1.100', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
    { id: '2', title: 'Password Policy Update', message: 'Password policy updated to require 12 characters', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
    { id: '3', title: 'New Admin Account Created', message: 'New administrator account created: admin2@briconomy.com', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() }
  ];

  const getFallbackSecuritySettings = () => [
    { setting: 'Session Timeout', value: '30 minutes', configurable: true },
    { setting: 'Password Expiry', value: '90 days', configurable: true },
    { setting: 'Max Login Attempts', value: '5 attempts', configurable: true },
    { setting: 'IP Whitelist', value: 'Disabled', configurable: true },
    { setting: 'Audit Logging', value: 'Enabled', configurable: false },
    { setting: 'Encryption Standard', value: 'AES-256', configurable: false }
  ];

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
    
    console.log('Updating setting:', selectedSetting.setting, 'with value:', settingValue);
    
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

      console.log('Sending API request with formatted value:', formattedValue);
      
      const result = await adminApi.updateSecuritySetting(selectedSetting.setting, formattedValue);
      console.log('API response:', result);
      
      console.log('Refetching settings...');
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
          ) : (
            (securityConfig && securityConfig.length > 0 ? securityConfig : getFallbackSecurityConfig()).map((config: { method: string; description: string; status: string }, index: number) => (
              <div key={`auth-${config.method}-${index}`} className="list-item">
                <div className="item-info">
                  <h4>{config.method}</h4>
                  <p>{config.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className={`status-badge status-${config.status}`}>{config.status}</span>
                  <button 
                    type="button" 
                    style={{
                      background: config.status === 'enabled' 
                        ? 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
                        : 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: config.status === 'enabled'
                        ? '0 3px 10px rgba(220, 53, 69, 0.3)'
                        : '0 3px 10px rgba(40, 167, 69, 0.3)',
                      transition: 'all 0.3s ease',
                      minWidth: '90px'
                    }}
                    onClick={() => handleToggleAuthMethod(config)}
                  >
                    {config.status === 'enabled' ? t('security.disable') : t('security.enable')}
                  </button>
                </div>
              </div>
            ))
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
            (securityAlerts && securityAlerts.length > 0 ? securityAlerts : getFallbackSecurityAlerts()).map((alert: { id: string; title: string; message: string; timestamp: string }, index: number) => (
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
                    minWidth: '80px'
                  }}
                  onClick={() => handleClearAlert(alert.id)}
                >
                  {t('common.clear')}
                </button>
              </div>
            ))
          )}
        </div>

        <ChartCard title={t('security.access_logs')}>
          <div className="chart-placeholder">
            Chart.js Access Analytics
          </div>
        </ChartCard>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">
              {t('security.settings')} 
              {securitySettings && securitySettings.length > 0 ? 
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
            (() => {
              console.log('Rendering settings, securitySettings:', securitySettings);
              console.log('Is array?', Array.isArray(securitySettings));
              console.log('Length:', securitySettings?.length);
              const useRealData = securitySettings && securitySettings.length > 0;
              console.log('Using real data?', useRealData);
              return useRealData ? securitySettings : getFallbackSecuritySettings();
            })().map((setting: { setting: string; value: string; configurable: boolean }, index: number) => (
              <div key={`setting-${setting.setting}-${index}`} className="list-item">
                <div className="item-info">
                  <h4>{setting.setting} {!setting.configurable && <span style={{ color: '#999', fontSize: '12px' }}>(Read-only)</span>}</h4>
                  <p>{setting.value}</p>
                </div>
                {setting.configurable ? (
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
            ))
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
