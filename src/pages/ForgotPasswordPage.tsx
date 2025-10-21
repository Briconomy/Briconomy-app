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
      setError('Please enter your email address');
      setSubmitting(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
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
        setError(data.message || 'Failed to send reset link. Please try again.');
      }
    } catch (_err) {
      setError('Failed to send reset link. Please try again.');
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
              Enter your email address and we'll send you a link to reset your password.
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
                  placeholder="Enter your email address"
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
                style={{
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  background: submitting ? '#ccc' : '#162F1B',
                  color: 'white',
                  opacity: submitting ? 0.7 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {submitting ? 'Sending...' : 'Send Reset Link'}
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
                  ← Back to Login
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
              Check Your Email
            </h2>
            
            <p style={{
              color: '#6c757d',
              fontSize: '14px',
              marginBottom: '24px',
              lineHeight: '1.5'
            }}>
              We've sent a password reset link to <strong>{email}</strong>. 
              Please check your inbox and follow the instructions.
            </p>

            <p style={{
              color: '#6c757d',
              fontSize: '13px',
              marginBottom: '24px'
            }}>
              Didn't receive the email? Check your spam folder or{' '}
              <button
                type="button"
                onClick={() => setSuccess(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#162F1B',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '13px',
                  fontWeight: '500'
                }}
              >
                try again
              </button>
            </p>

            <button
              type="button" 
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                background: '#162F1B',
                color: 'white'
              }}
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
