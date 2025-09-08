import { useAuth } from '../contexts/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

interface TopNavProps {
  showBackButton?: boolean;
  backLink?: string;
  showLogout?: boolean;
}

function TopNav({ showBackButton = false, backLink = '/', showLogout = false }: TopNavProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const homeLink = '/';

  const navigateTo = (url: string) => {
    navigate(url);
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
          <button type="button" onClick={() => navigateTo(backLink)} className="back-btn">←</button>
        )}
        <button type="button" onClick={() => navigateTo(homeLink)} className="logo">
          <div className="logo-icon">B</div>
          <span>Briconomy</span>
        </button>
      </div>
      {showLogout && (
        <button type="button" onClick={handleLogout} className="logout-btn">Logout</button>
      )}
    </div>
  );
}

export default TopNav;