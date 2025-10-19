import { useState, useEffect } from 'react';
import TopNav from "../components/TopNav.tsx";
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import Icon from '../components/Icon.tsx';
import { maintenanceApi, useApi, formatDate } from '../services/api.ts';

function CaretakerTasksPage() {
  const [user, setUser] = useState<{ id?: string; fullName?: string; userType?: string } | null>(null);

  const { data: tasks, loading: tasksLoading, refetch: refetchTasks } = useApi(
    () => maintenanceApi.getAll({}),
    []
  );

  // Log tasks when they change
  useEffect(() => {
    console.log('[CaretakerTasksPage] Tasks updated:', {
      count: Array.isArray(tasks) ? tasks.length : 0,
      tasks: tasks
    });
  }, [tasks]);

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

  const tasksList = Array.isArray(tasks) ? tasks : [];

  const navItems = [
    { path: '/caretaker', label: 'Dashboard', icon: 'issue', active: false },
    { path: '/caretaker/tasks', label: 'Tasks', icon: 'issue', active: true },
    { path: '/caretaker/maintenance', label: 'Maintenance', icon: 'maintenance' },
    { path: '/caretaker/reports', label: 'Reports', icon: 'report' }
  ];

  const pendingCount = tasksList.filter((t: { status: string }) => t.status === 'pending').length;
  const inProgressCount = tasksList.filter((t: { status: string }) => t.status === 'in_progress').length;
  const completedCount = tasksList.filter((t: { status: string }) => t.status === 'completed').length;
  const overdueCount = tasksList.filter((t: { status: string; createdAt: string }) => 
    t.status === 'pending' && 
    new Date(t.createdAt) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const updateData: Record<string, unknown> = { 
        status: newStatus
      };
      
      if (user?.id) {
        updateData.assignedTo = user.id;
      }
      
      if (newStatus === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }
      
      await maintenanceApi.update(taskId, updateData);
      await refetchTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-progress';
      case 'completed': return 'status-paid';
      case 'overdue': return 'status-overdue';
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

  const isOverdue = (createdAt: string) => {
    return new Date(createdAt) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  };

  if (tasksLoading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton/>
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading tasks...</p>
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
          <div className="page-title">Maintenance Requests</div>
          <div className="page-subtitle">Property maintenance tasks</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={pendingCount} label="Pending" />
          <StatCard value={inProgressCount} label="In Progress" />
          <StatCard value={completedCount} label="Completed" />
          <StatCard value={overdueCount} label="Overdue (>7 days)" />
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">All Maintenance Requests</div>
          </div>
          
          {tasksList.length === 0 ? (
            <div className="empty-state">
              <p>No maintenance requests found</p>
            </div>
          ) : (
            tasksList.map((task: {
              id: string;
              title: string;
              description: string;
              property?: string;
              priority: string;
              status: string;
              createdAt: string;
              completedAt?: string;
            }) => (
              <div key={task.id} className="list-item">
                <div className="item-info">
                  <h4>{task.title}</h4>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <div className="task-meta">
                    <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()} PRIORITY
                    </span>
                    {task.property && (
                      <span className="text-xs text-gray-500">
                        {task.property}
                      </span>
                    )}
                    <span className={`text-xs ${isOverdue(task.createdAt) && task.status === 'pending' ? 'text-red-600' : 'text-gray-500'}`}>
                      Created: {formatDate(task.createdAt)}
                    </span>
                    {task.completedAt && (
                      <span className="text-xs text-green-600">
                        Completed: {formatDate(task.completedAt)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="item-actions">
                  <span className={`status-badge ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <div className="task-actions">
                    {task.status === 'pending' && (
                      <>
                        <button type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleStatusChange(task.id, 'in_progress')}
                        >
                          Start Work
                        </button>
                        <button type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => handleStatusChange(task.id, 'completed')}
                        >
                          Mark Complete
                        </button>
                      </>
                    )}
                    {task.status === 'in_progress' && (
                      <button type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => handleStatusChange(task.id, 'completed')}
                      >
                        Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <ChartCard title="Task Overview">
          <div className="task-stats">
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
            <div className="stat-item">
              <div className="stat-value">{overdueCount}</div>
              <div className="stat-label">Overdue</div>
            </div>
          </div>
        </ChartCard>

        <div className="quick-actions">
          <ActionCard
            onClick={() => {}}
            icon={<Icon name="properties" alt="Property Inspections" />}
            title="Property Inspections"
            description="Schedule and conduct inspections"
          />
          <ActionCard
            onClick={() => {}}
            icon={<Icon name="maintenance" alt="Maintenance Logs" />}
            title="Maintenance Logs"
            description="View maintenance history"
          />
          <ActionCard
            onClick={() => {}}
            icon={<Icon name="report" alt="Reports" />}
            title="Reports"
            description="Generate activity reports"
          />
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default CaretakerTasksPage;