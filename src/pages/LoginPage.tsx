import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import Icon from '../components/Icon.tsx';
import { GoogleLogin } from '@react-oauth/google';
import { biometricService } from '../services/biometric.ts';

function LoginPage() {
  const navigate = useNavigate();
  const { login, googleLogin, isAuthenticated, user, loading } = useAuth();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricSubmitting, setBiometricSubmitting] = useState(false);

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

  useEffect(() => {
    // Check biometric support
    setBiometricSupported(biometricService.isSupported());

    const rememberedEmail = localStorage.getItem('briconomy_remembered_email');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);
  
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
      setAuthError(t('auth.validation_both_required'));
      setSubmitting(false);
      return;
    }
    
    try {
      const result = await login(formData.email, formData.password, rememberMe);
      
      if (result.success) {
        if (rememberMe) {
          localStorage.setItem('briconomy_remembered_email', formData.email);
        } else {
          localStorage.removeItem('briconomy_remembered_email');
        }

        const userName = result.user?.fullName || 'User';

        if (result.restricted && result.redirectTo) {
          showToast(t('auth.app_not_approved').replace('{name}', userName), 'info', 5000);
          navigate(result.redirectTo);
        } else {
          showToast(`${t('auth.welcome_back')}, ${userName}`, 'success', 3000);
          const dashboards = {
            admin: '/admin',
            manager: '/manager',
            tenant: '/tenant',
            caretaker: '/caretaker'
          };
          navigate(dashboards[result.user?.userType as keyof typeof dashboards] || '/tenant');
        }
      } else {
        setAuthError(result.message);
      }
  } catch (_error) {
      setAuthError(t('auth.login_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometricSupported) {
      setAuthError('Biometric authentication is not supported on this device');
      return;
    }

    if (!formData.email) {
      setAuthError('Please enter your email address first');
      return;
    }

    setAuthError('');
    setBiometricSubmitting(true);

    try {
      const result = await biometricService.authenticate(formData.email);

      if (result.success && result.user) {
        // Store user in context using the login result
        const userWithId = {
          id: result.user.id,
          email: result.user.email,
          fullName: result.user.fullName,
          userType: result.user.userType
        };

        // Store in localStorage/sessionStorage like regular login
        if (rememberMe) {
          localStorage.setItem('briconomy_user', JSON.stringify(userWithId));
          localStorage.setItem('briconomy_token', result.token || 'mock-token');
        } else {
          sessionStorage.setItem('briconomy_user', JSON.stringify(userWithId));
          sessionStorage.setItem('briconomy_token', result.token || 'mock-token');
        }

        const userName = result.user.fullName || 'User';
        showToast(`${t('auth.welcome_back')}, ${userName}`, 'success', 3000);

        const dashboards = {
          admin: '/admin',
          manager: '/manager',
          tenant: '/tenant',
          caretaker: '/caretaker'
        };
        navigate(dashboards[result.user.userType as keyof typeof dashboards] || '/tenant');
      } else {
        setAuthError('Biometric authentication failed');
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      setAuthError(error instanceof Error ? error.message : 'Biometric authentication failed');
    } finally {
      setBiometricSubmitting(false);
    }
  };

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
    <div style={{
      maxWidth: '390px',
      margin: '0 auto',
      background: '#ffffff',
      minHeight: '100vh',
      position: 'relative',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e9ecef',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: '60px'
      }}>
        <a
          href="/"
          style={{
            background: '#f8f9fa',
            border: '1px solid #e9ecef',
            color: '#495057',
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            textDecoration: 'none',
            flexShrink: 0
          }}
        >
          ←
        </a>
        <Icon name="logo" alt="Briconomy" size={32} />
        <span style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#2c3e50'
        }}>
          Briconomy
        </span>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 16px' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '32px 24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #e9ecef'
        }}>
          <h2 style={{
            textAlign: 'center',
            marginBottom: '32px',
            marginTop: '0',
            color: '#2c3e50',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            {t('auth.sign_in')}
          </h2>

          {authError && (
            <div className="error-message" style={{ marginBottom: '16px' }}>
              {authError}
            </div>
          )}

          <form onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}>
            <div className="form-group">
              <label htmlFor="email">
                {t('common.email_address')}
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t('common.enter_email')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">
                {t('auth.password')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder={t('common.enter_password')}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6c757d',
                    fontSize: '18px'
                  }}
                  aria-label={showPassword ? t('common.hide_password') : t('common.show_password')}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6c757d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="remember-me-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                {t('auth.remember_me') || 'Remember me'}
              </label>
              <a href="/forgot-password" className="forgot-password-link">
                {t('auth.forgot_password') || 'Forgot password?'}
              </a>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-block"
            >
              {submitting ? t('common.signing_in') : t('auth.sign_in')}
            </button>
          </form>

          <div style={{ marginTop: '16px' }}>
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                setGoogleSubmitting(true);
                setAuthError('');
                try {
                  const result = await googleLogin(credentialResponse);
                  if (result.success) {
                    const userName = result.user?.fullName || 'User';
                    showToast(`Welcome back, ${userName}`, 'success', 3000);

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
                  setAuthError('Google login failed. Please try again.');
                } finally {
                  setGoogleSubmitting(false);
                }
              }}
              onError={() => {
                setAuthError('Google login failed. Please try again.');
              }}
              useOneTap={false}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              width="100%"
            />
            {googleSubmitting && (
              <div style={{
                textAlign: 'center',
                marginTop: '10px',
                color: '#4285f4',
                fontSize: '14px'
              }}>
                {t('auth.google_signing_in')}
              </div>
            )}
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-block2"
            style={{
              marginTop: '12px',
              opacity: biometricSupported && !biometricSubmitting ? '1' : '0.6',
              cursor: biometricSupported && !biometricSubmitting ? 'pointer' : 'not-allowed'
            }}
            onClick={biometricSupported && !biometricSubmitting ? handleBiometricLogin : undefined}
            disabled={!biometricSupported || biometricSubmitting}
          >
            {biometricSubmitting ? t('common.processing') || 'Processing...' : t('auth.biometric_login')}
            {!biometricSupported && ' (Not supported)'}
          </button>
        </div>
      </div>
    </div>
    
  );
}

export default LoginPage;