import { Link } from 'react-router-dom';

interface TopNavProps {
  showBackButton?: boolean;
  backLink?: string;
  showLogout?: boolean;
}

function TopNav({ showBackButton = false, backLink = '/', showLogout = false }: TopNavProps) {
  return (
    <div className="top-nav">
      <div className="nav-left">
        {showBackButton && (
          <Link to={backLink} className="back-btn">←</Link>
        )}
        <div className="logo">
          <div className="logo-icon">B</div>
          <span>Briconomy</span>
        </div>
      </div>
      {showLogout && (
        <Link to="/" className="logout-btn">Logout</Link>
      )}
    </div>
  );
}

export default TopNav;