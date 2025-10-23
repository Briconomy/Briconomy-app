import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { LanguageSwitcher, useLanguage } from '../contexts/LanguageContext.tsx';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import Icon from '../components/Icon.tsx';

function UserProfilePage() {
  const navigate = useNavigate();
  const { user, loading, updateUser } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
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
    alert('Profile updated successfully!');
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
    { value: user.unit || 'N/A', label: t('property.unit') },
    { value: `R${(user.rent || 0).toLocaleString()}`, label: t('property.monthlyRent') },
    { value: `${leaseDaysRemaining} ${t('property.days')}`, label: t('property.leaseRemaining') },
    { value: t('status.active'), label: t('common.status') },
    { value: new Date(user.leaseStart || new Date()).toLocaleDateString(), label: t('profile.leaseStart') },
    { value: new Date(user.leaseEnd || new Date()).toLocaleDateString(), label: t('profile.leaseEnd') },
    { value: user.property || 'N/A', label: t('profile.property') },
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

        {/* Profile Information */}
        <ChartCard title={t('profile.personalInfo')}>
          <div className="caretaker-profile-info">
            <div className="caretaker-profile-field">
              <label className="caretaker-field-label">{t('profile.fullName')}</label>
              {isEditing ? (
                <input
                  type="text"
                  className="caretaker-field-input"
                  value={formData.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              ) : (
                <div className="caretaker-field-value">{user?.fullName || 'Not provided'}</div>
              )}
            </div>

            <div className="caretaker-profile-field">
              <label className="caretaker-field-label">{t('profile.email')}</label>
              {isEditing ? (
                <input
                  type="email"
                  className="caretaker-field-input"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              ) : (
                <div className="caretaker-field-value">{user?.email || 'Not provided'}</div>
              )}
            </div>

            <div className="caretaker-profile-field">
              <label className="caretaker-field-label">{t('profile.phone')}</label>
              {isEditing ? (
                <input
                  type="tel"
                  className="caretaker-field-input"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              ) : (
                <div className="caretaker-field-value">{user?.phone || 'Not provided'}</div>
              )}
            </div>
          </div>
        </ChartCard>

        {/* Emergency Contact */}
        <ChartCard title={t('profile.emergencyContact')}>
          <div className="caretaker-profile-info">
            <div className="caretaker-profile-field">
              <label className="caretaker-field-label">{t('profile.name')}</label>
              {isEditing ? (
                <input
                  type="text"
                  className="caretaker-field-input"
                  value={formData.emergencyContact?.name || ''}
                  onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                />
              ) : (
                <div className="caretaker-field-value">{user?.emergencyContact?.name || 'Not provided'}</div>
              )}
            </div>

            <div className="caretaker-profile-field">
              <label className="caretaker-field-label">{t('profile.relationship')}</label>
              {isEditing ? (
                <input
                  type="text"
                  className="caretaker-field-input"
                  value={formData.emergencyContact?.relationship || ''}
                  onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                />
              ) : (
                <div className="caretaker-field-value">{user?.emergencyContact?.relationship || 'Not provided'}</div>
              )}
            </div>

            <div className="caretaker-profile-field">
              <label className="caretaker-field-label">{t('profile.phone')}</label>
              {isEditing ? (
                <input
                  type="tel"
                  className="caretaker-field-input"
                  value={formData.emergencyContact?.phone || ''}
                  onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                />
              ) : (
                <div className="caretaker-field-value">{user?.emergencyContact?.phone || 'Not provided'}</div>
              )}
            </div>
          </div>
        </ChartCard>

        {/* Lease Statistics */}
        <div className="caretaker-stats-grid">
          {tenantStats.map(stat => (
            <StatCard key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>

        {/* Notification Settings */}
        <ChartCard title={t('profile.accountSettings')}>
          <div className="caretaker-notification-settings">
            <div className="caretaker-setting-item">
              <div className="caretaker-setting-info">
                <div className="caretaker-setting-title">Email Notifications</div>
                <div className="caretaker-setting-desc">Receive updates via email</div>
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
                <div className="caretaker-setting-title">Push Notifications</div>
                <div className="caretaker-setting-desc">Receive push notifications</div>
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
                <div className="caretaker-setting-title">SMS Notifications</div>
                <div className="caretaker-setting-desc">Receive text message alerts</div>
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
                <div className="caretaker-setting-title">Language Preference</div>
                <div className="caretaker-setting-desc">Choose your preferred language</div>
              </div>
              <LanguageSwitcher />
            </div>

            <div className="caretaker-setting-item">
              <div className="caretaker-setting-info">
                <div className="caretaker-setting-title">Two-Factor Authentication</div>
                <div className="caretaker-setting-desc">Add an extra layer of security</div>
                <div className="caretaker-setting-desc" style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>Coming Soon</div>
              </div>
              <div
                className="caretaker-toggle-switch caretaker-toggle-off"
                style={{ opacity: '0.5', cursor: 'not-allowed' }}
              >
                <div className="caretaker-toggle-slider"></div>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Quick Actions */}
        <ChartCard title="Quick Actions">
          <div className="quick-actions">
            <ActionCard
              to="/tenant/documents"
              icon={<Icon name="docs" alt="Documents" />}
              title={t('profile.documents')}
              description={t('profile.viewDocuments')}
            />
            <ActionCard
              to="/tenant/activity"
              icon={<Icon name="activityLog" alt="Activity Log" />}
              title={t('profile.activityLog')}
              description={t('profile.viewActivity')}
            />
          </div>
        </ChartCard>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default UserProfilePage;
