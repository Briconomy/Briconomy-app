import { useAuth } from '../contexts/AuthContext';

interface TopNavProps {
  showBackButton?: boolean;
  backLink?: string;
  showLogout?: boolean;
}

function TopNav({ showBackButton = false, backLink = '/', showLogout = false }: TopNavProps) {
  const { user } = useAuth();

  const getHomeLink = () => {
    if (!user) return '/';
    
    switch (user.userType) {
      case 'admin':
        return '/admin';
      case 'manager':
        return '/manager';
      case 'caretaker':
        return '/caretaker';
      case 'tenant':
        return '/tenant';
      default:
        return '/';
    }
  };

  const homeLink = getHomeLink();

  const navigateTo = (url: string) => {
    window.location.href = url;
  };

  return (
    <div className="top-nav">
      <div className="nav-left">
        {showBackButton && (
          <button onClick={() => navigateTo(backLink)} className="back-btn">←</button>
        )}
        <button onClick={() => navigateTo(homeLink)} className="logo">
          <div className="logo-icon">B</div>
          <span>Briconomy</span>
        </button>
      </div>
      {showLogout && (
        <button onClick={() => navigateTo('/')} className="logout-btn">Logout</button>
      )}
    </div>
  );
}

export default TopNav;
