import React, { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { tasksApi, maintenanceApi, useApi } from '../services/api.ts';

function CaretakerHistoryPage() {
  const { user } = useAuth();
  const [filterPeriod, setFilterPeriod] = useState('all'); // all, week, month, year
  const [filterStatus, setFilterStatus] = useState('all'); // all, completed, in_progress
  
  const navItems = [
    { path: '/caretaker', label: 'Tasks', icon: 'issue', active: false },
    { path: '/caretaker/schedule', label: 'Schedule', icon: 'report', active: false },
    { path: '/caretaker/history', label: 'History', icon: 'activityLog', active: true },
    { path: '/caretaker/profile', label: 'Profile', icon: 'profile', active: false }
  ];

  const { data: maintenance, loading: maintenanceLoading, error: maintenanceError, refetch: refetchMaintenance } = useApi(
    async () => {
      if (!user?.id) return [];

      const [assigned, unassigned] = await Promise.all([
        maintenanceApi.getAll({ assignedTo: user.id }),
        maintenanceApi.getAll({ status: 'pending' })
      ]);

      const assignedArray = Array.isArray(assigned) ? assigned : [];
      const unassignedArray = Array.isArray(unassigned) ? unassigned : [];

      const unassignedPending = unassignedArray.filter(req => !req.assignedTo);

      const assignedIds = new Set(assignedArray.map(r => r.id));
      const merged = [...assignedArray, ...unassignedPending.filter(r => !assignedIds.has(r.id))];

      return merged;
    },
    [user?.id]
  );

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      // #COMPLETION_DRIVE: When caretaker picks up work, assign it to them
      // #SUGGEST_VERIFY: Verify assignedTo is set to caretaker ID when starting work
      if (newStatus === 'in_progress') {
        updateData.assignedTo = user?.id;
      }
      await maintenanceApi.update(requestId, updateData);
      await refetchMaintenance();
      console.log(`[CaretakerHistoryPage] Updated request ${requestId} status to ${newStatus}`);
    } catch (error) {
      console.error('[CaretakerHistoryPage] Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this maintenance request?')) {
      return;
    }
    
    try {
      await maintenanceApi.delete(requestId);
      await refetchMaintenance();
      console.log(`[CaretakerHistoryPage] Deleted request ${requestId}`);
    } catch (error) {
      console.error('[CaretakerHistoryPage] Error deleting request:', error);
      alert('Failed to delete request. Please try again.');
    }
  };

  const getMockTasks = () => {
    return [
      {
        id: '1',
        title: 'Weekly property inspection',
        description: 'Routine inspection of common areas and exterior',
        property: 'Blue Hills Apartments',
        priority: 'medium',
        status: 'completed',
        dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 4,
        actualHours: 3.5,
        notes: 'Inspection completed successfully. No major issues found.'
      },
      {
        id: '2',
        title: 'AC repair - Unit 2A',
        description: 'Air conditioning not working properly',
        property: 'Blue Hills Apartments',
        priority: 'high',
        status: 'completed',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        completedDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 3,
        actualHours: 4,
        notes: 'Replaced compressor unit. AC now working perfectly.'
      },
      {
        id: '3',
        title: 'Pool cleaning',
        description: 'Weekly pool maintenance and chemical balancing',
        property: 'Sunset Towers',
        priority: 'medium',
        status: 'completed',
        dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        completedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 2,
        actualHours: 2,
        notes: 'Pool cleaned and chemicals balanced. Water quality optimal.'
      },
      {
        id: '4',
        title: 'Broken window repair',
        description: 'Bedroom window lock replacement',
        property: 'Green Valley Complex',
        priority: 'high',
        status: 'completed',
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 2,
        actualHours: 2.5,
        notes: 'Window lock replaced and window sealed properly.'
      },
      {
        id: '5',
        title: 'Garden maintenance',
        description: 'Trim hedges, water plants, and general landscaping',
        property: 'Green Valley Complex',
        priority: 'low',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 6,
        actualHours: 3,
        notes: 'Started trimming hedges. Weather permitting will complete tomorrow.'
      }
    ];
  };

  const getMockMaintenance = () => {
    return [
      {
        id: '1',
        title: 'Broken window',
        description: 'Bedroom window lock is broken, window cannot be closed properly',
        property: 'Green Valley Complex',
        unit: 'A1',
        priority: 'high',
        status: 'completed',
        assignedTo: user?.id,
        estimatedCost: 1200,
        actualCost: 1150,
        completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        images: ['broken_window_before.jpg', 'broken_window_after.jpg'],
        tenantId: 'tenant3',
        notes: 'Window lock replaced successfully. Tenant satisfied with the repair.'
      },
      {
        id: '2',
        title: 'Leaky faucet',
        description: 'Kitchen sink faucet is dripping continuously',
        property: 'Blue Hills Apartments',
        unit: '3C',
        priority: 'medium',
        status: 'completed',
        assignedTo: user?.id,
        estimatedCost: 800,
        actualCost: 750,
        completedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        images: ['faucet_before.jpg', 'faucet_after.jpg'],
        tenantId: 'tenant2',
        notes: 'Faucet washer replaced. No more leaks.'
      },
      {
        id: '3',
        title: 'Electrical issue',
        description: 'Light switch in living room not working',
        property: 'Green Valley Complex',
        unit: 'B2',
        priority: 'high',
        status: 'in_progress',
        assignedTo: user?.id,
        estimatedCost: 2000,
        actualCost: null,
        completedDate: null,
        images: ['light_switch.jpg'],
        tenantId: 'tenant4',
        notes: 'Diagnosed wiring issue. Waiting for parts to arrive.'
      }
    ];
  };

  const maintenanceData = Array.isArray(maintenance) ? maintenance : [];

  // Filter maintenance data based on selected filters
  const getFilteredData = () => {
    const now = new Date();
    let dateFilter = (_item: unknown) => true;

    switch (filterPeriod) {
      case 'week': {
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = (item: { completedDate?: string; createdAt?: string }) => 
          new Date(item.completedDate || item.createdAt || Date.now()) >= weekStart;
        break;
      }
      case 'month': {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        dateFilter = (item: { completedDate?: string; createdAt?: string }) => 
          new Date(item.completedDate || item.createdAt || Date.now()) >= monthStart;
        break;
      }
      case 'year': {
        const yearStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        dateFilter = (item: { completedDate?: string; createdAt?: string }) => 
          new Date(item.completedDate || item.createdAt || Date.now()) >= yearStart;
        break;
      }
      default: {
        break;
      }
    }

    const statusFilter = (item: { status: string }) => filterStatus === 'all' || item.status === filterStatus;

    return maintenanceData.filter(req => dateFilter(req) && statusFilter(req));
  };

  const filteredData = getFilteredData();

  const completedMaintenance = maintenanceData.filter(req => req.status === 'completed').length;
  const totalCompleted = completedMaintenance;
  
  const avgCompletionTime = (() => {
    const completed = maintenanceData.filter(req => 
      req.status === 'completed' && req.createdAt && req.completedDate
    );
    
    if (completed.length === 0) return 0;
    
    const totalTime = completed.reduce((sum, req) => {
      const created = new Date(req.createdAt).getTime();
      const completedTime = new Date(req.completedDate).getTime();
      const durationHours = (completedTime - created) / (1000 * 60 * 60);
      return sum + durationHours;
    }, 0);
    
    return Math.round(totalTime / completed.length);
  })();

  const totalCost = maintenanceData
    .filter(req => req.status === 'completed' && req.actualCost)
    .reduce((sum, req) => sum + (Number(req.actualCost) || 0), 0);

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
      case 'completed': return 'status-paid';
      case 'in_progress': return 'status-progress';
      case 'pending': return 'status-pending';
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

  const loading = maintenanceLoading;

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your history...</p>
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
          <div className="page-title">Work History</div>
          <div className="page-subtitle">Completed tasks and maintenance records</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={totalCompleted} label="Completed" />
          <StatCard value={maintenanceData.length} label="Total" />
          <StatCard value={maintenanceData.filter(r => r.status === 'pending').length} label="Pending" />
          <StatCard value={maintenanceData.filter(r => r.status === 'in_progress').length} label="In Progress" />
        </div>

        {/* Filters */}
        <div className="filter-section">
          <div className="filter-group">
            <label className="filter-label">Period:</label>
            <select 
              className="filter-select"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Status:</label>
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* All Maintenance Requests */}
        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Maintenance Requests</div>
            <div className="text-sm text-gray-500">
              {filteredData.length} requests
            </div>
          </div>
          
          {filteredData.length === 0 ? (
            <div className="no-results">
              <p>No maintenance records found</p>
            </div>
          ) : (
            filteredData
              .sort((a: { completedDate?: string; createdAt?: string }, b: { completedDate?: string; createdAt?: string }) => 
                new Date(b.completedDate || b.createdAt || Date.now()).getTime() - 
                new Date(a.completedDate || a.createdAt || Date.now()).getTime()
              )
              .map((request: {
                id: string;
                title: string;
                description: string;
                status: string;
                priority: string;
                property?: string;
                unit?: string;
                createdAt?: string;
                completedDate?: string;
                actualCost?: number;
                notes?: string;
                images?: string[];
              }) => (
                <div key={request.id} className="list-item">
                  <div className="item-info">
                    <div className="flex justify-between items-start">
                      <h4>{request.title}</h4>
                      <span className={`status-badge ${getStatusColor(request.status)}`}>
                        {request.status === 'completed' ? 'Completed' : 
                         request.status === 'in_progress' ? 'In Progress' : 'Pending'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                    <div className="task-meta mt-2">
                      <span className={`text-xs ${getPriorityColor(request.priority)}`}>
                        {request.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {request.property} - {request.unit}
                      </span>
                      <span className="text-xs text-gray-500">
                        {request.completedDate ? 
                          `Completed: ${formatDate(request.completedDate)}` : 
                          `Created: ${formatDate(request.createdAt)}`}
                      </span>
                      {request.actualCost && (
                        <span className="text-xs text-green-600 font-semibold">
                          {formatCurrency(request.actualCost)}
                        </span>
                      )}
                    </div>
                    {request.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <strong>Notes:</strong> {request.notes}
                      </div>
                    )}
                    {request.images && request.images.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-blue-600">
                          {request.images.length} image(s) attached
                        </span>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div style={{ 
                      marginTop: '12px', 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
                      gap: '8px' 
                    }}>
                      {request.status === 'pending' && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ fontSize: '13px', padding: '6px 12px' }}
                          onClick={() => handleStatusChange(request.id, 'in_progress')}
                        >
                          Start Work
                        </button>
                      )}
                      {request.status === 'in_progress' && (
                        <button
                          type="button"
                          className="btn btn-success"
                          style={{ fontSize: '13px', padding: '6px 12px' }}
                          onClick={() => handleStatusChange(request.id, 'completed')}
                        >
                          Complete
                        </button>
                      )}
                      {request.status === 'completed' && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '13px', padding: '6px 12px' }}
                          onClick={() => handleStatusChange(request.id, 'pending')}
                        >
                          Re-open
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ fontSize: '13px', padding: '6px 12px' }}
                        onClick={() => handleDeleteRequest(request.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Performance Summary */}
        <ChartCard title="Summary">
          <div className="performance-stats">
            <div className="stat-row">
              <div className="stat-label">Total Requests:</div>
              <div className="stat-value">{maintenanceData.length}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Completed:</div>
              <div className="stat-value">{completedMaintenance}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">In Progress:</div>
              <div className="stat-value">{maintenanceData.filter(r => r.status === 'in_progress').length}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Pending:</div>
              <div className="stat-value">{maintenanceData.filter(r => r.status === 'pending').length}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Completion Rate:</div>
              <div className="stat-value">
                {maintenanceData.length > 0 ? Math.round((completedMaintenance / maintenanceData.length) * 100) : 0}%
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default CaretakerHistoryPage;
