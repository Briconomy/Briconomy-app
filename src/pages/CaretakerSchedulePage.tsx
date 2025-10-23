import React, { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { maintenanceApi, useApi } from '../services/api.ts';

function CaretakerSchedulePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); // day, week, month
  
  const navItems = [
    { path: '/caretaker', label: 'Tasks', icon: 'issue', active: false },
    { path: '/caretaker/schedule', label: 'Schedule', icon: 'report', active: true },
    { path: '/caretaker/history', label: 'History', icon: 'activityLog', active: false },
    { path: '/caretaker/profile', label: 'Profile', icon: 'profile', active: false }
  ];

  const { data: tasks, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useApi(
    () => maintenanceApi.getAll(user?.id ? { assignedTo: user.id } : {}),
    [user?.id]
  );

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    try {
      await maintenanceApi.update(requestId, { status: newStatus });
      await refetchTasks();
      console.log(`[CaretakerSchedulePage] Updated request ${requestId} status to ${newStatus}`);
    } catch (error) {
      console.error('[CaretakerSchedulePage] Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this maintenance request?')) {
      return;
    }
    
    try {
      await maintenanceApi.delete(requestId);
      await refetchTasks();
      console.log(`[CaretakerSchedulePage] Deleted request ${requestId}`);
    } catch (error) {
      console.error('[CaretakerSchedulePage] Error deleting request:', error);
      alert('Failed to delete request. Please try again.');
    }
  };

  // Use real maintenance request data from API
  const tasksData = Array.isArray(tasks) ? tasks : [];

  // #COMPLETION_DRIVE: Filter tasks by dueDate; handle null dates from existing records
  // #SUGGEST_VERIFY: Verify backward compatibility with maintenance requests without dueDate
  const getFilteredTasks = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return tasksData.filter(task => {
      if (!task.dueDate) return false;

      const taskDate = new Date(task.dueDate);

      switch (viewMode) {
        case 'day':
          return taskDate.toDateString() === selectedDate.toDateString();
        case 'week':
          return taskDate >= today && taskDate <= weekEnd;
        case 'month':
          return taskDate >= today && taskDate <= monthEnd;
        default:
          return true;
      }
    });
  };

  const filteredTasks = getFilteredTasks();
  
  const todayTasks = tasksData.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    const today = new Date();
    return taskDate.toDateString() === today.toDateString();
  }).length;

  const thisWeekTasks = tasksData.filter(task => {
    if (!task.dueDate) return false;
    const taskDate = new Date(task.dueDate);
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    return taskDate >= weekStart && taskDate <= weekEnd;
  }).length;

  const overdueTasks = tasksData.filter(task => {
    if (!task.dueDate) return false;
    return task.status === 'pending' && new Date(task.dueDate) < new Date();
  }).length;

  const totalEstimatedHours = tasksData
    .filter(task => task.status !== 'completed')
    .reduce((sum, task) => sum + (task.estimatedHours || 0), 0);

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
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOverdue = (dueDate, status) => {
    return status === 'pending' && new Date(dueDate) < new Date();
  };

  if (tasksLoading) {
    return (
      <div className="app-container mobile-only">
<TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your schedule...</p>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton/>
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">My Schedule</div>
          <div className="page-subtitle">Task calendar and planning</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={todayTasks} label="Today" />
          <StatCard value={thisWeekTasks} label="This Week" />
          <StatCard value={overdueTasks} label="Overdue" />
          <StatCard value={`${totalEstimatedHours}h`} label="Hours" />
        </div>

        {/* View Mode Selector */}
        <div className="view-mode-selector">
          <button 
            type="button"
            className={`btn btn-sm ${viewMode === 'day' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('day')}
          >
            Day
          </button>
          <button 
            type="button"
            className={`btn btn-sm ${viewMode === 'week' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('week')}
          >
            Week
          </button>
          <button 
            type="button"
            className={`btn btn-sm ${viewMode === 'month' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('month')}
          >
            Month
          </button>
        </div>

        {/* Schedule List */}
        <div className="data-table">
          <div className="table-header">
            <div className="table-title">
              {viewMode === 'day' ? 'Today\'s Schedule' : 
               viewMode === 'week' ? 'This Week' : 'This Month'}
            </div>
            <div className="text-sm text-gray-500">
              {filteredTasks.length} tasks
            </div>
          </div>
          
          {filteredTasks.length === 0 ? (
            <div className="no-results">
              <p>No tasks scheduled for this period</p>
            </div>
          ) : (
            filteredTasks
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map((task) => (
                <div key={task.id} className="list-item">
                  <div className="item-info">
                    <div className="flex justify-between items-start">
                      <h4 className={isOverdue(task.dueDate, task.status) ? 'text-red-600' : ''}>
                        {task.title}
                      </h4>
                      <span className={`status-badge ${getStatusColor(task.status)}`}>
                        {task.status === 'in_progress' ? 'In Progress' : 
                         task.status === 'pending' ? 'Scheduled' :
                         task.status === 'completed' ? 'Completed' : task.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <div className="task-meta mt-2">
                      <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {task.property}
                      </span><br />
                      <span className="text-xs text-gray-500">
                        {formatDate(task.dueDate)} at {formatTime(task.dueDate)}
                      </span>
                      {task.estimatedHours && (
                        <><br /><span className="text-xs text-blue-600">
                          ~{task.estimatedHours}h
                        </span></>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div style={{ 
                      marginTop: '12px', 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
                      gap: '8px' 
                    }}>
                      {task.status === 'pending' && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ fontSize: '13px', padding: '6px 12px' }}
                          onClick={() => handleStatusChange(task.id, 'in_progress')}
                        >
                          Start Work
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <button
                          type="button"
                          className="btn btn-success"
                          style={{ fontSize: '13px', padding: '6px 12px' }}
                          onClick={() => handleStatusChange(task.id, 'completed')}
                        >
                          Complete
                        </button>
                      )}
                      {task.status === 'completed' && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '13px', padding: '6px 12px' }}
                          onClick={() => handleStatusChange(task.id, 'pending')}
                        >
                          Reopen
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ fontSize: '13px', padding: '6px 12px' }}
                        onClick={() => handleDeleteRequest(task.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>

          {/* Upcoming Deadlines - Inline Style */}
          <div className="data-table" style={{ marginTop: '2rem' }}>
            <div className="table-header">
              <div className="table-title">Upcoming Deadlines</div>
              <div className="text-sm text-gray-500">
                {tasksData.filter(task => task.status !== 'completed').length} tasks
              </div>
            </div>
            {tasksData
              .filter(task => task.status !== 'completed')
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .slice(0, 5)
              .map((task) => (
                <div key={task.id} className="list-item">
                  <div className="item-info">
                    <div className="flex justify-between items-start">
                      <h4 className={isOverdue(task.dueDate, task.status) ? 'text-red-600' : ''}>
                        {task.title}
                      </h4>
                      <span className={`status-badge ${getStatusColor(task.status)}`}>
                        {task.status === 'in_progress' ? 'In Progress' : 
                         task.status === 'pending' ? 'Scheduled' :
                         task.status === 'completed' ? 'Completed' : task.status}
                      </span>
                    </div>
                    <div className="task-meta mt-2">
                      <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {task.property}
                      </span><br />
                      <span className="text-xs text-gray-500">
                        {formatDate(task.dueDate)} at {formatTime(task.dueDate)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{
                      marginTop: '12px',
                      display: 'flex',
                      gap: '8px'
                    }}>
                      {task.status === 'pending' && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ flex: '1' }}
                          onClick={() => handleStatusChange(task.id, 'in_progress')}
                        >
                          Start Work
                        </button>
                      )}
                      {task.status === 'in_progress' && (
                        <button
                          type="button"
                          className="btn btn-success"
                          style={{ flex: '1' }}
                          onClick={() => handleStatusChange(task.id, 'completed')}
                        >
                          Complete
                        </button>
                      )}
                      {task.status === 'completed' && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ flex: '1' }}
                          onClick={() => handleStatusChange(task.id, 'pending')}
                        >
                          Reopen
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-danger"
                        style={{ flex: '1' }}
                        onClick={() => handleDeleteRequest(task.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default CaretakerSchedulePage;
