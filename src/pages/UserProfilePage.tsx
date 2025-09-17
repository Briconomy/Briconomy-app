import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import PaymentMethodsManager from '../components/PaymentMethodsManager.tsx';
import DocumentViewer from '../components/DocumentViewer.tsx';
import ActivityLog from '../components/ActivityLog.tsx';

function UserProfilePage() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = useState<'overview' | 'documents' | 'activity'>('overview');

  const navItems = [
    { path: '/tenant', label: 'Home', active: false },
    { path: '/tenant/payments', label: 'Payments' },
    { path: '/tenant/requests', label: 'Requests' },
    { path: '/tenant/profile', label: 'Profile', active: true }
  ];

  if (loading || !user) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout={true} showBackButton={true} />
        <div className="main-content">
          <div className="loading">Loading profile...</div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }


  const leaseDaysRemaining = Math.ceil((new Date(user.leaseEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} showBackButton={true} />
      
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
            onClick={() => navigate('/tenant/profile/edit')}
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
                <label>Full Name: </label>
                <span>{user.fullName}</span>
              </div>
              <div className="info-item">
                <label>Email: </label>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <label>Phone: </label>
                <span>{user.phone}</span>
              </div>
              <div className="info-item">
                <label>Member Since: </label>
                <span>{new Date(user.joinDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>Lease Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Property: </label>
                <span>{user.property}</span>
              </div>
              <div className="info-item">
                <label>Unit: </label>
                <span>{user.unit}</span>
              </div>
              <div className="info-item">
                <label>Lease Start: </label>
                <span>{new Date(user.leaseStart).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>Lease End: </label>
                <span>{new Date(user.leaseEnd).toLocaleDateString()}</span>
              </div>
              <div className="info-item">
                <label>Monthly Rent: </label>
                <span>R{user.rent.toLocaleString()}</span>
              </div>
              <div className="info-item">
                <label>Days Remaining: </label>
                <span>{leaseDaysRemaining} days</span>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>Emergency Contact</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Name: </label>
                <span>{user.emergencyContact.name}</span>
              </div>
              <div className="info-item">
                <label>Relationship: </label>
                <span>{user.emergencyContact.relationship}</span>
              </div>
              <div className="info-item">
                <label>Phone: </label>
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
            onClick={() => setActiveSection('documents')}
            icon="D"
            title="Documents"
            description="View your documents"
          />
          <ActionCard
            onClick={() => setActiveSection('activity')}
            icon="L"
            title="Activity Log"
            description="View recent activity"
          />
        </div>
      </div>

      {/* Dynamic Sections */}

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
