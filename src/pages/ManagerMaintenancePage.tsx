import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { maintenanceApi, useApi } from '../services/api.ts';

function ManagerMaintenancePage() {
  const [user, setUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, in_progress, completed
  const [filterPriority, setFilterPriority] = useState('all'); // all, high, medium, low
  const [filterProperty, setFilterProperty] = useState('all'); // all properties
  
  const navItems = [
    { path: '/manager', label: 'Dashboard', active: false },
    { path: '/manager/properties', label: 'Properties', active: false },
    { path: '/manager/leases', label: 'Leases', active: false },
    { path: '/manager/payments', label: 'Payments', active: false }
  ];

  const { data: maintenance, loading: maintenanceLoading, error: maintenanceError } = useApi(
    () => maintenanceApi.getAll({}),
    []
  );

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      const userRaw = localStorage.getItem('briconomy_user');
      const userData = userRaw ? JSON.parse(userRaw) : null;
      setUser(userData);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };
// filler data
  const getMockMaintenance = () => {
    return [
      {
        id: '1',
        title: 'AC repair',
        description: 'Air conditioning not working properly, making strange noises and not cooling effectively',
        property: 'Blue Hills Apartments',
        unit: '2A',
        priority: 'high',
        status: 'in_progress',
        assignedTo: 'caretaker1',
        tenantId: 'tenant1',
        estimatedCost: 1500,
        actualCost: null,
        completedDate: null,
        images: ['ac_unit_1.jpg', 'ac_unit_2.jpg'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Diagnosed compressor issue. Waiting for replacement part.'
      },
      {
        id: '2',
        title: 'Leaky faucet',
        description: 'Kitchen sink faucet is dripping continuously, wasting water and increasing utility bills',
        property: 'Blue Hills Apartments',
        unit: '3C',
        priority: 'medium',
        status: 'pending',
        assignedTo: null,
        tenantId: 'tenant2',
        estimatedCost: 800,
        actualCost: null,
        completedDate: null,
        images: ['faucet_leak.jpg'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: ''
      },
      {
        id: '3',
        title: 'Broken window',
        description: 'Bedroom window lock is broken, window cannot be closed properly',
        property: 'Green Valley Complex',
        unit: 'A1',
        priority: 'high',
        status: 'completed',
        assignedTo: 'caretaker1',
        tenantId: 'tenant3',
        estimatedCost: 1200,
        actualCost: 1150,
        completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        images: ['broken_window_before.jpg', 'broken_window_after.jpg'],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Window lock replaced successfully. Tenant satisfied with the repair.'
      },
      {
        id: '4',
        title: 'Electrical issue',
        description: 'Light switch in living room is not working, seems to be a wiring problem',
        property: 'Green Valley Complex',
        unit: 'B2',
        priority: 'high',
        status: 'in_progress',
        assignedTo: 'caretaker2',
        tenantId: 'tenant4',
        estimatedCost: 2000,
        actualCost: null,
        completedDate: null,
        images: ['light_switch.jpg'],
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Diagnosed wiring issue. Waiting for parts to arrive.'
      },
      {
        id: '5',
        title: 'Dishwasher not draining',
        description: 'Dishwasher is not draining properly, water pooling at bottom',
        property: 'Sunset Towers',
        unit: 'P1',
        priority: 'medium',
        status: 'pending',
        assignedTo: null,
        tenantId: 'tenant5',
        estimatedCost: 1000,
        actualCost: null,
        completedDate: null,
        images: ['dishwasher_issue.jpg'],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        notes: ''
      }
    ];
  };

  const useMockData = maintenanceError || !maintenance;
  const mockMaintenance = getMockMaintenance();
  const maintenanceData = Array.isArray(maintenance) ? maintenance : (useMockData ? mockMaintenance : []);

  // Get unique properties for filter
  const properties = [...new Set(maintenanceData.map(req => req.property))];

  // Filter maintenance requests
  const getFilteredRequests = () => {
    return maintenanceData.filter(request => {
      const statusMatch = filterStatus === 'all' || request.status === filterStatus;
      const priorityMatch = filterPriority === 'all' || request.priority === filterPriority;
      const propertyMatch = filterProperty === 'all' || request.property === filterProperty;
      return statusMatch && priorityMatch && propertyMatch;
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

  const handleAssignRequest = (requestId) => {
    // In a real app, this would open a modal to assign to a caretaker
    console.log(`Assigning request ${requestId} to caretaker`);
    alert('Assignment functionality would be implemented here');
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setShowDetails(true);
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

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          <br />
          {request.estimatedCost && (
            <span className="text-xs text-blue-600">
              Est: {formatCurrency(request.estimatedCost)}
            </span>
          )}
        </div>
      </div>
      <div className="item-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', marginTop: '8px' }}>
        <button 
          className="btn btn-sm btn-secondary"
          style={{ minWidth: '110px', fontSize: '1rem' }}
          onClick={() => handleViewDetails(request)}
          type="button"
        >
          View Details
        </button>
        {!request.assignedTo && request.status !== 'completed' && (
          <button 
            className="btn btn-sm btn-primary"
            style={{ minWidth: '110px', fontSize: '1rem' }}
            onClick={() => handleAssignRequest(request.id)}
            type="button"
          >
            Assign
          </button>
        )}
      </div>
    </div>
  );

  if (maintenanceLoading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout={true} showBackButton={true} />
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
      <TopNav showLogout={true} showBackButton={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Maintenance Issues</div>
          <div className="page-subtitle">Manage and track maintenance across all properties</div>
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
    </div>
  );
}

export default ManagerMaintenancePage;
