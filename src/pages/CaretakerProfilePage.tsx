import { useEffect, useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { tasksApi, maintenanceApi, useApi } from '../services/api.ts';
import { LanguageSwitcher, useLanguage } from '../contexts/LanguageContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';

function CaretakerProfilePage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    department: '',
    employeeId: '',
    skills: [],
    emergencyContact: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    taskReminders: true,
    maintenanceUpdates: true
  });

  const navItems = [
    { path: '/caretaker', label: t('nav.tasks'), icon: 'issue', active: false },
    { path: '/caretaker/schedule', label: t('nav.schedule'), icon: 'report', active: false },
    { path: '/caretaker/history', label: t('nav.history'), icon: 'activityLog', active: false },
    { path: '/caretaker/profile', label: t('nav.profile'), icon: 'profile', active: true }
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
      const userRaw = localStorage.getItem('briconomy_user') || sessionStorage.getItem('briconomy_user');
      const userData = userRaw ? JSON.parse(userRaw) : null;
      console.log('CaretakerProfilePage - Loaded user data:', userData);
      setUser(userData);
      if (userData) {
        setFormData({
          fullName: userData.fullName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          department: userData.profile?.department || '',
          employeeId: userData.profile?.employeeId || '',
          skills: userData.profile?.skills || [],
          emergencyContact: userData.profile?.emergencyContact || ''
        });
        if (userData.profile?.notificationSettings) {
          setNotificationSettings(userData.profile.notificationSettings);
        }
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

  const caretakerStats = [
    { value: totalTasks, label: t('caretakerProfile.tasksTotal') },
    { value: completedTasks, label: t('caretakerProfile.tasksDone') },
    { value: pendingTasks, label: t('caretakerProfile.tasksPending') },
    { value: inProgressTasks, label: t('caretakerProfile.inProgress') },
    { value: `${efficiency}%`, label: t('caretakerProfile.efficiency') },
    { value: completedMaintenance, label: t('caretakerProfile.maintenanceClosed') },
    { value: formatCurrency(totalMaintenanceCost), label: t('caretakerProfile.costSaved') },
    { value: user?.profile?.assignedProperty ? t('caretakerProfile.yes') : t('caretakerProfile.no'), label: t('caretakerProfile.assignedPropertyLabel') }
  ];

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
    if (!user) return;

    const updatedUser = {
      ...user,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      profile: {
        ...user.profile,
        department: formData.department,
        employeeId: formData.employeeId,
        skills: formData.skills,
        emergencyContact: formData.emergencyContact,
        notificationSettings: notificationSettings
      }
    };

    setUser(updatedUser);

    if (localStorage.getItem('briconomy_user')) {
      localStorage.setItem('briconomy_user', JSON.stringify(updatedUser));
      console.log('Profile saved to localStorage:', updatedUser);
    } else if (sessionStorage.getItem('briconomy_user')) {
      sessionStorage.setItem('briconomy_user', JSON.stringify(updatedUser));
      console.log('Profile saved to sessionStorage:', updatedUser);
    }

    setIsEditing(false);
    showToast(t('caretakerProfile.profileUpdated'), 'success');
  };

  const handleNotificationChange = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  function formatCurrency(amount: number | string) {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(Number(amount) || 0);
  }

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
            <p>{t('caretakerProfile.loading')}</p>
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
          <div className="page-title">{t('caretakerProfile.title')}</div>
          <div className="page-subtitle">{t('caretakerProfile.subtitle')}</div>
          <button type="button"
            className={`btn ${isEditing ? 'btn-secondary' : 'btn-primary'} btn-sm caretaker-edit-btn`}
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? t('caretakerProfile.saveChanges') : t('caretakerProfile.editProfile')}
          </button>
        </div>

        {/* Profile Information */}
        <ChartCard title={t('caretakerProfile.personalInformation')}>
          <div className="caretaker-profile-info">
            <div className="caretaker-profile-field">
              <label className="caretaker-field-label">{t('caretakerProfile.fullName')}</label>
              {isEditing ? (
                <input
                  type="text"
                  className="caretaker-field-input"
                  value={formData.fullName || ''}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              ) : (
                <div className="caretaker-field-value">{user?.fullName || t('caretakerProfile.notProvided')}</div>
              )}
            </div>

            <div className="caretaker-profile-field">
              <label className="caretaker-field-label">{t('caretakerProfile.email')}</label>
              {isEditing ? (
                <input
                  type="email"
                  className="caretaker-field-input"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              ) : (
                <div className="caretaker-field-value">{user?.email || t('caretakerProfile.notProvided')}</div>
              )}
            </div>

            <div className="caretaker-profile-field">
              <label className="caretaker-field-label">{t('caretakerProfile.phone')}</label>
              {isEditing ? (
                <input
                  type="tel"
                  className="caretaker-field-input"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              ) : (
                <div className="caretaker-field-value">{user?.phone || t('caretakerProfile.notProvided')}</div>
              )}
            </div>

            <div className="caretaker-profile-field">
              <label className="caretaker-field-label">{t('caretakerProfile.department')}</label>
              {isEditing ? (
                <input
                  type="text"
                  className="caretaker-field-input"
                  value={formData.department || ''}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                />
              ) : (
                <div className="caretaker-field-value">{user?.profile?.department || t('caretakerProfile.notProvided')}</div>
              )}
            </div>

            <div className="caretaker-profile-field">
              <label className="caretaker-field-label">{t('caretakerProfile.employeeId')}</label>
              {isEditing ? (
                <input
                  type="text"
                  className="caretaker-field-input"
                  value={formData.employeeId || ''}
                  onChange={(e) => handleInputChange('employeeId', e.target.value)}
                />
              ) : (
                <div className="caretaker-field-value">{user?.profile?.employeeId || t('caretakerProfile.notProvided')}</div>
              )}
            </div>

            <div className="caretaker-profile-field">
              <label className="caretaker-field-label">{t('caretakerProfile.emergencyContact')}</label>
              {isEditing ? (
                <input
                  type="tel"
                  className="caretaker-field-input"
                  value={formData.emergencyContact || ''}
                  onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                />
              ) : (
                <div className="caretaker-field-value">{user?.profile?.emergencyContact || t('caretakerProfile.notProvided')}</div>
              )}
            </div>
          </div>
        </ChartCard>

        {/* Skills Section */}
        <ChartCard title={t('caretakerProfile.skillsExpertise')}>
          <div className="caretaker-skills-section">
            <div className="caretaker-skills-grid">
              {availableSkills.map((skill) => (
                <div
                  key={skill}
                  className={`caretaker-skill-tag ${formData.skills?.includes(skill) ? 'caretaker-skill-active' : 'caretaker-skill-inactive'}`}
                  onClick={() => isEditing && handleSkillToggle(skill)}
                >
                  {skill.charAt(0).toUpperCase() + skill.slice(1)}
                </div>
              ))}
            </div>
            {!isEditing && formData.skills?.length === 0 && (
              <p className="text-sm text-gray-500 mt-2">{t('caretakerProfile.noSkills')}</p>
            )}
          </div>
        </ChartCard>

        {/* Performance Statistics */}
        <div className="caretaker-stats-grid">
          {caretakerStats.map(stat => (
            <StatCard key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>

        {/* Notification Settings */}
        <ChartCard title={t('caretakerProfile.notificationSettings')}>
          <div className="caretaker-notification-settings">
            <div className="caretaker-setting-item">
              <div className="caretaker-setting-info">
                <div className="caretaker-setting-title">{t('caretakerProfile.emailNotifications')}</div>
                <div className="caretaker-setting-desc">{t('caretakerProfile.receiveEmail')}</div>
              </div>
              <div
                className={`caretaker-toggle-switch ${notificationSettings.email ? 'caretaker-toggle-on' : 'caretaker-toggle-off'}`}
                onClick={() => handleNotificationChange('email')}
              >
                <div className="caretaker-toggle-slider"></div>
              </div>
            </div>

            <div className="caretaker-setting-item">
              <div className="caretaker-setting-info">
                <div className="caretaker-setting-title">{t('caretakerProfile.pushNotifications')}</div>
                <div className="caretaker-setting-desc">{t('caretakerProfile.receivePush')}</div>
              </div>
              <div
                className={`caretaker-toggle-switch ${notificationSettings.push ? 'caretaker-toggle-on' : 'caretaker-toggle-off'}`}
                onClick={() => handleNotificationChange('push')}
              >
                <div className="caretaker-toggle-slider"></div>
              </div>
            </div>

            <div className="caretaker-setting-item">
              <div className="caretaker-setting-info">
                <div className="caretaker-setting-title">{t('caretakerProfile.taskReminders')}</div>
                <div className="caretaker-setting-desc">{t('caretakerProfile.remindTasks')}</div>
              </div>
              <div
                className={`caretaker-toggle-switch ${notificationSettings.taskReminders ? 'caretaker-toggle-on' : 'caretaker-toggle-off'}`}
                onClick={() => handleNotificationChange('taskReminders')}
              >
                <div className="caretaker-toggle-slider"></div>
              </div>
            </div>

            <div className="caretaker-setting-item">
              <div className="caretaker-setting-info">
                <div className="caretaker-setting-title">{t('caretakerProfile.maintenanceUpdates')}</div>
                <div className="caretaker-setting-desc">{t('caretakerProfile.updatesMaintenance')}</div>
              </div>
              <div
                className={`caretaker-toggle-switch ${notificationSettings.maintenanceUpdates ? 'caretaker-toggle-on' : 'caretaker-toggle-off'}`}
                onClick={() => handleNotificationChange('maintenanceUpdates')}
              >
                <div className="caretaker-toggle-slider"></div>
              </div>
            </div>
          </div>
        </ChartCard>

        {/* Assigned Property */}
        {user?.profile?.assignedProperty && (
          <ChartCard title={t('caretakerProfile.assignedProperty')}>
            <div className="caretaker-property-info">
              <div className="caretaker-property-name">{user.profile.assignedProperty.name || t('caretakerProfile.unknownProperty')}</div>
              <div className="caretaker-property-address">{user.profile.assignedProperty.address || t('caretakerProfile.addressNotAvailable')}</div>
              <div className="caretaker-property-details">
                <span className="caretaker-property-type">{user.profile.assignedProperty.type || t('caretakerProfile.property')}</span>
                <span className="caretaker-property-units">{user.profile.assignedProperty.totalUnits || 0} {t('caretakerProfile.units')}</span>
              </div>
            </div>
          </ChartCard>
        )}

        {/* Recent Activity */}
        <ChartCard title={t('caretakerProfile.recentActivity')}>
          <div className="caretaker-activity-list">
            {tasksData
              .filter(task => task.status === 'completed')
              .slice(0, 3)
              .map((task) => (
                <div key={task.id} className="caretaker-activity-item">
                  <div className="caretaker-activity-icon">{t('caretakerProfile.done')}</div>
                  <div className="caretaker-activity-content">
                    <div className="caretaker-activity-title">{t('caretakerProfile.completedLabel')}: {task.title}</div>
                    <div className="caretaker-activity-time">
                      {task.completedDate ? formatDate(task.completedDate) : t('caretakerProfile.recently')}
                    </div>
                  </div>
                </div>
              ))}
            {tasksData.filter(task => task.status === 'completed').length === 0 && (
              <div className="caretaker-no-activity">
                <p>{t('caretakerProfile.noRecentActivity')}</p>
              </div>
            )}
          </div>
        </ChartCard>

        {/* Account Settings */}
        <ChartCard title={t('caretakerProfile.accountSettings')}>
          <div className="caretaker-settings-container">
            <div className="caretaker-setting-row">
              <div className="caretaker-setting-label">
                <div className="caretaker-setting-name">{t('caretakerProfile.languagePreference')}</div>
                <div className="caretaker-setting-description">{t('caretakerProfile.chooseLanguage')}</div>
              </div>
              <LanguageSwitcher />
            </div>

            <div className="caretaker-setting-row">
              <div className="caretaker-setting-label">
                <div className="caretaker-setting-name">{t('caretakerProfile.twoFactorAuth')}</div>
                <div className="caretaker-setting-description">{t('caretakerProfile.extraSecurity')}</div>
                <div className="caretaker-setting-description" style={{ color: '#999', fontSize: '12px', marginTop: '4px' }}>{t('caretakerProfile.comingSoon')}</div>
              </div>
              <div
                className="caretaker-toggle-switch caretaker-toggle-off"
                style={{ opacity: '0.5', cursor: 'not-allowed' }}
              >
                <div className="caretaker-toggle-slider"></div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>

      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default CaretakerProfilePage;
