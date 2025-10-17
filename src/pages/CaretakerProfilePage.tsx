import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { tasksApi, maintenanceApi, useApi } from '../services/api.ts';

function CaretakerProfilePage() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    taskReminders: true,
    maintenanceUpdates: true
  });

  const navItems = [
    { path: '/caretaker', label: 'Tasks', icon: 'issue', active: false },
    { path: '/caretaker/schedule', label: 'Schedule', icon: 'report', active: false },
    { path: '/caretaker/history', label: 'History', icon: 'activityLog', active: false },
    { path: '/caretaker/profile', label: 'Profile', icon: 'profile', active: true }
  ];

  const { data: tasks, loading: tasksLoading, error: tasksError } = useApi(
    () => tasksApi.getAll(user?.id ? { caretakerId: user.id } : {}),
    [user?.id]
  );

  const { data: maintenance, loading: maintenanceLoading, error: maintenanceError } = useApi(
    () => maintenanceApi.getAll(user?.id ? { assignedTo: user.id } : {}),
    [user?.id]
  );

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      const userRaw = localStorage.getItem('briconomy_user');
      const userData = userRaw ? JSON.parse(userRaw) : null;
      setUser(userData);
      if (userData) {
        setFormData({
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          department: userData.profile?.department || '',
          employeeId: userData.profile?.employeeId || '',
          skills: userData.profile?.skills || [],
          emergencyContact: userData.profile?.emergencyContact || ''
        });
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const getMockTasks = () => {
    return [
      {
        id: '1',
        title: 'Weekly property inspection',
        status: 'completed',
        completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 4,
        actualHours: 3.5
      },
      {
        id: '2',
        title: 'AC repair - Unit 2A',
        status: 'completed',
        completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 3,
        actualHours: 4
      },
      {
        id: '3',
        title: 'Pool cleaning',
        status: 'pending',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 2
      },
      {
        id: '4',
        title: 'Garden maintenance',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 6,
        actualHours: 3
      },
      {
        id: '5',
        title: 'Security system check',
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 2
      }
    ];
  };

  const getMockMaintenance = () => {
    return [
      {
        id: '1',
        title: 'Broken window',
        status: 'completed',
        completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedCost: 1200,
        actualCost: 1150
      },
      {
        id: '2',
        title: 'Leaky faucet',
        status: 'completed',
        completedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedCost: 800,
        actualCost: 750
      },
      {
        id: '3',
        title: 'Electrical issue',
        status: 'in_progress',
        estimatedCost: 2000,
        actualCost: null
      }
    ];
  };

  const useMockTasksData = tasksError || !tasks;
  const useMockMaintenanceData = maintenanceError || !maintenance;
  
  const mockTasks = getMockTasks();
  const mockMaintenance = getMockMaintenance();
  
  const tasksData = Array.isArray(tasks) ? tasks : (useMockTasksData ? mockTasks : []);
  const maintenanceData = Array.isArray(maintenance) ? maintenance : (useMockMaintenanceData ? mockMaintenance : []);

  // Calculate performance statistics
  const completedTasks = tasksData.filter(task => task.status === 'completed').length;
  const inProgressTasks = tasksData.filter(task => task.status === 'in_progress').length;
  const pendingTasks = tasksData.filter(task => task.status === 'pending').length;
  const totalTasks = tasksData.length;

  const completedMaintenance = maintenanceData.filter(req => req.status === 'completed').length;
  const totalMaintenanceCost = maintenanceData
    .filter(req => req.status === 'completed' && req.actualCost)
    .reduce((sum, req) => sum + (Number(req.actualCost) || 0), 0);

  const avgTaskCompletion = tasksData
    .filter(task => task.status === 'completed' && task.estimatedHours && task.actualHours)
    .reduce((sum, task) => sum + (Number(task.actualHours) / Number(task.estimatedHours)), 0) / completedTasks || 1;

  const efficiency = Math.round((1 / Math.max(avgTaskCompletion, 1)) * 100);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillToggle = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    console.log('Saving profile data:', formData);
    setIsEditing(false);
    // Show success message
    alert('Profile updated successfully!');
  };

  const handleNotificationChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(Number(amount) || 0);
  };

  const availableSkills = [
    'plumbing', 'electrical', 'general', 'carpentry', 
    'painting', 'landscaping', 'hvac', 'security'
  ];

  const loading = tasksLoading || maintenanceLoading;

  if (loading) {
    return (
      <div className="app-container mobile-only">
<TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your profile...</p>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">My Profile</div>
          <div className="page-subtitle">Personal information and settings</div>
          <button type="button"
            className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'} btn-sm`}
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Information */}
        <ChartCard title="Personal Information">
          <div className="profile-info">
            <div className="profile-field">
              <label className="field-label">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  className="field-input"
                  value={formData.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              ) : (
                <div className="field-value">{user?.fullName}</div>
              )}
            </div>

            <div className="profile-field">
              <label className="field-label">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  className="field-input"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              ) : (
                <div className="field-value">{user?.email}</div>
              )}
            </div>

            <div className="profile-field">
              <label className="field-label">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  className="field-input"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              ) : (
                <div className="field-value">{user?.phone}</div>
              )}
            </div>

            <div className="profile-field">
              <label className="field-label">Department</label>
              {isEditing ? (
                <input
                  type="text"
                  className="field-input"
                  value={formData.department || ''}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                />
              ) : (
                <div className="field-value">{user?.profile?.department}</div>
              )}
            </div>

            <div className="profile-field">
              <label className="field-label">Employee ID</label>
              {isEditing ? (
                <input
                  type="text"
                  className="field-input"
                  value={formData.employeeId || ''}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                />
              ) : (
                <div className="field-value">{user?.profile?.employeeId}</div>
              )}
            </div>

            <div className="profile-field">
              <label className="field-label">Emergency Contact</label>
              {isEditing ? (
                <input
                  type="tel"
                  className="field-input"
                  value={formData.emergencyContact || ''}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                />
              ) : (
                <div className="field-value">{user?.profile?.emergencyContact || 'Not provided'}</div>
              )}
            </div>
          </div>
        </ChartCard>

        {/* Skills Section */}
        <ChartCard title="Skills & Expertise">
          <div className="skills-section">
            <div className="skills-grid">
              {availableSkills.map((skill) => (
                <div
                  key={skill}
                  className={`skill-tag ${formData.skills?.includes(skill) ? 'skill-active' : 'skill-inactive'}`}
                  onClick={() => isEditing && handleSkillToggle(skill)}
                >
                  {skill.charAt(0).toUpperCase() + skill.slice(1)}
                </div>
              ))}
            </div>
            {!isEditing && formData.skills?.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">No skills specified</p>
            )}
          </div>
        </ChartCard>

        {/* Performance Statistics */}
        <div className="dashboard-grid">
          <StatCard value={completedTasks} label="Tasks Done" />
          <StatCard value={`${efficiency}%`} label="Efficiency" />
          <StatCard value={formatCurrency(totalMaintenanceCost)} label="Cost Saved" />
          <StatCard value={user?.profile?.assignedProperty ? 'Yes' : 'No'} label="Assigned" />
        </div>

        {/* Notification Settings */}
        <ChartCard title="Notification Settings">
          <div className="notification-settings">
            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">Email Notifications</div>
                <div className="setting-desc">Receive updates via email</div>
              </div>
              <div 
                className={`toggle-switch ${notificationSettings.email ? 'toggle-on' : 'toggle-off'}`}
                onClick={() => handleNotificationChange('email')}
              >
                <div className="toggle-slider"></div>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">Push Notifications</div>
                <div className="setting-desc">Receive push notifications</div>
              </div>
              <div 
                className={`toggle-switch ${notificationSettings.push ? 'toggle-on' : 'toggle-off'}`}
                onClick={() => handleNotificationChange('push')}
              >
                <div className="toggle-slider"></div>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">Task Reminders</div>
                <div className="setting-desc">Get reminded about upcoming tasks</div>
              </div>
              <div 
                className={`toggle-switch ${notificationSettings.taskReminders ? 'toggle-on' : 'toggle-off'}`}
                onClick={() => handleNotificationChange('taskReminders')}
              >
                <div className="toggle-slider"></div>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-title">Maintenance Updates</div>
                <div className="setting-desc">Updates on maintenance requests</div>
              </div>
              <div 
                className={`toggle-switch ${notificationSettings.maintenanceUpdates ? 'toggle-on' : 'toggle-off'}`}
                onClick={() => handleNotificationChange('maintenanceUpdates')}
              >
                <div className="toggle-slider"></div>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Assigned Property */}
        {user?.profile?.assignedProperty && (
          <ChartCard title="Assigned Property">
            <div className="property-info">
              <div className="property-name">{user.profile.assignedProperty.name || 'Unknown Property'}</div>
              <div className="property-address">{user.profile.assignedProperty.address || 'Address not available'}</div>
              <div className="property-details">
                <span className="property-type">{user.profile.assignedProperty.type || 'Property'}</span>
                <span className="property-units">{user.profile.assignedProperty.totalUnits || 0} units</span>
              </div>
            </div>
          </ChartCard>
        )}

        {/* Recent Activity */}
        <ChartCard title="Recent Activity">
          <div className="activity-list">
            {tasksData
              .filter(task => task.status === 'completed')
              .slice(0, 3)
              .map((task) => (
                <div key={task.id} className="activity-item">
                  <div className="activity-icon">Done</div>
                  <div className="activity-content">
                    <div className="activity-title">Completed: {task.title}</div>
                    <div className="activity-time">
                      {task.completedDate ? formatDate(task.completedDate) : 'Recently'}
                    </div>
                  </div>
                </div>
              ))}
            {tasksData.filter(task => task.status === 'completed').length === 0 && (
              <div className="no-activity">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </ChartCard>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default CaretakerProfilePage;
