import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { tasksApi, maintenanceApi, useApi } from '../services/api.ts';

function CaretakerHistoryPage() {
  const [user, setUser] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState('all'); // all, week, month, year
  const [filterStatus, setFilterStatus] = useState('all'); // all, completed, in_progress
  
  const navItems = [
    { path: '/caretaker', label: 'Tasks', active: false },
    { path: '/caretaker/schedule', label: 'Schedule', active: false },
    { path: '/caretaker/history', label: 'History', active: true },
    { path: '/caretaker/profile', label: 'Profile', active: false }
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
    } catch (err) {
      console.error('Error loading user data:', err);
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

  const useMockTasksData = tasksError || !tasks;
  const useMockMaintenanceData = maintenanceError || !maintenance;
  
  const mockTasks = getMockTasks();
  const mockMaintenance = getMockMaintenance();
  
  const tasksData = Array.isArray(tasks) ? tasks : (useMockTasksData ? mockTasks : []);
  const maintenanceData = Array.isArray(maintenance) ? maintenance : (useMockMaintenanceData ? mockMaintenance : []);

  // Filter data based on selected filters
  const getFilteredData = () => {
    const now = new Date();
    let dateFilter = (item) => true;

    switch (filterPeriod) {
      case 'week':
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = (item) => new Date(item.completedDate || item.createdAt) >= weekStart;
        break;
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        dateFilter = (item) => new Date(item.completedDate || item.createdAt) >= monthStart;
        break;
      case 'year':
        const yearStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        dateFilter = (item) => new Date(item.completedDate || item.createdAt) >= yearStart;
        break;
      default:
        break;
    }

    const statusFilter = (item) => filterStatus === 'all' || item.status === filterStatus;

    return {
      tasks: tasksData.filter(task => dateFilter(task) && statusFilter(task)),
      maintenance: maintenanceData.filter(req => dateFilter(req) && statusFilter(req))
    };
  };

  const filteredData = getFilteredData();

  // Calculate statistics
  const completedTasks = tasksData.filter(task => task.status === 'completed').length;
  const completedMaintenance = maintenanceData.filter(req => req.status === 'completed').length;
  const totalCompleted = completedTasks + completedMaintenance;
  
  const avgCompletionTime = tasksData
    .filter(task => task.status === 'completed' && task.completedDate && task.dueDate)
    .reduce((sum, task) => {
      const due = new Date(task.dueDate).getTime();
      const completed = new Date(task.completedDate).getTime();
      return sum + (completed - due);
    }, 0) / completedTasks || 0;

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

  const loading = tasksLoading || maintenanceLoading;

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout={true} />
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
      <TopNav showLogout={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Work History</div>
          <div className="page-subtitle">Completed tasks and maintenance records</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={totalCompleted} label="Completed" />
          <StatCard value={formatDuration(avgCompletionTime)} label="Avg Time" />
          <StatCard value={formatCurrency(totalCost)} label="Total Cost" />
          <StatCard value={`${Math.round((completedTasks / Math.max(completedTasks, 1)) * 100)}%`} label="Success" />
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
            </select>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Completed Tasks</div>
            <div className="text-sm text-gray-500">
              {filteredData.tasks.length} tasks
            </div>
          </div>
          
          {filteredData.tasks.length === 0 ? (
            <div className="no-results">
              <p>No completed tasks found</p>
            </div>
          ) : (
            filteredData.tasks
              .sort((a, b) => new Date(b.completedDate || b.createdAt) - new Date(a.completedDate || a.createdAt))
              .map((task) => (
                <div key={task.id} className="list-item">
                  <div className="item-info">
                    <div className="flex justify-between items-start">
                      <h4>{task.title}</h4>
                      <span className={`status-badge ${getStatusColor(task.status)}`}>
                        {task.status === 'completed' ? 'Completed' : 
                         task.status === 'in_progress' ? 'In Progress' : task.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <div className="task-meta mt-2">
                      <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {task.property}
                      </span>
                      <span className="text-xs text-gray-500">
                        Completed: {task.completedDate ? formatDate(task.completedDate) : 'N/A'}
                      </span>
                      {task.estimatedHours && task.actualHours && (
                        <span className="text-xs text-blue-600">
                          {task.actualHours}h / {task.estimatedHours}h
                        </span>
                      )}
                    </div>
                    {task.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <strong>Notes:</strong> {task.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Maintenance History */}
        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Maintenance History</div>
            <div className="text-sm text-gray-500">
              {filteredData.maintenance.length} requests
            </div>
          </div>
          
          {filteredData.maintenance.length === 0 ? (
            <div className="no-results">
              <p>No maintenance records found</p>
            </div>
          ) : (
            filteredData.maintenance
              .sort((a, b) => new Date(b.completedDate || b.createdAt) - new Date(a.completedDate || a.createdAt))
              .map((request) => (
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
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Performance Summary */}
        <ChartCard title="Performance Summary">
          <div className="performance-stats">
            <div className="stat-row">
              <div className="stat-label">Total Tasks Completed:</div>
              <div className="stat-value">{completedTasks}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Maintenance Requests Completed:</div>
              <div className="stat-value">{completedMaintenance}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Average Completion Time:</div>
              <div className="stat-value">{formatDuration(avgCompletionTime)}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Total Maintenance Cost:</div>
              <div className="stat-value">{formatCurrency(totalCost)}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">Success Rate:</div>
              <div className="stat-value">
                {Math.round((completedTasks / Math.max(completedTasks, 1)) * 100)}%
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
