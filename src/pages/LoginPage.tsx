import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';

function LoginPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userType = searchParams.get('type') || 'tenant';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    switch (userType) {
      case 'admin':
        navigate('/admin');
        break;
      case 'manager':
        navigate('/manager');
        break;
      case 'caretaker':
        navigate('/caretaker');
        break;
      case 'tenant':
        navigate('/tenant');
        break;
      default:
        navigate('/tenant');
    }
  };

  const getUserTitle = () => {
    switch (userType) {
      case 'admin': return 'System Admin Login';
      case 'manager': return 'Property Manager Login';
      case 'caretaker': return 'Caretaker Login';
      case 'tenant': return 'Tenant Login';
      default: return 'Login';
    }
  };

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">{getUserTitle()}</div>
          <div className="page-subtitle">Enter your credentials</div>
        </div>
        
        <div className="login-container">
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
              />
            </div>
            
            <button type="submit" className="btn btn-primary">
              Sign In
            </button>
            
            <button type="button" className="btn btn-google">
              Sign in with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;