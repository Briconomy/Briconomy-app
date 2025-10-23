import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator.tsx';
import { authApi, propertiesApi } from '../services/api.ts';

function ProspectiveTenantRegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [properties, setProperties] = useState<Array<{ id: string; name: string }>>([]);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    profile: {
      emergencyContact: '',
      property: '',
      unitNumber: '',
      occupation: '',
      monthlyIncome: '',
      moveInDate: ''
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const propertyId = location.state?.propertyId;
  const propertyName = location.state?.propertyName;

  useEffect(() => {
    fetchProperties();
    if (propertyName) {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          property: propertyName
        }
      }));
    }
  }, [propertyName]);

  const fetchProperties = async () => {
    try {
      const data = await propertiesApi.getAll();
      setProperties(data);
    } catch (err) {
      console.error('Error fetching properties:', err);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    
    if (id.startsWith('profile.')) {
      const profileField = id.replace('profile.', '');
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          [profileField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [id]: value
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (!formData.profile.emergencyContact || !formData.profile.property || 
        !formData.profile.unitNumber || !formData.profile.moveInDate) {
      setError('Please fill in all tenant profile fields');
      setLoading(false);
      return;
    }
    
    try {
      // Find the property ID based on the selected property name
      const selectedProperty = properties.find(p => p.name === formData.profile.property);
      const actualPropertyId = selectedProperty ? selectedProperty.id : propertyId;
      
      const profileData = {
        emergencyContact: formData.profile.emergencyContact,
        property: formData.profile.property,
        unitNumber: formData.profile.unitNumber,
        occupation: formData.profile.occupation,
        monthlyIncome: formData.profile.monthlyIncome,
        moveInDate: new Date(formData.profile.moveInDate),
        leaseId: null
      };

      await authApi.registerPendingTenant({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: 'tenant',
        profile: profileData,
        status: 'pending',
        appliedPropertyId: actualPropertyId
      });
      
      navigate('/pending-approval', { 
        state: { 
          email: formData.email,
          property: formData.profile.property 
        } 
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create account. Email may already be in use.');
    }
    
    setLoading(false);
  };

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton backLink={propertyId ? `/property/${propertyId}` : '/browse-properties'} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Create Account</div>
          <div className="page-subtitle">Apply to become a tenant</div>
        </div>
        
        <div className="form-card">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="fullName">
                Full Name *
              </label>
              <input 
                type="text" 
                id="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">
                Email Address *
              </label>
              <input 
                type="email" 
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                required
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
                htmlFor="phone" 
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  fontSize: '14px' 
                }}
              >
                Phone Number *
              </label>
              <input 
                type="tel" 
                id="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                required
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
                htmlFor="profile.emergencyContact" 
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  fontSize: '14px' 
                }}
              >
                Emergency Contact *
              </label>
              <input 
                type="tel" 
                id="profile.emergencyContact"
                value={formData.profile.emergencyContact}
                onChange={handleInputChange}
                placeholder="Emergency contact number"
                required
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
                htmlFor="profile.occupation" 
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  fontSize: '14px' 
                }}
              >
                Occupation
              </label>
              <input 
                type="text" 
                id="profile.occupation"
                value={formData.profile.occupation}
                onChange={handleInputChange}
                placeholder="Your occupation"
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
                htmlFor="profile.monthlyIncome" 
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  fontSize: '14px' 
                }}
              >
                Monthly Income (ZAR)
              </label>
              <input 
                type="number" 
                id="profile.monthlyIncome"
                value={formData.profile.monthlyIncome}
                onChange={handleInputChange}
                placeholder="Your monthly income"
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
                htmlFor="profile.property" 
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  fontSize: '14px' 
                }}
              >
                Property *
              </label>
              <select 
                id="profile.property"
                value={formData.profile.property || ''}
                onChange={handleInputChange}
                required
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
              >
                <option value="">Select a property</option>
                {properties.map((prop) => (
                  <option key={prop.id} value={prop.name}>{prop.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label 
                htmlFor="profile.unitNumber" 
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  fontSize: '14px' 
                }}
              >
                Preferred Unit Number *
              </label>
              <input 
                type="text" 
                id="profile.unitNumber"
                value={formData.profile.unitNumber || ''}
                onChange={handleInputChange}
                placeholder="e.g., 2A, B1, etc."
                required
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
                htmlFor="profile.moveInDate" 
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  fontSize: '14px' 
                }}
              >
                Preferred Move-in Date *
              </label>
              <input 
                type="date" 
                id="profile.moveInDate"
                value={formData.profile.moveInDate}
                onChange={handleInputChange}
                required
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
                Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    paddingRight: '40px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: '#f8f9fa',
                    color: '#2c3e50',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
              <PasswordStrengthIndicator password={formData.password} />
            </div>
            
            <div style={{ marginBottom: '16px' }}>
              <label 
                htmlFor="confirmPassword" 
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  fontSize: '14px' 
                }}
              >
                Confirm Password *
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    paddingRight: '40px',
                    border: '2px solid #e9ecef',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: '#f8f9fa',
                    color: '#2c3e50',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
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
            
            <button 
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '10px',
                opacity: loading ? 0.7 : 1
              }}
              className="btn btn-primary"
            >
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </button>
            
            <button 
              type="button"
              onClick={() => navigate(propertyId ? `/property/${propertyId}` : '/browse-properties')}
              style={{
                width: '100%',
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '10px'
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#6c757d' }}>
            <p>Already have an account? <a href="/login" style={{ color: '#162F1B', fontWeight: '600', textDecoration: 'none' }}>Login here</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProspectiveTenantRegisterPage;
