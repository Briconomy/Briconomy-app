import { useNavigate, useLocation } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';

function PendingApprovalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const property = location.state?.property || '';

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton={false} />
      
      <div className="main-content">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: '#fff3cd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            fontSize: '48px'
          }}>
            ⏳
          </div>

          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#2c3e50',
            marginBottom: '12px'
          }}>
            Application Submitted!
          </h1>

          <p style={{
            fontSize: '18px',
            color: '#6c757d',
            marginBottom: '24px',
            maxWidth: '500px'
          }}>
            Waiting for Admin Approval
          </p>

          <div style={{
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '32px',
            maxWidth: '500px',
            width: '100%',
            border: '2px solid #e9ecef'
          }}>
            <p style={{
              fontSize: '16px',
              color: '#2c3e50',
              marginBottom: '16px',
              lineHeight: '1.6'
            }}>
              Thank you for your application! Your registration has been submitted and is pending review by our admin team.
            </p>
            
            {property && (
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
                textAlign: 'left'
              }}>
                <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Applied Property:</p>
                <p style={{ fontSize: '16px', color: '#162F1B', fontWeight: '600' }}>{property}</p>
              </div>
            )}
            
            {email && (
              <div style={{
                background: 'white',
                borderRadius: '8px',
                padding: '16px',
                textAlign: 'left'
              }}>
                <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Registered Email:</p>
                <p style={{ fontSize: '16px', color: '#162F1B', fontWeight: '600' }}>{email}</p>
              </div>
            )}
          </div>

          <div style={{
            background: '#fff3cd',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '32px',
            maxWidth: '500px',
            width: '100%',
            border: '1px solid #f39c12'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#856404',
              margin: 0,
              lineHeight: '1.6'
            }}>
              You will receive an email notification once your application has been reviewed. This usually takes 1-3 business days.
            </p>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            width: '100%',
            maxWidth: '400px'
          }}>
            <button 
              type="button"
              onClick={() => navigate('/')}
              style={{
                width: '100%',
                padding: '14px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                background: '#162F1B',
                color: 'white',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#0f2012';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#162F1B';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              Return to Home
            </button>

            <button 
              type="button"
              onClick={() => navigate('/browse-properties')}
              style={{
                width: '100%',
                padding: '14px',
                border: '2px solid #162F1B',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                background: 'white',
                color: '#162F1B',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'white';
              }}
            >
              Browse More Properties
            </button>
          </div>

          <div style={{ marginTop: '32px', fontSize: '14px', color: '#6c757d' }}>
            <p>Need help? <a href="mailto:support@briconomy.com" style={{ color: '#162F1B', fontWeight: '600', textDecoration: 'none' }}>Contact Support</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PendingApprovalPage;
