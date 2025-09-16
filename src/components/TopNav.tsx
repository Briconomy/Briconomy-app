import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

interface TopNavProps {
  showBackButton?: boolean;
  backLink?: string;
  showLogout?: boolean;
}

function TopNav({ showBackButton = false, backLink = '/', showLogout = false }: TopNavProps) {
  const { user, logout } = useAuth();
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
      {showLogout && (
        <button type="button" onClick={handleLogout} className="logout-btn">Logout</button>
      )}
    </div>
  );
}

export default TopNav;