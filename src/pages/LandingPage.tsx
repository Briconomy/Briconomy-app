import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import Icon from '../components/Icon.tsx';

function LandingPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const dashboards = {
        admin: '/admin',
        manager: '/manager',
        tenant: '/tenant',
        caretaker: '/caretaker'
      };
      navigate(dashboards[user.userType] || '/tenant', { replace: true });
    }
  }, [isAuthenticated, user, loading, navigate]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="app-container mobile-only">
      <div className="landing-container">
        <div className="landing-content">
          <div className="landing-logo">
            <Icon name="logo" alt="Briconomy" size={120} />
          </div>

          <h1 className="landing-title">
            {t('landing.title')}
          </h1>

          <p className="landing-subtitle">
            {t('landing.subtitle')}
          </p>

          <div className="landing-sections">
            <div className="landing-card">
              <h3 className="landing-card-title">{t('landing.features')}</h3>
              <ul className="landing-features-list">
                <li>{t('landing.feature_analytics')}</li>
                <li>{t('landing.feature_properties')}</li>
                <li>{t('landing.feature_payments')}</li>
                <li>{t('landing.feature_maintenance')}</li>
                <li>{t('landing.feature_mobile')}</li>
              </ul>
            </div>

            <a href="/login" className="btn btn-primary landing-btn">
              {t('landing.sign_in')}
            </a>
          </div>

          <div className="landing-card">
            <h3 className="landing-card-title">
              {t('landing.tenant_section')}
            </h3>
            <p className="landing-card-text">
              {t('landing.tenant_description')}
            </p>
            <p className="landing-card-note">
              {t('landing.no_login_required')}
            </p>

            <a href="/browse-properties" className="btn btn-secondary landing-browse-btn">
              {t('landing.browse_properties')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
