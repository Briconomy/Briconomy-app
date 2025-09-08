import React from 'react';

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
            background: 'white',
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
          B
        </div>

        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '10px',
          }}
        >
          Briconomy
        </h1>

        <p
          style={{
            fontSize: '16px',
            opacity: '0.9',
            marginBottom: '40px',
            lineHeight: '1.5',
          }}
        >
          Professional Property Management System
        </p>

        <div style={{ marginBottom: '30px' }}>

          <div
            style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px',
            }}
          >
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>Features</h3>
            <ul
              style={{
                listStyle: 'none',
                padding: '0',
                fontSize: '14px',
                opacity: '0.9',
              }}
            >
              <li style={{ marginBottom: '8px' }}>Real-time Analytics</li>
              <li style={{ marginBottom: '8px' }}>Property Management</li>
              <li style={{ marginBottom: '8px' }}>Payment Tracking</li>
              <li style={{ marginBottom: '8px' }}>Maintenance Tasks</li>
              <li style={{ marginBottom: '8px' }}>Mobile Optimized</li>
            </ul>
          </div>

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

        <a
          href="/create-account"
          style={{
            display: 'block',
            width: '100%',
            padding: '16px',
            background: 'rgba(255,255,255,0.1)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '12px',
            border: '2px solid rgba(255,255,255,0.3)',
            transition: 'all 0.3s ease',
            textAlign: 'center',
            boxSizing: 'border-box',
          }}
        >
          Create Account
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
        </div>
    </div>
  );
}

export default LandingPage;
