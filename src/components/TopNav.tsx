import { useAuth } from '../contexts/AuthContext.tsx';

interface TopNavProps {
  showBackButton?: boolean;
  backLink?: string;
  showLogout?: boolean;
}

function TopNav({ showBackButton = false, backLink = '/', showLogout = false }: TopNavProps) {
  const { user } = useAuth();

  
  const homeLink = '/';

  const navigateTo = (url: string) => {
    globalThis.location.href = url;
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
        <button type="button" onClick={() => navigateTo('/')} className="logout-btn">Logout</button>
      )}
    </div>
  );
}

export default TopNav;