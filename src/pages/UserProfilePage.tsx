import React, { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import PaymentMethodsManager from '../components/PaymentMethodsManager.tsx';
import DocumentViewer from '../components/DocumentViewer.tsx';
import HelpSupport from '../components/HelpSupport.tsx';
import ActivityLog from '../components/ActivityLog.tsx';

function UserProfilePage() {
  const [user, setUser] = useState({
    id: '1',
    fullName: 'John Tenant',
    email: 'tenant@briconomy.com',
    phone: '+27123456792',
    userType: 'tenant',
    avatar: 'JT',
    joinDate: '2024-01-01',
    lastLogin: '2024-09-07 09:30',
    unit: '2A',
    property: 'Blue Hills Apartments',
    rent: 12500,
    leaseStart: '2024-01-01',
    leaseEnd: '2024-12-31',
    emergencyContact: {
      name: 'Jane Tenant',
      relationship: 'Spouse',
      phone: '+27123456793'
    }
  });

  const [showEditForm, setShowEditForm] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'payment-methods' | 'documents' | 'help' | 'activity'>('overview');
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    emergencyContact: user.emergencyContact
  });

  const navItems = [
    { path: '/tenant', label: 'Home', active: false },
    { path: '/tenant/payments', label: 'Payments' },
    { path: '/tenant/requests', label: 'Requests' },
    { path: '/tenant/profile', label: 'Profile', active: true }
  ];

  const handleSaveProfile = () => {
    setUser(prev => ({
      ...prev,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      emergencyContact: formData.emergencyContact
    }));
    setShowEditForm(false);
  };

  const leaseDaysRemaining = Math.ceil((new Date(user.leaseEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Profile</div>
          <div className="page-subtitle">Manage your account information</div>
        </div>
        
        <div className="profile-header">
          <div className="profile-avatar">
            {user.avatar}
          </div>
          <div className="profile-info">
            <h2>{user.fullName}</h2>
            <p className="profile-role">{user.userType}</p>
            <p className="profile-property">{user.property} - Unit {user.unit}</p>
          </div>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => setShowEditForm(true)}
          >
            Edit
          </button>
        </div>

        <div className="dashboard-grid">
          <StatCard value={user.unit} label="Unit" />
          <StatCard value={`R${user.rent.toLocaleString()}`} label="Monthly Rent" />
          <StatCard value={`${leaseDaysRemaining} days`} label="Lease Remaining" />
          <StatCard value="Active" label="Status" />
        </div>

        <div className="profile-sections">
          <div className="profile-section">
            <h3>Personal Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Full Name</label>
                <span>{user.fullName}</span>
              </div>
              <div className="info-item">
                <label>Email</label>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <span>{user.phone}</span>
              </div>
              <div className="info-item">
                <label>Member Since</label>
                <span>{new Date(user.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>Lease Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Property</label>
                <span>{user.property}</span>
              </div>
              <div className="info-item">
                <label>Unit</label>
                <span>{user.unit}</span>
              </div>
              <div className="info-item">
                <label>Lease Start</label>
                <span>{new Date(user.leaseStart).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>Lease End</label>
                <span>{new Date(user.leaseEnd).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>Monthly Rent</label>
                <span>R{user.rent.toLocaleString()}</span>
              </div>
              <div className="info-item">
                <label>Days Remaining</label>
                <span>{leaseDaysRemaining} days</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>Emergency Contact</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name</label>
                <span>{user.emergencyContact.name}</span>
              </div>
              <div className="info-item">
                <label>Relationship</label>
                <span>{user.emergencyContact.relationship}</span>
              </div>
              <div className="info-item">
                <label>Phone</label>
                <span>{user.emergencyContact.phone}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>Account Settings</h3>
            <div className="settings-grid">
              <div className="setting-item">
                <label>Notifications</label>
                <div className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </div>
              </div>
              <div className="setting-item">
                <label>Email Notifications</label>
                <div className="toggle-switch">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                </div>
              </div>
              <div className="setting-item">
                <label>SMS Notifications</label>
                <div className="toggle-switch">
                  <input type="checkbox" />
                  <span className="toggle-slider"></span>
                </div>
              </div>
              <div className="setting-item">
                <label>Two-Factor Authentication</label>
                <div className="toggle-switch">
                  <input type="checkbox" />
                  <span className="toggle-slider"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <ActionCard
            onClick={() => setActiveSection('payment-methods')}
            icon="P"
            title="Payment Methods"
            description="Manage payment options"
          />
          <ActionCard
            onClick={() => setActiveSection('documents')}
            icon="D"
            title="Documents"
            description="View your documents"
          />
          <ActionCard
            onClick={() => setActiveSection('help')}
            icon="H"
            title="Help & Support"
            description="Get help"
          />
          <ActionCard
            onClick={() => setActiveSection('activity')}
            icon="L"
            title="Activity Log"
            description="View recent activity"
          />
        </div>
      </div>
      
      {showEditForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button className="close-btn" onClick={() => setShowEditForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <form>
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
                
                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditForm(false)}
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
        </div>
      )}

      {/* Dynamic Sections */}
      {activeSection === 'payment-methods' && (
        <div className="profile-section">
          <div className="section-header">
            <h3>Payment Methods</h3>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveSection('overview')}
            >
              Back to Overview
            </button>
          </div>
          <PaymentMethodsManager />
        </div>
      )}

      {activeSection === 'documents' && (
        <div className="profile-section">
          <div className="section-header">
            <h3>Documents</h3>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveSection('overview')}
            >
              Back to Overview
            </button>
          </div>
          <DocumentViewer />
        </div>
      )}

      {activeSection === 'help' && (
        <div className="profile-section">
          <div className="section-header">
            <h3>Help & Support</h3>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveSection('overview')}
            >
              Back to Overview
            </button>
          </div>
          <HelpSupport />
        </div>
      )}

      {activeSection === 'activity' && (
        <div className="profile-section">
          <div className="section-header">
            <h3>Activity Log</h3>
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setActiveSection('overview')}
            >
              Back to Overview
            </button>
          </div>
          <ActivityLog />
        </div>
      )}
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default UserProfilePage;
