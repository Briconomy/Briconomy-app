import Icon from '../components/Icon.tsx';

function LandingPage() {
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

        <div className="landing-card" style={{ marginTop: '32px', borderTop: '2px solid #3498db', paddingTop: '24px' }}>
          <h3 className="landing-card-title" style={{ color: '#3498db' }}>
            Want to Join Briconomy?
          </h3>
          <p className="landing-card-text">
            Are you a property owner or manager looking to streamline your property management? 
            Become a manager on Briconomy and take advantage of our powerful property management platform.
          </p>
          <p className="landing-card-text" style={{ marginTop: '12px', fontSize: '16px', fontWeight: '500' }}>
            Contact us at: <a href="mailto:info@briconomy.com" style={{ color: '#3498db', textDecoration: 'none', fontWeight: '600' }}>info@briconomy.com</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
