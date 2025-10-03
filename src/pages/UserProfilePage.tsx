import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';

function UserProfilePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { path: '/tenant', label: t('nav.home'), active: false },
    { path: '/tenant/payments', label: t('nav.payments') },
    { path: '/tenant/requests', label: t('nav.requests') },
    { path: '/tenant/profile', label: t('nav.profile'), active: true }
  ];

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="loading">{t('common.loading')}</div>
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

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">{t('nav.profile')}</div>
          <div className="page-subtitle">{t('profile.updateInfo')}</div>
        </div>
        
        <div className="profile-header">
          <div className="profile-avatar">
            {user.avatar || user.fullName?.substring(0, 2).toUpperCase() || 'T'}
          </div>
          <div className="profile-info">
            <h2>{user.fullName || 'Tenant'}</h2>
            <p className="profile-role">{user.userType}</p>
            <p className="profile-property">{user.property || 'N/A'} - Unit {user.unit || 'N/A'}</p>
          </div>
          <button 
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/tenant/profile/edit')}
          >
            {t('common.edit_user')}
          </button>
        </div>

        <div className="dashboard-grid">
          <StatCard value={user.unit || 'N/A'} label={t('property.unit')} />
          <StatCard value={`R${(user.rent || 0).toLocaleString()}`} label={t('property.monthlyRent')} />
          <StatCard value={`${leaseDaysRemaining} ${t('property.days')}`} label={t('property.leaseRemaining')} />
          <StatCard value={t('status.active')} label={t('common.status')} />
        </div>

        <div className="profile-sections">
          <div className="profile-section">
            <h3>{t('profile.personalInfo')}</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>{t('profile.fullName')} </label>
                <span>{user.fullName}</span>
              </div>
              <div className="info-item">
                <label>{t('profile.email')} </label>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <label>{t('profile.phone')} </label>
                <span>{user.phone}</span>
              </div>
              <div className="info-item">
                <label>{t('profile.memberSince')} </label>
                <span>{new Date(user.joinDate || new Date()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>{t('profile.leaseInfo')}</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>{t('profile.property')} </label>
                <span>{user.property}</span>
              </div>
              <div className="info-item">
                <label>{t('profile.unit')} </label>
                <span>{user.unit}</span>
              </div>
              <div className="info-item">
                <label>{t('profile.leaseStart')} </label>
                <span>{new Date(user.leaseStart || new Date()).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>{t('profile.leaseEnd')} </label>
                <span>{new Date(user.leaseEnd || new Date()).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>{t('profile.monthlyRent')} </label>
                <span>R{(user.rent || 0).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <label>{t('profile.daysRemaining')} </label>
                <span>{leaseDaysRemaining} days</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>{t('profile.emergencyContact')}</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>{t('profile.name')} </label>
                <span>{user.emergencyContact?.name || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>{t('profile.relationship')} </label>
                <span>{user.emergencyContact?.relationship || 'Not provided'}</span>
              </div>
              <div className="info-item">
                <label>{t('profile.phone')} </label>
                <span>{user.emergencyContact?.phone || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>{t('profile.accountSettings')}</h3>
            <div className="settings-grid">
              <div className="setting-item">
                <label>{t('profile.notifications')}</label>
                <div className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </div>
              </div>
              <div className="setting-item">
                <label>Email Notifications</label>
                <div className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </div>
              </div>
              <div className="setting-item">
                <label>SMS Notifications</label>
                <div className="toggle-switch">
                  <input type="checkbox" />
                  <span className="toggle-slider"></span>
                </div>
              </div>
              <div className="setting-item">
                <label>Two-Factor Authentication</label>
                <div className="toggle-switch">
                  <input type="checkbox" />
                  <span className="toggle-slider"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <ActionCard
            to="/tenant/documents"
            icon="D"
            title={t('profile.documents')}
            description={t('profile.viewDocuments')}
          />
          <ActionCard
            to="/tenant/activity"
            icon="L"
            title={t('profile.activityLog')}
            description={t('profile.viewActivity')}
          />
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default UserProfilePage;
