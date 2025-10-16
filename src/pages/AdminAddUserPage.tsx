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
    <div style={{
      maxWidth: '390px',
      margin: '0 auto',
      background: '#ffffff',
      minHeight: '100vh',
      position: 'relative',
      boxShadow: '0 0 20px rgba(0,0,0,0.1)'
    }}>
      <TopNav showBackButton showLogout />
      
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
            Add New User
          </h2>
          
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
          
          {success && (
            <div style={{
              background: '#efe',
              color: '#060',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {success}
            </div>
          )}
          
<div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="fullName" 
              style={{ 
                display: 'block', 
                marginBottom: '6px', 
                fontWeight: '600', 
                color: '#2c3e50', 
                fontSize: '14px' 
              }}
            >
              Full Name
            </label>
            <input 
              type="text" 
              id="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Please enter full name"
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
            <input 
              type="password" 
              id="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Please enter password"
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
            <input 
              type="password" 
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Please confirm password"
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
              background: loading ? '#ccc' : '#162F1B',
              color: 'white',
              textDecoration: 'none',
              display: 'inline-block',
              textAlign: 'center',
              opacity: loading ? 0.7 : 1
            }}
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
              marginBottom: '10px',
              background: '#6c757d',
              color: 'white',
              textDecoration: 'none',
              display: 'inline-block',
              textAlign: 'center'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminAddUserPage;