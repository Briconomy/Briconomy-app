import React, { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';

function MaintenanceRequestsPage() {
  const [requests, setRequests] = useState([
    {
      id: '1',
      title: 'AC repair',
      description: 'Air conditioning not working properly, making strange noises',
      priority: 'high',
      status: 'in_progress',
      createdAt: '2024-08-25',
      assignedTo: 'John Caretaker',
      unit: 'Unit 2A'
    },
    {
      id: '2',
      title: 'Leaky faucet',
      description: 'Kitchen sink faucet is dripping continuously',
      priority: 'medium',
      status: 'pending',
      createdAt: '2024-08-28',
      assignedTo: null,
      unit: 'Unit 2A'
    },
    {
      id: '3',
      title: 'Broken window lock',
      description: 'Bedroom window lock is broken',
      priority: 'high',
      status: 'completed',
      createdAt: '2024-08-20',
      assignedTo: 'Mike Technician',
      unit: 'Unit 2A',
      completedAt: '2024-08-22'
    }
  ]);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium'
  });

  const navItems = [
    { path: '/tenant', label: 'Home', active: false },
    { path: '/tenant/payments', label: 'Payments' },
    { path: '/tenant/requests', label: 'Requests', active: true },
    { path: '/tenant/profile', label: 'Profile' }
  ];

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const inProgressCount = requests.filter(r => r.status === 'in_progress').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    const newRequest = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: 'pending',
      createdAt: new Date().toISOString().split('T')[0],
      assignedTo: null,
      unit: 'Unit 2A'
    };
    setRequests(prev => [newRequest, ...prev]);
    setShowRequestForm(false);
    setFormData({ title: '', description: '', priority: 'medium' });
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
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Maintenance Requests</div>
          <div className="page-subtitle">Report and track issues</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={pendingCount} label="Pending" />
          <StatCard value={inProgressCount} label="In Progress" />
          <StatCard value={completedCount} label="Completed" />
          <StatCard value={requests.length} label="Total" />
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Your Requests</div>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowRequestForm(true)}
            >
              New Request
            </button>
          </div>
          
          {requests.map((request) => (
            <div key={request.id} className="list-item">
              <div className="item-info">
                <h4>{request.title}</h4>
                <p className="text-sm text-gray-600">{request.description}</p>
                <div className="request-meta">
                  <span className={`text-xs ${getPriorityColor(request.priority)}`}>
                    {request.priority.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {request.unit} • {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                  {request.assignedTo && (
                    <span className="text-xs text-blue-600">
                      Assigned to: {request.assignedTo}
                    </span>
                  )}
                </div>
              </div>
              <div className="item-actions">
                <span className={`status-badge ${getStatusColor(request.status)}`}>
                  {request.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          ))}
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
              <button className="close-btn" onClick={() => setShowRequestForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitRequest}>
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                    rows={4}
                  />
                </div>
                
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
                
                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowRequestForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                  >
                    Submit Request
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