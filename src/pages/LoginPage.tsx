import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };
  
  const handleLogin = async () => {
    setAuthError('');
    setSubmitting(true);
    
    if (!formData.email || !formData.password) {
      setAuthError('Please fill in both email and password');
      setSubmitting(false);
      return;
    }
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        const dashboards = {
          admin: '/admin',
          manager: '/manager',
          tenant: '/tenant',
          caretaker: '/caretaker'
        };
        navigate(dashboards[result.user?.userType as keyof typeof dashboards] || '/tenant');
      } else {
        setAuthError(result.message);
      }
  } catch (_error) {
      setAuthError('Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError('');
    setSubmitting(true);
    
    try {
      const result = await loginWithGoogle();
      
      if (!result.success) {
        setAuthError(result.message);
        setSubmitting(false);
      }
      // If successful, the user will be redirected to Google
    } catch (_error) {
      setAuthError('Google login failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      maxWidth: '390px',
      margin: '0 auto',
      background: '#ffffff',
      minHeight: '100vh',
      position: 'relative',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e9ecef',
        padding: '12px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '60px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <a 
            href="/" 
            style={{
              background: '#f8f9fa',
              border: '1px solid #e9ecef',
              color: '#495057',
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              textDecoration: 'none'
            }}
          >
            ←
          </a>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#2c3e50'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: '#162F1B',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px'
            }}>
              B
            </div>
            <span>Briconomy</span>
          </div>
        </div>
      </div>
      
      <div style={{ padding: '20px 16px' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '24px', 
            color: '#2c3e50', 
            fontSize: '20px' 
          }}>
            Sign In
          </h2>
          
          {authError && (
            <div style={{
              background: '#fee',
              color: '#c00',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {authError}
            </div>
          )}
          
          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="email" 
              style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '600', 
                color: '#2c3e50', 
                fontSize: '14px' 
              }}
            >
              Email Address
            </label>
            <input 
              type="email" 
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '16px',
                background: '#f8f9fa',
                color: '#2c3e50',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="password" 
              style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '600', 
                color: '#2c3e50', 
                fontSize: '14px' 
              }}
            >
              Password
            </label>
            <input 
              type="password" 
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '16px',
                background: '#f8f9fa',
                color: '#2c3e50',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <button 
            type="button"
            onClick={handleLogin}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: submitting ? 'not-allowed' : 'pointer',
              marginBottom: '10px',
              background: submitting ? '#ccc' : '#162F1B',
              color: 'white',
              textDecoration: 'none',
              display: 'inline-block',
              textAlign: 'center',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>
          
          <button 
            type="button"
            onClick={handleGoogleLogin}
            disabled={submitting}
            style={{
            width: '100%',
            padding: '12px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: submitting ? 'not-allowed' : 'pointer',
            marginBottom: '10px',
            background: '#4285f4',
            color: 'white',
            textDecoration: 'none',
            display: 'inline-block',
            textAlign: 'center',
            opacity: submitting ? 0.7 : 1
          }}>
            {submitting ? 'Signing In...' : 'Continue with Google SSO'}
          </button>
          
          <button type="button" style={{
            width: '100%',
            padding: '12px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '10px',
            background: '#6c757d',
            color: 'white',
            textDecoration: 'none',
            display: 'inline-block',
            textAlign: 'center'
          }}>
            Biometric Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;