import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { LanguageSwitcher, useLanguage } from '../contexts/LanguageContext.tsx';

interface TopNavProps {
  showBackButton?: boolean;
  backLink?: string;
  showLogout?: boolean;
}

function TopNav({ showBackButton = false, backLink: _backLink = '/', showLogout = false }: TopNavProps) {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); 
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="top-nav">
      <div className="nav-left">
        {showBackButton && (
          <button type="button" onClick={handleBack} className="back-btn">←</button>
        )}
        <div className="logo">
          <div className="logo-icon">B</div>
          <span>Briconomy</span>
        </div>
      </div>
      
      <div className="nav-right">
        <LanguageSwitcher />
        {showLogout && (
          <button type="button" onClick={handleLogout} className="logout-btn">{t('nav.logout')}</button>
        )}
      </div>
    </div>
  );
}

export default TopNav;