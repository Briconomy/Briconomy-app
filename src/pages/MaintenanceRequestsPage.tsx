import _React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { maintenanceApi, leasesApi, formatDate, useApi } from '../services/api.ts';

function MaintenanceRequestsPage() {
  const [user, setUser] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general'
  });

  const navItems = [
    { path: '/tenant', label: 'Home', active: false },
    { path: '/tenant/payments', label: 'Payments' },
    { path: '/tenant/requests', label: 'Requests', active: true },
    { path: '/tenant/profile', label: 'Profile' }
  ];

  const { data: requests, loading: requestsLoading, refetch: refetchRequests } = useApi(
    () => maintenanceApi.getAll({ tenantId: user?.id || '507f1f77bcf86cd799439012' }),
    [user?.id]
  );

  const { data: leases, loading: leasesLoading } = useApi(
    () => leasesApi.getAll({ tenantId: user?.id || '507f1f77bcf86cd799439012' }),
    [user?.id]
  );

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
  const userData = JSON.parse(localStorage.getItem('briconomy_user') || localStorage.getItem('user') || '{}');
      setUser(userData);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const pendingCount = requests?.filter(r => r.status === 'pending').length || 0;
  const inProgressCount = requests?.filter(r => r.status === 'in_progress').length || 0;
  const completedCount = requests?.filter(r => r.status === 'completed').length || 0;

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) return;

    setSubmitting(true);
    try {
      const currentLease = leases?.[0];
      const requestData = {
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        category: formData.category,
        status: 'pending',
        tenantId: user?.id || '507f1f77bcf86cd799439012',
        unitId: currentLease?.unitId || null,
        propertyId: currentLease?.propertyId || null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await maintenanceApi.create(requestData);
      await refetchRequests();
      setShowRequestForm(false);
      setFormData({ title: '', description: '', priority: 'medium', category: 'general' });
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-progress';
      case 'completed': return 'status-paid';
      default: return 'status-pending';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-700 font-bold';
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return '!';
      case 'high': return '!!';
      case 'medium': return '•';
      case 'low': return '·';
      default: return '-';
    }
  };

  const canSubmitRequest = () => {
    return formData.title.trim() && formData.description.trim() && !submitting;
  };

  if (requestsLoading || leasesLoading) {
    return (
      <div className="app-container mobile-only">
  <TopNav showLogout />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading maintenance requests...</p>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  const currentLease = leases?.[0];

  return (
    <div className="app-container mobile-only">
  <TopNav showLogout />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Maintenance Requests</div>
          <div className="page-subtitle">Report and track issues</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={pendingCount} label="Pending" />
          <StatCard value={inProgressCount} label="In Progress" />
          <StatCard value={completedCount} label="Completed" />
          <StatCard value={requests?.length || 0} label="Total" />
        </div>

        {currentLease && (
          <div className="unit-info-card">
            <h3>Your Unit</h3>
            <div className="unit-details">
              <p><strong>Unit:</strong> {currentLease.unitId?.unitNumber || 'N/A'}</p>
              <p><strong>Property:</strong> {currentLease.propertyId?.name || 'N/A'}</p>
              <p><strong>Address:</strong> {currentLease.propertyId?.address || 'N/A'}</p>
            </div>
          </div>
        )}

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Your Requests</div>
            <button 
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowRequestForm(true)}
            >
              New Request
            </button>
          </div>
          
          {requests?.length === 0 ? (
            <div className="empty-state">
              <p>No maintenance requests found</p>
              <button 
                type="button"
                className="btn btn-primary"
                onClick={() => setShowRequestForm(true)}
              >
                Create Your First Request
              </button>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="list-item">
                <div className="item-info">
                  <div className="request-header">
                    <h4>{request.title}</h4>
                    <span className={`priority-badge ${getPriorityColor(request.priority)}`}>
                      {getPriorityIcon(request.priority)} {request.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{request.description}</p>
                  <div className="request-meta">
                    <span className="text-xs text-gray-500">
                      {formatDate(request.createdAt)}
                    </span>
                    {request.assignedTo && (
                      <span className="text-xs text-blue-600">
                        Assigned to: {request.assignedTo}
                      </span>
                    )}
                    {request.category && (
                      <span className="text-xs text-purple-600">
                        Category: {request.category}
                      </span>
                    )}
                  </div>
                  {request.status === 'completed' && request.completedAt && (
                    <div className="completion-info">
                      <span className="text-xs text-green-600">
                        Completed on {formatDate(request.completedAt)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="item-actions">
                  <span className={`status-badge ${getStatusColor(request.status)}`}>
                    {request.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="quick-actions">
          <ActionCard
            onClick={() => setShowRequestForm(true)}
            icon="R"
            title="Report Issue"
            description="Create new request"
          />
          <ActionCard
            to="/tenant/messages"
            icon="C"
            title="Contact Caretaker"
            description="Direct communication"
          />
          <ActionCard
            to="/tenant/profile"
            icon="E"
            title="Emergency Info"
            description="Emergency contacts"
          />
        </div>

        <ChartCard title="Request Status Overview">
          <div className="request-stats">
            <div className="stat-item">
              <div className="stat-value">{pendingCount}</div>
              <div className="stat-label">Pending</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{inProgressCount}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{completedCount}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </ChartCard>
      </div>
      
  {showRequestForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>New Maintenance Request</h3>
      <button type="button" className="close-btn" onClick={() => setShowRequestForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitRequest}>
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Brief description of the issue"
                  />
                </div>
                
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={4}
                    placeholder="Detailed description of the issue..."
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="plumbing">Plumbing</option>
                      <option value="electrical">Electrical</option>
                      <option value="hvac">HVAC</option>
                      <option value="general">General</option>
                      <option value="pest">Pest Control</option>
                      <option value="security">Security</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowRequestForm(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    disabled={!canSubmitRequest()}
                  >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default MaintenanceRequestsPage;