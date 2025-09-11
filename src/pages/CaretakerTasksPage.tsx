import React, { useState } from 'react';
import TopNav from "../components/TopNav.tsx";
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';

function CaretakerTasksPage() {
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Weekly property inspection',
      description: 'Routine inspection of common areas and exterior',
      property: 'Blue Hills Apartments',
      priority: 'medium',
      status: 'pending',
      dueDate: '2024-09-10',
      createdAt: '2024-09-03'
    },
    {
      id: '2',
      title: 'AC repair - Unit 2A',
      description: 'Air conditioning not working properly, making strange noises',
      property: 'Blue Hills Apartments',
      priority: 'high',
      status: 'in_progress',
      dueDate: '2024-09-05',
      createdAt: '2024-08-25'
    },
    {
      id: '3',
      title: 'Pool cleaning',
      description: 'Weekly pool maintenance and chemical balancing',
      property: 'Blue Hills Apartments',
      priority: 'medium',
      status: 'pending',
      dueDate: '2024-09-04',
      createdAt: '2024-09-02'
    },
    {
      id: '4',
      title: 'Garden maintenance',
      description: 'Trim hedges, water plants, and general landscaping',
      property: 'Green Valley Complex',
      priority: 'low',
      status: 'completed',
      dueDate: '2024-09-01',
      createdAt: '2024-08-28',
      completedAt: '2024-09-01'
    }
  ]);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const navItems = [
    { path: '/caretaker', label: 'Dashboard', active: false },
    { path: '/caretaker/tasks', label: 'Tasks', active: true },
    { path: '/caretaker/maintenance', label: 'Maintenance' },
    { path: '/caretaker/reports', label: 'Reports' }
  ];

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const overdueCount = tasks.filter(t => t.status === 'pending' && new Date(t.dueDate) < new Date()).length;

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined
          }
        : task
    ));
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

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">My Tasks</div>
          <div className="page-subtitle">Property maintenance and inspections</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={pendingCount} label="Pending" />
          <StatCard value={inProgressCount} label="In Progress" />
          <StatCard value={completedCount} label="Completed" />
          <StatCard value={overdueCount} label="Overdue" />
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Assigned Tasks</div>
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => setShowTaskForm(true)}
            >
              New Task
            </button>
          </div>
          
          {tasks.map((task) => (
            <div key={task.id} className="list-item">
              <div className="item-info">
                <h4>{task.title}</h4>
                <p className="text-sm text-gray-600">{task.description}</p>
                <div className="task-meta">
                  <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {task.property}
                  </span>
                  <span className={`text-xs ${isOverdue(task.dueDate) && task.status === 'pending' ? 'text-red-600' : 'text-gray-500'}`}>
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="item-actions">
                <span className={`status-badge ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ').toUpperCase()}
                </span>
                <div className="task-actions">
                  {task.status === 'pending' && (
                    <>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => handleStatusChange(task.id, 'in_progress')}
                      >
                        Start
                      </button>
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => handleStatusChange(task.id, 'completed')}
                      >
                        Complete
                      </button>
                    </>
                  )}
                  {task.status === 'in_progress' && (
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => handleStatusChange(task.id, 'completed')}
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
            icon="I"
            title="Property Inspections"
            description="Schedule and conduct inspections"
          />
          <ActionCard
            onClick={() => {}}
            icon="M"
            title="Maintenance Logs"
            description="View maintenance history"
          />
          <ActionCard
            onClick={() => {}}
            icon="R"
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