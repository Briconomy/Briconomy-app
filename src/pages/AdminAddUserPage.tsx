import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../services/api.ts';
import TopNav from '../components/TopNav.tsx';
import PasswordStrengthIndicator from '../components/PasswordStrengthIndicator.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

function AdminAddUserPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    userType: 'manager',
    password: '',
    confirmPassword: '',
    profile: {
      department: '',
      employeeId: '',
      joinDate: '',
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
      setError(t('admin.passwords_do_not_match'));
      setLoading(false);
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone || !formData.userType || !formData.password) {
      setError(t('admin.fill_required_fields'));
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError(t('admin.valid_email'));
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError(t('admin.password_min_length'));
      setLoading(false);
      return;
    }

    const profileData: Record<string, unknown> = {};
    
    if (formData.userType === 'admin') {
      if (!formData.profile.department || !formData.profile.employeeId || !formData.profile.joinDate) {
        setError(t('admin.fill_admin_fields'));
        setLoading(false);
        return;
      }
      profileData.department = formData.profile.department;
      profileData.employeeId = formData.profile.employeeId;
      profileData.joinDate = new Date(formData.profile.joinDate);
    }

    if (formData.userType === 'manager') {
      if (!formData.profile.department || !formData.profile.employeeId || !formData.profile.joinDate) {
        setError(t('admin.fill_manager_fields'));
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
        setError(t('admin.fill_caretaker_fields'));
        setLoading(false);
        return;
      }
      profileData.department = formData.profile.department;
      profileData.employeeId = formData.profile.employeeId;
      profileData.joinDate = new Date(formData.profile.joinDate);
      profileData.skills = formData.profile.skills;
      profileData.assignedProperty = formData.profile.assignedProperty || null;
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
      
      setSuccess(t('admin.user_created_success'));
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
          <div className="page-title">{t('admin.add_new_user')}</div>
          <div className="page-subtitle">{t('admin.create_new_user_account')}</div>
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
              {t('admin.full_name')}
            </label>
            <input
              type="text"
              id="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder={t('admin.enter_full_name')}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">
              {t('admin.email_address')}
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={t('admin.enter_email_address')}
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
              {t('admin.phone_number')}
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder={t('admin.enter_phone_number')}
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
              {t('admin.user_type')}
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
              <option value="manager">{t('admin.manager')}</option>
              <option value="caretaker">{t('admin.caretaker')}</option>
              <option value="admin">{t('admin.admin')}</option>
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
              {t('admin.department')}
            </label>
            <input
              type="text"
              id="profile.department"
              value={formData.profile.department}
              onChange={handleInputChange}
              placeholder={t('admin.enter_department')}
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
              {t('admin.employee_id')}
            </label>
            <input
              type="text"
              id="profile.employeeId"
              value={formData.profile.employeeId}
              onChange={handleInputChange}
              placeholder={t('admin.enter_employee_id')}
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
                {t('admin.join_date')}
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
                {t('admin.skills')}
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
                    {t(`admin.skill_${skill}`)}
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
              {t('admin.password')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={t('admin.enter_password')}
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
                aria-label={showPassword ? t('admin.hide_password') : t('admin.show_password')}
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
              {t('admin.confirm_password')}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder={t('admin.confirm_password_enter')}
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
                aria-label={showConfirmPassword ? t('admin.hide_password') : t('admin.show_password')}
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
            {loading ? t('admin.creating_user') : t('admin.create_user')}
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
            {t('admin.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminAddUserPage;