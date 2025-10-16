import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import TopNav from '../components/TopNav.tsx';
import Icon from '../components/Icon.tsx';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load remembered email on component mount
  useState(() => {
    const rememberedEmail = localStorage.getItem('briconomy_remembered_email');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  });
  
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
        // Handle remember me functionality
        if (rememberMe) {
          localStorage.setItem('briconomy_remembered_email', formData.email);
        } else {
          localStorage.removeItem('briconomy_remembered_email');
        }
        
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
              background: 'transparent',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '16px'
            }}>
              <Icon name="logo" alt="Briconomy" size={28} />
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
            {t('auth.sign_in')}
          </h2>
          
          {authError && (
            <div className="error-message">
              {authError}
            </div>
          )}
          
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
            <input 
              type="password" 
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder={t('common.enter_password')}
            />
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
            type="button"
            onClick={handleLogin}
            disabled={submitting}
            className="btn btn-primary btn-block"
          >
            {submitting ? t('common.signing_in') : t('auth.sign_in')}
          </button>
          
          <button 
            type="button" 
            className="btn btn-google btn-block"
          >
            Continue with Google SSO
          </button>
          
          <button 
            type="button" 
            className="btn btn-secondary btn-block"
          >
            Biometric Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;