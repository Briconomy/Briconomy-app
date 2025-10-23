import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/api.ts';
import TopNav from '../components/TopNav.tsx';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator.tsx';

function AdminAddUserPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    userType: 'tenant',
    password: '',
    confirmPassword: '',
    profile: {
      department: '',
      employeeId: '',
      joinDate: '',
      emergencyContact: '',
      property: '',
      unitNumber: '',
      moveInDate: '',
      skills: [] as string[],
      assignedProperty: '',
      managedProperties: [] as string[]
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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

  const handleSkillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const skill = e.target.value;
    const skills = formData.profile.skills.includes(skill)
      ? formData.profile.skills.filter(s => s !== skill)
      : [...formData.profile.skills, skill];
    
    setFormData({
      ...formData,
      profile: {
        ...formData.profile,
        skills
      }
    });
  };
  
const handleCreateUser = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    if (!formData.fullName || !formData.email || !formData.phone || !formData.userType || !formData.password) {
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

    const profileData: Record<string, unknown> = {};
    
    if (formData.userType === 'admin') {
      if (!formData.profile.department || !formData.profile.employeeId || !formData.profile.joinDate) {
        setError('Please fill in all admin profile fields');
        setLoading(false);
        return;
      }
      profileData.department = formData.profile.department;
      profileData.employeeId = formData.profile.employeeId;
      profileData.joinDate = new Date(formData.profile.joinDate);
    }
    
    if (formData.userType === 'manager') {
      if (!formData.profile.department || !formData.profile.employeeId || !formData.profile.joinDate) {
        setError('Please fill in all manager profile fields');
        setLoading(false);
        return;
      }
      profileData.department = formData.profile.department;
      profileData.employeeId = formData.profile.employeeId;
      profileData.joinDate = new Date(formData.profile.joinDate);
      profileData.managedProperties = formData.profile.managedProperties;
    }
    
    if (formData.userType === 'caretaker') {
      if (!formData.profile.department || !formData.profile.employeeId || !formData.profile.joinDate || formData.profile.skills.length === 0) {
        setError('Please fill in all caretaker profile fields and select at least one skill');
        setLoading(false);
        return;
      }
      profileData.department = formData.profile.department;
      profileData.employeeId = formData.profile.employeeId;
      profileData.joinDate = new Date(formData.profile.joinDate);
      profileData.skills = formData.profile.skills;
      profileData.assignedProperty = formData.profile.assignedProperty || null;
    }
    
    if (formData.userType === 'tenant') {
      if (!formData.profile.emergencyContact || !formData.profile.property || !formData.profile.unitNumber || !formData.profile.moveInDate) {
        setError('Please fill in all tenant profile fields');
        setLoading(false);
        return;
      }
      profileData.emergencyContact = formData.profile.emergencyContact;
      profileData.property = formData.profile.property;
      profileData.unitNumber = formData.profile.unitNumber;
      profileData.moveInDate = new Date(formData.profile.moveInDate);
      profileData.leaseId = null;
    }
    
    try {
      await adminApi.createUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        userType: formData.userType,
        password: formData.password,
        profile: profileData
      });
      
      setSuccess('User created successfully! Redirecting to users page...');
      setTimeout(() => navigate('/admin/users'), 2000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create user');
    }
    
    setLoading(false);
  };

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton showLogout />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Add New User</div>
          <div className="page-subtitle">Create a new user account</div>
        </div>
        
        <div className="form-card">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          {success && (
            <div className="success-message">
              {success}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="fullName">
              Full Name
            </label>
            <input 
              type="text" 
              id="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Please enter full name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">
              Email Address
            </label>
            <input 
              type="email" 
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Please enter email address"
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
              Phone Number
            </label>
            <input 
              type="tel" 
              id="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Please enter phone number"
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
              htmlFor="userType" 
              style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '600', 
                color: '#2c3e50', 
                fontSize: '14px' 
              }}
            >
              User Type
            </label>
            <select 
              id="userType"
              value={formData.userType}
              onChange={handleInputChange}
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
              <option value="tenant">Tenant</option>
              <option value="manager">Manager</option>
              <option value="caretaker">Caretaker</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {(formData.userType === 'admin' || formData.userType === 'manager' || formData.userType === 'caretaker') && (
<div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="profile.department" 
              style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '600', 
                color: '#2c3e50', 
                fontSize: '14px' 
              }}
            >
              Department
            </label>
            <input 
              type="text" 
              id="profile.department"
              value={formData.profile.department}
              onChange={handleInputChange}
              placeholder="Please enter department"
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
          )}

          {(formData.userType === 'admin' || formData.userType === 'manager' || formData.userType === 'caretaker') && (
<div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="profile.employeeId" 
              style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '600', 
                color: '#2c3e50', 
                fontSize: '14px' 
              }}
            >
              Employee ID
            </label>
            <input 
              type="text" 
              id="profile.employeeId"
              value={formData.profile.employeeId}
              onChange={handleInputChange}
              placeholder="Please enter employee ID"
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
          )}

          {(formData.userType === 'admin' || formData.userType === 'manager' || formData.userType === 'caretaker') && (
            <div style={{ marginBottom: '16px' }}>
              <label 
                htmlFor="profile.joinDate" 
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  fontSize: '14px' 
                }}
              >
                Join Date
              </label>
              <input 
                type="date" 
                id="profile.joinDate"
                value={formData.profile.joinDate}
                onChange={handleInputChange}
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
          )}

          {formData.userType === 'tenant' && (
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
              Emergency Contact
            </label>
            <input 
              type="tel" 
              id="profile.emergencyContact"
              value={formData.profile.emergencyContact}
              onChange={handleInputChange}
              placeholder="Please enter emergency contact number"
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
          )}

{formData.userType === 'tenant' && (
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
                Property
              </label>
              <select 
                id="profile.property"
                value={formData.profile.property || ''}
                onChange={handleInputChange}
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
                <option value="">Please select property</option>
                <option value="Blue Hills Apartments">Blue Hills Apartments</option>
                <option value="Green Valley Complex">Green Valley Complex</option>
                <option value="Sunset Towers">Sunset Towers</option>
              </select>
            </div>
          )}

          {formData.userType === 'tenant' && (
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
                Unit Number
              </label>
              <input 
                type="text" 
                id="profile.unitNumber"
                value={formData.profile.unitNumber || ''}
                onChange={handleInputChange}
                placeholder="Please enter unit number"
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
          )}

          {formData.userType === 'tenant' && (
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
                Move-in Date
              </label>
              <input 
                type="date" 
                id="profile.moveInDate"
                value={formData.profile.moveInDate}
                onChange={handleInputChange}
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
          )}

          {formData.userType === 'caretaker' && (
            <div style={{ marginBottom: '16px' }}>
              <label 
                style={{ 
                  display: 'block', 
                  marginBottom: '6px', 
                  fontWeight: '600', 
                  color: '#2c3e50', 
                  fontSize: '14px' 
                }}
              >
                Skills
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['plumbing', 'electrical', 'general', 'carpentry', 'painting', 'landscaping'].map((skill) => (
                  <label key={skill} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                    <input 
                      type="checkbox" 
                      value={skill}
                      checked={formData.profile.skills.includes(skill)}
                      onChange={handleSkillChange}
                      style={{ margin: 0 }}
                    />
                    {skill.charAt(0).toUpperCase() + skill.slice(1)}
                  </label>
                ))}
              </div>
            </div>
          )}
          
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
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Please enter password"
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
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Please confirm password"
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
            onClick={handleCreateUser}
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
            {loading ? 'Creating User...' : 'Create User'}
          </button>
          
          <button 
            type="button"
            onClick={() => navigate('/admin/users')}
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
        </div>
      </div>
    </div>
  );
}

export default AdminAddUserPage;