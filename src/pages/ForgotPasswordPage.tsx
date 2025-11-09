import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext.tsx';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!email) {
      setError(t('forgotpassword.email_required'));
      setSubmitting(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t('forgotpassword.email_invalid'));
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8816/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        console.log('Password reset requested for:', email);
        setSuccess(true);
      } else {
        setError(data.message || t('forgotpassword.send_failed'));
      }
    } catch (_err) {
      setError(t('forgotpassword.send_failed'));
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
      {/* Header */}
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
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="btn btn-secondary"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}
          >
            ←
          </button>
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

      {/* Content */}
      <div style={{ padding: '20px 16px' }}>
        {!success ? (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ 
              textAlign: 'center', 
              marginBottom: '12px', 
              color: '#2c3e50', 
              fontSize: '20px' 
            }}>
              {t('auth.forgot_password') || 'Forgot Password?'}
            </h2>
            
            <p style={{
              textAlign: 'center',
              color: '#6c757d',
              fontSize: '14px',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              {t('forgotpassword.instructions')}
            </p>

            {error && (
              <div style={{
                background: '#fee',
                color: '#c00',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
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
                  {t('common.email_address') || 'Email Address'}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('forgotpassword.email_placeholder')}
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
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {submitting ? t('forgotpassword.sending') : t('forgotpassword.send_link')}
              </button>

              <div style={{
                textAlign: 'center',
                marginTop: '16px'
              }}>
                <a 
                  href="/login" 
                  style={{
                    color: '#162F1B',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  {t('forgotpassword.back_to_login')}
                </a>
              </div>
            </form>
          </div>
        ) : (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: '#d4edda',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: '30px'
            }}>
              ✓
            </div>
            
            <h2 style={{
              marginBottom: '12px',
              color: '#2c3e50',
              fontSize: '20px'
            }}>
              {t('forgotpassword.check_email')}
            </h2>
            
            <p style={{
              color: '#6c757d',
              fontSize: '14px',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              {t('forgotpassword.email_sent').replace('[email]', email)}
            </p>

            <p style={{
              color: '#6c757d',
              fontSize: '13px',
              marginBottom: '24px'
            }}>
              {t('forgotpassword.no_email')}
            </p>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              {t('forgotpassword.return_login')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
