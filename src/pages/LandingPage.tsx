<<<<<<< HEAD
function LandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-content">
        <div className="landing-logo">
          B
=======
import React from 'react';
import Icon from '../components/Icon.tsx';

function LandingPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #162F1B 0%, #2D5A31 100%)',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '400px',
          margin: '0 auto',
          padding: '40px 20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            background: 'transparent',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 30px',
            fontSize: '36px',
            fontWeight: 'bold',
            color: '#162F1B',
          }}
        >
          <Icon name="logo" alt="Briconomy" size={60} />
>>>>>>> 6a81be2 (caretaker, login and landingpage icon functionality)
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

<<<<<<< HEAD
          <a href="/login" className="btn btn-primary landing-btn">
            Sign In
          </a>
=======
<a
          href="/login"
          style={{
            display: 'block',
            width: '100%',
            padding: '16px',
            background: 'white',
            color: '#162F1B',
            textDecoration: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '12px',
            transition: 'all 0.3s ease',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          Sign In
        </a>
      </div>

      <div
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px',
            }}
          >
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>
              For Prospective Tenants
            </h3>
            <p
              style={{
                fontSize: '14px',
                opacity: '0.9',
                marginBottom: '15px',
              }}
            >
              Browse available properties, view detailed information, and apply
              for your next home - all without creating an account until you're
              ready to apply!
            </p>

            <a
              href="/browse-properties"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                border: '1px solid rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease',
              }}
            >
              Browse Properties (No Login Required)
            </a>
          </div>
>>>>>>> 6a81be2 (caretaker, login and landingpage icon functionality)
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

          <a href="/browse-properties" className="btn btn-secondary landing-browse-btn">
            Browse Properties (No Login Required)
          </a>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
