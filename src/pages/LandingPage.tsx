import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import Icon from '../components/Icon.tsx';

function LandingPage() {
  const { isAuthenticated, user, loading } = useAuth();
  const navigate = useNavigate();

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
    <div className="landing-container">
      <div className="landing-content">
        <div className="landing-logo">
          <Icon name="logo" alt="Briconomy" size={120} />
        </div>

        <h1 className="landing-title">
          Briconomy
        </h1>

        <p className="landing-subtitle">
          Professional Property Management System
        </p>

        <div className="landing-sections">
          <div className="landing-card">
            <h3 className="landing-card-title">Features</h3>
            <ul className="landing-features-list">
              <li>Real-time Analytics</li>
              <li>Property Management</li>
              <li>Payment Tracking</li>
              <li>Maintenance Tasks</li>
              <li>Mobile Optimized</li>
            </ul>
          </div>

          <a href="/login" className="btn btn-primary landing-btn">
            Sign In
          </a>
        </div>

        <div className="landing-card">
          <h3 className="landing-card-title">
            For Prospective Tenants
          </h3>
          <p className="landing-card-text">
            Browse available properties, view detailed information, and apply
            for your next home - all without creating an account until you're
            ready to apply!
          </p>
          <p className="landing-card-note">
            No Login Required
          </p>

          <a href="/browse-properties" className="btn btn-secondary landing-browse-btn">
            Browse Properties
          </a>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
