import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import DocumentViewer from '../components/DocumentViewer.tsx';
import ActivityLog from '../components/ActivityLog.tsx';

function UserProfilePage() {
  console.log('UserProfilePage loading...');
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<'overview' | 'documents' | 'activity'>('overview');

  const navItems = [
    { path: '/tenant', label: t('nav.home'), active: false },
    { path: '/tenant/payments', label: t('nav.payments') },
    { path: '/tenant/requests', label: t('nav.requests') },
    { path: '/tenant/profile', label: t('nav.profile'), active: true }
  ];

  if (loading || !user) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout={true} showBackButton={true} />
        <div className="main-content">
          <div className="loading">{t('common.loading')}</div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }


  const leaseDaysRemaining = Math.ceil((new Date(user.leaseEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} showBackButton={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">{t('profile')}</div>
          <div className="page-subtitle">{t('subtitle')}</div>
        </div>
        
        <div className="profile-header">
          <div className="profile-avatar">
            {user.avatar}
          </div>
          <div className="profile-info">
            <h2>{user.fullName}</h2>
            <p className="profile-role">{user.userType}</p>
            <p className="profile-property">{user.property} - Unit {user.unit}</p>
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/tenant/profile/edit')}
          >
            {t('common.edit')}
          </button>
        </div>

        <div className="dashboard-grid">
          <StatCard value={user.unit} label={t('property.unit')} />
          <StatCard value={`R${user.rent.toLocaleString()}`} label={t('property.monthlyRent')} />
          <StatCard value={`${leaseDaysRemaining} ${t('property.days')}`} label={t('property.leaseRemaining')} />
          <StatCard value={t('status.active')} label={t('common.status')} />
        </div>

        <div className="profile-sections">
          <div className="profile-section">
            <h3>{t('personalInfo')}</h3>
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
                <span>{new Date(user.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>{t('leaseInfo')}</h3>
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
                <span>{new Date(user.leaseStart).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>{t('profile.leaseEnd')} </label>
                <span>{new Date(user.leaseEnd).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>{t('profile.monthlyRent')} </label>
                <span>R{user.rent.toLocaleString()}</span>
              </div>
              <div className="info-item">
                <label>{t('profile.daysRemaining')} </label>
                <span>{leaseDaysRemaining} days</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>{t('emergencyContact')}</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>{t('profile.name')} </label>
                <span>{user.emergencyContact.name}</span>
              </div>
              <div className="info-item">
                <label>{t('profile.relationship')} </label>
                <span>{user.emergencyContact.relationship}</span>
              </div>
              <div className="info-item">
                <label>{t('profile.phone')} </label>
                <span>{user.emergencyContact.phone}</span>
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
            onClick={() => setActiveSection('documents')}
            icon="D"
            title={t('profile.documents')}
            description={t('profile.viewDocuments')}
          />
          <ActionCard
            onClick={() => setActiveSection('activity')}
            icon="L"
            title={t('profile.activityLog')}
            description={t('profile.viewActivity')}
          />
        </div>
      </div>

      {/* Dynamic Sections */}

      {activeSection === 'documents' && (
        <div className="profile-section">
          <div className="section-header">
            <h3>{t('profile.documents')}</h3>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveSection('overview')}
            >
              {t('profile.backToOverview')}
            </button>
          </div>
          <DocumentViewer />
        </div>
      )}


      {activeSection === 'activity' && (
        <div className="profile-section">
          <div className="section-header">
            <h3>{t('profile.activityLog')}</h3>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveSection('overview')}
            >
              {t('profile.backToOverview')}
            </button>
          </div>
          <ActivityLog />
        </div>
      )}
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default UserProfilePage;
