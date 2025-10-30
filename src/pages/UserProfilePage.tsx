import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { LanguageSwitcher, useLanguage } from '../contexts/LanguageContext.tsx';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import Icon from '../components/Icon.tsx';
import { leasesApi, useApi } from '../services/api.ts';

function UserProfilePage() {
  const navigate = useNavigate();
  const { user, loading, updateUser } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);

  const { data: leases } = useApi(
    () => leasesApi.getAll({ tenantId: user?.id }),
    [user?.id]
  );

  const currentLease = Array.isArray(leases) ? leases[0] : null;
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    twoFactor: false
  });

  const navItems = [
    { path: '/tenant', label: t('nav.home'), icon: 'properties', active: false },
    { path: '/tenant/payments', label: t('nav.payments'), icon: 'payment' },
    { path: '/tenant/requests', label: t('nav.requests'), icon: 'maintenance' },
    { path: '/tenant/profile', label: t('nav.profile'), icon: 'profile', active: true }
  ];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    } else if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        emergencyContact: user.emergencyContact || { name: '', relationship: '', phone: '' }
      });
      if (user.profile?.notificationSettings) {
        const settings = user.profile.notificationSettings as { email?: boolean; push?: boolean; sms?: boolean; twoFactor?: boolean };
        setNotificationSettings({
          email: settings.email ?? true,
          push: settings.push ?? true,
          sms: settings.sms ?? false,
          twoFactor: settings.twoFactor ?? false
        });
      }
    }
  }, [user, loading, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }));
  };

  const handleNotificationChange = (setting: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleSave = () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      emergencyContact: formData.emergencyContact,
      profile: {
        ...user.profile,
        notificationSettings: notificationSettings
      }
    };

    updateUser(updatedUser);
    setIsEditing(false);
  alert(t('profile.updateSuccess'));
  };

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t('common.loading')}</p>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const leaseEndDate = user.leaseEnd ? new Date(user.leaseEnd) : new Date();
  const leaseDaysRemaining = Math.ceil((leaseEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const tenantStats = [
    { value: currentLease?.unit?.unitNumber || 'N/A', label: t('property.unit') },
    { value: `R${(currentLease?.monthlyRent || 0).toLocaleString()}`, label: t('property.monthlyRent') },
    { value: `${leaseDaysRemaining} ${t('property.days')}`, label: t('property.leaseRemaining') },
    { value: t('status.active'), label: t('common.status') },
    { value: new Date(user.leaseStart || new Date()).toLocaleDateString(), label: t('profile.leaseStart') },
    { value: new Date(user.leaseEnd || new Date()).toLocaleDateString(), label: t('profile.leaseEnd') },
    { value: currentLease?.property?.name || 'N/A', label: t('profile.property') },
    { value: new Date(user.joinDate || new Date()).toLocaleDateString(), label: t('profile.memberSince') }
  ];

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">{t('nav.profile')}</div>
          <div className="page-subtitle">{t('profile.updateInfo')}</div>
          <button type="button"
            className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'} btn-sm caretaker-edit-btn`}
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? t('action.save') : t('common.edit_user')}
          </button>
        </div>

        <div className="section-card profile-info-section">
          <div className="section-card-header">
            <div className="section-title">{t('profile.personalInfo')}</div>
          </div>
          <div className="profile-info-grid">
            <div className="profile-field-block">
              <label className="profile-field-label">{t('profile.fullName')}</label>
              {isEditing ? (
                <input
                  type="text"
                  className="profile-field-input"
                  value={formData.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              ) : (
                <div className="profile-field-value">{user?.fullName || t('profile.notProvided')}</div>
              )}
            </div>

            <div className="profile-field-block">
              <label className="profile-field-label">{t('profile.email')}</label>
              {isEditing ? (
                <input
                  type="email"
                  className="profile-field-input"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              ) : (
                <div className="profile-field-value">{user?.email || t('profile.notProvided')}</div>
              )}
            </div>

            <div className="profile-field-block">
              <label className="profile-field-label">{t('profile.phone')}</label>
              {isEditing ? (
                <input
                  type="tel"
                  className="profile-field-input"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              ) : (
                <div className="profile-field-value">{user?.phone || t('profile.notProvided')}</div>
              )}
            </div>
          </div>
        </div>

        <div className="section-card profile-info-section">
          <div className="section-card-header">
            <div className="section-title">{t('profile.emergencyContact')}</div>
          </div>
          <div className="profile-info-grid">
            <div className="profile-field-block">
              <label className="profile-field-label">{t('profile.name')}</label>
              {isEditing ? (
                <input
                  type="text"
                  className="profile-field-input"
                  value={formData.emergencyContact?.name || ''}
                  onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                />
              ) : (
                <div className="profile-field-value">{user?.emergencyContact?.name || t('profile.notProvided')}</div>
              )}
            </div>

            <div className="profile-field-block">
              <label className="profile-field-label">{t('profile.relationship')}</label>
              {isEditing ? (
                <input
                  type="text"
                  className="profile-field-input"
                  value={formData.emergencyContact?.relationship || ''}
                  onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                />
              ) : (
                <div className="profile-field-value">{user?.emergencyContact?.relationship || t('profile.notProvided')}</div>
              )}
            </div>

            <div className="profile-field-block">
              <label className="profile-field-label">{t('profile.phone')}</label>
              {isEditing ? (
                <input
                  type="tel"
                  className="profile-field-input"
                  value={formData.emergencyContact?.phone || ''}
                  onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                />
              ) : (
                <div className="profile-field-value">{user?.emergencyContact?.phone || t('profile.notProvided')}</div>
              )}
            </div>
          </div>
        </div>

        <div className="section-card profile-stats-section">
          <div className="section-card-header">
            <div className="section-title">{t('profile.leaseInfo')}</div>
          </div>
          <div className="caretaker-stats-grid">
            {tenantStats.map(stat => (
              <StatCard key={stat.label} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>

        <div className="section-card profile-settings-section">
          <div className="section-card-header">
            <div className="section-title">{t('profile.accountSettings')}</div>
          </div>
          <div className="caretaker-notification-settings">
            <div className="caretaker-setting-item">
              <div className="caretaker-setting-info">
                <div className="caretaker-setting-title">{t('profile.emailNotificationsTitle')}</div>
                <div className="caretaker-setting-desc">{t('profile.emailNotificationsDescription')}</div>
              </div>
              <div
                className={`caretaker-toggle-switch ${notificationSettings.email ? 'caretaker-toggle-on' : 'caretaker-toggle-off'}`}
                onClick={() => handleNotificationChange('email')}
              >
                <div className="caretaker-toggle-slider"></div>
              </div>
            </div>

            <div className="caretaker-setting-item">
              <div className="caretaker-setting-info">
                <div className="caretaker-setting-title">{t('profile.pushNotificationsTitle')}</div>
                <div className="caretaker-setting-desc">{t('profile.pushNotificationsDescription')}</div>
              </div>
              <div
                className={`caretaker-toggle-switch ${notificationSettings.push ? 'caretaker-toggle-on' : 'caretaker-toggle-off'}`}
                onClick={() => handleNotificationChange('push')}
              >
                <div className="caretaker-toggle-slider"></div>
              </div>
            </div>

            <div className="caretaker-setting-item">
              <div className="caretaker-setting-info">
                <div className="caretaker-setting-title">{t('profile.smsNotificationsTitle')}</div>
                <div className="caretaker-setting-desc">{t('profile.smsNotificationsDescription')}</div>
              </div>
              <div
                className={`caretaker-toggle-switch ${notificationSettings.sms ? 'caretaker-toggle-on' : 'caretaker-toggle-off'}`}
                onClick={() => handleNotificationChange('sms')}
              >
                <div className="caretaker-toggle-slider"></div>
              </div>
            </div>

            <div className="caretaker-setting-item">
              <div className="caretaker-setting-info">
                <div className="caretaker-setting-title">{t('profile.languagePreferenceTitle')}</div>
                <div className="caretaker-setting-desc">{t('profile.languagePreferenceDescription')}</div>
              </div>
              <LanguageSwitcher />
            </div>

            <div className="caretaker-setting-item">
              <div className="caretaker-setting-info">
                <div className="caretaker-setting-title">{t('profile.twoFactorTitle')}</div>
                <div className="caretaker-setting-desc">{t('profile.twoFactorDescription')}</div>
                <div className="caretaker-setting-desc" style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>{t('profile.comingSoon')}</div>
              </div>
              <div
                className="caretaker-toggle-switch caretaker-toggle-off"
                style={{ opacity: '0.5', cursor: 'not-allowed' }}
              >
                <div className="caretaker-toggle-slider"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="section-card profile-actions-section">
          <div className="section-card-header">
            <div className="section-title">{t('profile.quickActions')}</div>
          </div>
          <div className="quick-actions">
            <ActionCard
              to="/tenant/documents"
              icon={<Icon name="docs" alt={t('profile.documents')} size={48} />}
              title={t('profile.documents')}
              description={t('profile.viewDocuments')}
            />
            <ActionCard
              to="/tenant/activity"
              icon={<Icon name="activityLog" alt={t('profile.activityLog')} size={48} />}
              title={t('profile.activityLog')}
              description={t('profile.viewActivity')}
            />
          </div>
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default UserProfilePage;
