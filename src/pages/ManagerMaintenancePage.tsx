import React, { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { maintenanceApi, useApi } from '../services/api.ts';

function ManagerMaintenancePage() {
  const { user } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCaretaker, setSelectedCaretaker] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, in_progress, completed
  const [filterPriority, setFilterPriority] = useState('all'); // all, high, medium, low
  const [filterProperty, setFilterProperty] = useState('all'); // all properties
  const [filterAssignment, setFilterAssignment] = useState('all'); // all, assigned, unassigned
  
  const navItems = [
    { path: '/manager', label: 'Dashboard', icon: 'performanceAnalytics', active: false },
    { path: '/manager/properties', label: 'Properties', icon: 'properties', active: false },
    { path: '/manager/leases', label: 'Leases', icon: 'lease', active: false },
    { path: '/manager/payments', label: 'Payments', icon: 'payment', active: false }
  ];

  const { data: maintenance, loading: maintenanceLoading, error: maintenanceError, refetch: refetchMaintenance } = useApi(
    () => maintenanceApi.getAll({}),
    []
  );

  // Use real data from API
  const maintenanceData = Array.isArray(maintenance) ? maintenance : [];

  // Get unique properties for filter
  const properties = [...new Set(maintenanceData.map(req => req.property))];

  // Simple caretaker options (1, 2, or 3)
  const caretakers = [
    { id: '1', name: 'Caretaker 1' },
    { id: '2', name: 'Caretaker 2' },
    { id: '3', name: 'Caretaker 3' }
  ];

  // Filter maintenance requests
  const getFilteredRequests = () => {
    return maintenanceData.filter(request => {
      const statusMatch = filterStatus === 'all' || request.status === filterStatus;
      const priorityMatch = filterPriority === 'all' || request.priority === filterPriority;
      const propertyMatch = filterProperty === 'all' || request.property === filterProperty;
      const assignmentMatch = filterAssignment === 'all' || 
        (filterAssignment === 'assigned' && request.assignedTo) ||
        (filterAssignment === 'unassigned' && !request.assignedTo);
      
      return statusMatch && priorityMatch && propertyMatch && assignmentMatch;
    });
  };

  const filteredRequests = getFilteredRequests();

  // Calculate statistics
  const pendingRequests = maintenanceData.filter(req => req.status === 'pending').length;
  const inProgressRequests = maintenanceData.filter(req => req.status === 'in_progress').length;
  const completedRequests = maintenanceData.filter(req => req.status === 'completed').length;
  const highPriorityRequests = maintenanceData.filter(req => req.priority === 'high' && req.status !== 'completed').length;
  const unassignedRequests = maintenanceData.filter(req => !req.assignedTo && req.status !== 'completed').length;
  
  const totalCost = maintenanceData
    .filter(req => req.status === 'completed' && req.actualCost)
    .reduce((sum, req) => sum + (Number(req.actualCost) || 0), 0);

  const avgResolutionTime = maintenanceData
    .filter(req => req.status === 'completed' && req.completedDate && req.createdAt)
    .reduce((sum, req) => {
      const created = new Date(req.createdAt).getTime();
      const completed = new Date(req.completedDate).getTime();
      return sum + (completed - created);
    }, 0) / (completedRequests || 1) || 0;

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setSelectedRequest(null);
    setShowDetails(false);
  };

  const handleAssignCaretaker = async (requestId: string) => {
    if (!selectedCaretaker) {
      alert('Please select a caretaker');
      return;
    }

    try {
      await maintenanceApi.update(requestId, {
        assignedTo: selectedCaretaker,
        status: 'in_progress'
      });
      await refetchMaintenance();
      setShowAssignModal(false);
      setSelectedCaretaker('');
      setSelectedRequest(null);
      alert('Caretaker assigned successfully');
    } catch (error) {
      console.error('Error assigning caretaker:', error);
      alert('Failed to assign caretaker. Please try again.');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this maintenance request? This action cannot be undone.')) {
      return;
    }

    try {
      await maintenanceApi.delete(requestId);
      await refetchMaintenance();
      setShowDetails(false);
      setSelectedRequest(null);
      alert('Maintenance request deleted successfully');
    } catch (error) {
      console.error('Error deleting maintenance request:', error);
      alert('Failed to delete maintenance request. Please try again.');
    }
  };

  const openAssignModal = (request: any) => {
    setSelectedRequest(request);
    setSelectedCaretaker(request.assignedTo || '');
    setShowAssignModal(true);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 font-semibold';
      case 'medium': return 'text-yellow-600 font-semibold';
      case 'low': return 'text-green-600 font-semibold';
      default: return 'text-gray-600';
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDuration = (milliseconds) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h`;
    }
    return '< 1h';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(Number(amount) || 0);
  };

  // Helper function to sort maintenance requests
  const sortRequests = (a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    const statusOrder = { pending: 3, in_progress: 2, completed: 1 };

    // Sort by priority first (high priority first)
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return -priorityDiff;

    // Then sort by status (pending first, then in progress, then completed)
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return -statusDiff;

    // Finally sort by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  };

  // Helper function to format status text
  const formatStatusText = (status) => {
    switch (status) {
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  // Component for individual maintenance request item
  const MaintenanceRequestItem = ({ request }) => (
    <div className="list-item">
      <div className="item-info">
        <div className="flex justify-between items-start">
          <h4>{request.title}</h4>
          <span className={`status-badge ${getStatusColor(request.status)}`}>
            {formatStatusText(request.status)}
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{request.description}</p>
        <div className="task-meta mt-2">
          <span className={`text-xs ${getPriorityColor(request.priority)}`}>
            {request.priority.toUpperCase()}
          </span>
          {request.property && (
            <>
              <br />
              <span className="text-xs text-gray-500">
                {request.property} {request.unit && `- ${request.unit}`}
              </span>
            </>
          )}
          <br />
          <span className="text-xs text-gray-500">
            Created: {formatDate(request.createdAt)}
          </span>
          <br />
          {request.assignedTo ? (
            <span className="text-xs text-blue-600">
              Assigned to: {request.assignedTo}
            </span>
          ) : (
            <span className="text-xs text-orange-600">
              Unassigned
            </span>
          )}
          {request.estimatedCost && (
            <>
              <br />
              <span className="text-xs text-blue-600">
                Est: {formatCurrency(request.estimatedCost)}
              </span>
            </>
          )}
        </div>
        
        {/* Action Buttons */}
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '13px', padding: '6px 12px' }}
            onClick={() => handleViewDetails(request)}
          >
            View Details
          </button>
          {request.status !== 'completed' && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontSize: '13px', padding: '6px 12px' }}
              onClick={() => openAssignModal(request)}
            >
              {request.assignedTo ? 'Reassign' : 'Assign'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (maintenanceLoading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
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

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Maintenance Requests</div>
          <div className="page-subtitle">
            Manage and track maintenance across all properties
            <button 
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                console.log('[ManagerMaintenancePage] Manual refresh triggered');
                refetchMaintenance();
              }}
              style={{ marginLeft: '12px', fontSize: '13px', padding: '4px 10px' }}
              title="Refresh maintenance requests"
            >
              Refresh
            </button>
          </div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={pendingRequests} label="Pending" />
          <StatCard value={inProgressRequests} label="In Progress" />
          <StatCard value={completedRequests} label="Completed" />
          <StatCard value={unassignedRequests} label="Unassigned" />
        </div>

        {/* Filters */}
        <div className="filter-section">
          <div className="filter-group">
            <label className="filter-label">Status:</label>
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Priority:</label>
            <select 
              className="filter-select"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Property:</label>
            <select 
              className="filter-select"
              value={filterProperty}
              onChange={(e) => setFilterProperty(e.target.value)}
            >
              <option value="all">All Properties</option>
              {properties.map(property => (
                <option key={property} value={property}>{property}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Assignment:</label>
            <select 
              className="filter-select"
              value={filterAssignment}
              onChange={(e) => setFilterAssignment(e.target.value)}
            >
              <option value="all">All Tasks</option>
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
            </select>
          </div>
        </div>

        {/* Maintenance Requests List */}
        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Maintenance Requests</div>
            <div className="text-sm text-gray-500">
              {filteredRequests.length} requests
            </div>
          </div>
          
          {filteredRequests.length === 0 ? (
            <div className="no-results">
              <p>No maintenance requests found</p>
            </div>
          ) : (
            filteredRequests
              .sort(sortRequests)
              .map((request) => <MaintenanceRequestItem key={request.id} request={request} />)
          )}
        </div>

        {/* Performance Summary */}
        <ChartCard title="Maintenance Performance">
          <div className="performance-stats">
            <div className="stat-row">
              <div className="stat-label">Total Completed:</div>
              <div className="stat-value">{completedRequests}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Average Resolution Time:</div>
              <div className="stat-value">{formatDuration(avgResolutionTime)}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Total Cost:</div>
              <div className="stat-value">{formatCurrency(totalCost)}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">High Priority Issues:</div>
              <div className="stat-value">{highPriorityRequests}</div>
            </div>
          </div>
        </ChartCard>
      </div>
      
      <BottomNav items={navItems} responsive={false} />

      {/* Details Modal */}
      {showDetails && selectedRequest && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Maintenance Request Details</h3>
              <button type="button" className="modal-close" onClick={handleCloseDetails}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h4>{selectedRequest.title}</h4>
                <span className={`status-badge ${getStatusColor(selectedRequest.status)}`}>
                  {formatStatusText(selectedRequest.status)}
                </span>
                <span className={`ml-2 text-sm ${getPriorityColor(selectedRequest.priority)}`}>
                  {selectedRequest.priority.toUpperCase()} Priority
                </span>
              </div>

              <div className="detail-section">
                <label>Description:</label>
                <p>{selectedRequest.description}</p>
              </div>

              <div className="detail-section">
                <label>Property & Unit:</label>
                <p>{selectedRequest.property} {selectedRequest.unit && `- Unit ${selectedRequest.unit}`}</p>
              </div>

              <div className="detail-section">
                <label>Assignment:</label>
                <p>{selectedRequest.assignedTo ? `Assigned to: ${selectedRequest.assignedTo}` : 'Unassigned'}</p>
              </div>

              <div className="detail-section">
                <label>Dates:</label>
                <p>Created: {formatDate(selectedRequest.createdAt)}</p>
                <p>Last Updated: {formatDate(selectedRequest.updatedAt)}</p>
                {selectedRequest.completedDate && (
                  <p>Completed: {formatDate(selectedRequest.completedDate)}</p>
                )}
              </div>

              {(selectedRequest.estimatedCost || selectedRequest.actualCost) && (
                <div className="detail-section">
                  <label>Costs:</label>
                  {selectedRequest.estimatedCost && (
                    <p>Estimated: {formatCurrency(selectedRequest.estimatedCost)}</p>
                  )}
                  {selectedRequest.actualCost && (
                    <p>Actual: {formatCurrency(selectedRequest.actualCost)}</p>
                  )}
                </div>
              )}

              {selectedRequest.notes && (
                <div className="detail-section">
                  <label>Notes:</label>
                  <p>{selectedRequest.notes}</p>
                </div>
              )}

              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div className="detail-section">
                  <label>Images:</label>
                  <div className="image-list">
                    {selectedRequest.images.map((image, idx) => (
                      <div key={idx} className="image-item">{image}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleDeleteRequest(selectedRequest.id)}
                style={{ 
                  background: '#dc3545', 
                  color: 'white', 
                  marginRight: 'auto',
                  whiteSpace: 'nowrap',
                  fontSize: '14px',
                  padding: '8px 12px'
                }}
              >
                Delete
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleCloseDetails}
                style={{ whiteSpace: 'nowrap' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{selectedRequest.assignedTo ? 'Reassign' : 'Assign'} Caretaker</h3>
              <button type="button" className="modal-close" onClick={() => setShowAssignModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>{selectedRequest.title}</h4>
                <p className="text-sm text-gray-600">{selectedRequest.property}</p>
                <span className={`status-badge ${getStatusColor(selectedRequest.status)}`}>
                  {selectedRequest.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              {selectedRequest.assignedTo && (
                <div style={{ 
                  padding: '10px', 
                  background: '#f0f9ff', 
                  borderRadius: '4px', 
                  marginBottom: '15px',
                  borderLeft: '3px solid #0ea5e9'
                }}>
                  <p className="text-sm">
                    <strong>Currently assigned to:</strong> {selectedRequest.assignedTo}
                  </p>
                </div>
              )}

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  Select Caretaker
                </label>
                <select
                  className="filter-select"
                  value={selectedCaretaker}
                  onChange={(e) => setSelectedCaretaker(e.target.value)}
                  style={{ width: '100%', padding: '10px', fontSize: '14px' }}
                >
                  <option value="">-- Select a caretaker --</option>
                  {caretakers.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ 
                padding: '10px', 
                background: '#f9fafb', 
                borderRadius: '4px',
                fontSize: '13px',
                color: '#6b7280'
              }}>
                <p style={{ marginBottom: '4px' }}>
                  <strong>Note:</strong> {selectedRequest.assignedTo ? 'Reassigning' : 'Assigning'} will:
                </p>
                <ul style={{ marginLeft: '20px', marginTop: '4px' }}>
                  <li>Change status to "In Progress"</li>
                  <li>Notify the selected caretaker</li>
                  {selectedRequest.assignedTo && (
                    <li>Notify the previous caretaker of reassignment</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedCaretaker('');
                }}
                style={{ whiteSpace: 'nowrap' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleAssignCaretaker(selectedRequest.id)}
                disabled={!selectedCaretaker}
                style={{ whiteSpace: 'nowrap', fontSize: '14px' }}
              >
                {selectedRequest.assignedTo ? 'Reassign' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerMaintenancePage;
