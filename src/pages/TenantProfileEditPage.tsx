import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';

function TenantProfileEditPage() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        emergencyContact: user.emergencyContact || { name: '', relationship: '', phone: '' }
      });
      setIsLoading(false);
    }
  }, [user]);

  const handleSaveProfile = () => {
    if (user) {
      // Update user data using AuthContext
      updateUser({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        emergencyContact: formData.emergencyContact
      });
    }
    
    // Navigate back to profile page
    navigate('/tenant/profile');
  };

  const handleCancel = () => {
    navigate('/tenant/profile');
  };

  const navItems = [
    { path: '/tenant', label: 'Home', active: false },
    { path: '/tenant/payments', label: 'Payments' },
    { path: '/tenant/requests', label: 'Requests' },
    { path: '/tenant/profile', label: 'Profile', active: true }
  ];

  if (isLoading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout={true} showBackButton={true} />
        <div className="main-content">
          <div className="loading">Loading profile data...</div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} showBackButton={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Edit Profile</div>
          <div className="page-subtitle">Update your personal information</div>
        </div>

        <div className="profile-edit-form">
          <form>
            <div className="form-section">
              <h3>Personal Information</h3>
              
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Emergency Contact</h3>
              
              <div className="form-group">
                <label>Emergency Contact Name</label>
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                  }))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Emergency Contact Relationship</label>
                <input
                  type="text"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                  }))}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Emergency Contact Phone</label>
                <input
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                  }))}
                  required
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn btn-primary"
                onClick={handleSaveProfile}
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default TenantProfileEditPage;
