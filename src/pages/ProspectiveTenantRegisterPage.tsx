import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator.tsx';
import { authApi, propertiesApi } from '../services/api.ts';

function ProspectiveTenantRegisterPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [properties, setProperties] = useState<Array<{ id: string; name: string }>>([]);
  const [availableUnits, setAvailableUnits] = useState<Array<{ id: string; unitNumber: string; rent: number }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedPropertyName, setSelectedPropertyName] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    profile: {
      emergencyContact: '',
      occupation: '',
      monthlyIncome: '',
      moveInDate: ''
    }
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const data = await propertiesApi.getAll();
      setProperties(data);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setError('Failed to load properties');
    }
  };

  const fetchAvailableUnits = async (propertyId: string) => {
    try {
      const response = await fetch(`http://localhost:8816/api/units/available/${propertyId}`);
      if (!response.ok) throw new Error('Failed to fetch units');
      const units = await response.json();
      setAvailableUnits(units);
    } catch (err) {
      console.error('Error fetching available units:', err);
      setError('Failed to load available units');
      setAvailableUnits([]);
    }
  };

  const handlePropertySelect = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setSelectedPropertyId(propertyId);
      setSelectedPropertyName(property.name);
      setSelectedUnitId('');
      setAvailableUnits([]);
      fetchAvailableUnits(propertyId);
    }
  };

  const handleUnitSelect = (unitId: string) => {
    setSelectedUnitId(unitId);
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

  const validateStep1 = () => {
    if (!selectedPropertyId) {
      setError('Please select a property');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!selectedUnitId) {
      setError('Please select a unit');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!formData.profile.emergencyContact || !formData.profile.moveInDate) {
      setError('Please fill in all required profile fields');
      return false;
    }

    return true;
  };

  const handleNextStep = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError('');
    if (step > 1) setStep(step - 1);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateStep3()) return;

    setLoading(true);

    try {
      const profileData = {
        emergencyContact: formData.profile.emergencyContact,
        property: selectedPropertyName,
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
        appliedPropertyId: selectedPropertyId,
        propertyId: selectedPropertyId,
        unitId: selectedUnitId
      });

      navigate('/pending-approval', {
        state: {
          email: formData.email,
          property: selectedPropertyName
        }
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create account. Email may already be in use.');
    }

    setLoading(false);
  };

  const getStepTitle = () => {
    switch(step) {
      case 1: return 'Select Property';
      case 2: return 'Select Unit';
      case 3: return 'Complete Profile';
      default: return 'Create Account';
    }
  };

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton backLink="/browse-properties" />

      <div className="main-content">
        <div className="page-header">
          <div className="page-title">{getStepTitle()}</div>
          <div className="page-subtitle">Step {step} of 3</div>
        </div>

        <div className="form-card">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {step === 1 && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '12px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  fontSize: '14px'
                }}>
                  Available Properties
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {properties.length === 0 ? (
                    <p style={{ color: '#6c757d', fontSize: '14px' }}>No properties available</p>
                  ) : (
                    properties.map(prop => (
                      <div
                        key={prop.id}
                        onClick={() => handlePropertySelect(prop.id)}
                        style={{
                          padding: '12px 14px',
                          border: selectedPropertyId === prop.id ? '2px solid #162F1B' : '2px solid #e9ecef',
                          borderRadius: '8px',
                          background: selectedPropertyId === prop.id ? '#f0f7f4' : '#f8f9fa',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontSize: '14px',
                          fontWeight: '500',
                          color: selectedPropertyId === prop.id ? '#162F1B' : '#2c3e50'
                        }}
                      >
                        {prop.name}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div style={{ marginBottom: '16px', padding: '12px', background: '#f0f7f4', borderRadius: '8px' }}>
                <p style={{ margin: '0', color: '#162F1B', fontWeight: '500', fontSize: '14px' }}>
                  Property: {selectedPropertyName}
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '12px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  fontSize: '14px'
                }}>
                  Available Units
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {availableUnits.length === 0 ? (
                    <p style={{ color: '#6c757d', fontSize: '14px' }}>No available units in this property</p>
                  ) : (
                    availableUnits.map(unit => (
                      <div
                        key={unit.id}
                        onClick={() => handleUnitSelect(unit.id)}
                        style={{
                          padding: '12px 14px',
                          border: selectedUnitId === unit.id ? '2px solid #162F1B' : '2px solid #e9ecef',
                          borderRadius: '8px',
                          background: selectedUnitId === unit.id ? '#f0f7f4' : '#f8f9fa',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ fontWeight: '500', color: selectedUnitId === unit.id ? '#162F1B' : '#2c3e50' }}>
                          Unit {unit.unitNumber}
                        </span>
                        <span style={{ fontSize: '13px', color: '#6c757d' }}>
                          R{unit.rent}/mo
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
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
                  marginTop: '10px',
                  marginBottom: '10px',
                  opacity: loading ? 0.7 : 1
                }}
                className="btn btn-primary"
              >
                {loading ? 'Submitting Application...' : 'Submit Application'}
              </button>

              <button
                type="button"
                onClick={handlePrevStep}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: '25px'
                }}
                className="btn btn-secondary"
              >
                Back
              </button>
            </form>
          )}

          {step < 3 && (
            <div style={{ display: 'flex', gap: '10px' }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  className="btn btn-secondary"
                >
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={handleNextStep}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                className="btn btn-primary"
              >
                Next
              </button>

              <button
                type="button"
                onClick={() => navigate('/browse-properties')}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginBottom: step === 1 ? '0' : '0'
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          )}

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#6c757d' }}>
            <p>Already have an account? <a href="/login" style={{ color: '#162F1B', fontWeight: '600', textDecoration: 'none' }}>Login here</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProspectiveTenantRegisterPage;
