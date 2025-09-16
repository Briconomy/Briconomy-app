import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { handleGoogleCallback } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing Google authentication...');

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        setStatus('error');
        setMessage(`Authentication error: ${error}`);
        return;
      }

      if (!code) {
        setStatus('error');
        setMessage('No authorization code received from Google');
        return;
      }

      try {
        const result = await handleGoogleCallback(code, state || undefined);

        if (result.success && result.user) {
          setStatus('success');
          setMessage('Authentication successful! Redirecting...');
          
          // Redirect based on user type
          const dashboards = {
            admin: '/admin',
            manager: '/manager',
            tenant: '/tenant',
            caretaker: '/caretaker'
          };
          
          const userType = result.user.userType as keyof typeof dashboards;
          const redirectPath = dashboards[userType] || '/tenant';
          
          setTimeout(() => {
            navigate(redirectPath);
          }, 2000);
        } else {
          setStatus('error');
          setMessage(result.message || 'Authentication failed');
        }
      } catch (error) {
        console.error('Google callback error:', error);
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
      }
    };

    processCallback();
  }, [searchParams, handleGoogleCallback, navigate]);

  const handleRetryLogin = () => {
    navigate('/login');
  };

  return (
    <div style={{
      maxWidth: '390px',
      margin: '0 auto',
      background: '#ffffff',
      minHeight: '100vh',
      position: 'relative',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '20px'
      }}>
        {status === 'loading' && (
          <>
            <div style={{
              width: '50px',
              height: '50px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #4285f4',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px'
            }}></div>
            <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>Processing...</h2>
            <p style={{ color: '#666', fontSize: '16px' }}>{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div style={{
              width: '50px',
              height: '50px',
              backgroundColor: '#28a745',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'white',
              fontSize: '24px'
            }}>✓</div>
            <h2 style={{ color: '#28a745', marginBottom: '10px' }}>Success!</h2>
            <p style={{ color: '#666', fontSize: '16px' }}>{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div style={{
              width: '50px',
              height: '50px',
              backgroundColor: '#dc3545',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              color: 'white',
              fontSize: '24px'
            }}>✗</div>
            <h2 style={{ color: '#dc3545', marginBottom: '10px' }}>Authentication Failed</h2>
            <p style={{ color: '#666', fontSize: '16px', marginBottom: '20px' }}>{message}</p>
            <button
              type="button"
              onClick={handleRetryLogin}
              style={{
                padding: '12px 24px',
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </>
        )}
      </div>
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

export default GoogleCallbackPage;