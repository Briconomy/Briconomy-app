import { useState, useEffect } from 'react';
import TopNav from "../components/TopNav.tsx";
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import Icon from '../components/Icon.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { maintenanceApi, useApi, formatDate } from '../services/api.ts';

interface MaintenanceTask {
  id: string;
  title: string;
  description: string;
  property?: string;
  location?: string;
  unitNumber?: string;
  priority: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  assignedTo?: string;
  photos?: string[];
  repairPhotos?: string[];
  comments?: Array<{
    author: string;
    authorId?: string;
    text: string;
    timestamp: string;
  }>;
}

function CaretakerTasksPage() {
  const { user } = useAuth();
  const [selectedTask, setSelectedTask] = useState<MaintenanceTask | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [comment, setComment] = useState('');
  const [repairPhotos, setRepairPhotos] = useState<File[]>([]);

  // #COMPLETION_DRIVE: Fetch assigned requests + unassigned pending requests
  // #SUGGEST_VERIFY: Verify unassigned pending requests are properly filtered
  const { data: tasks, loading: tasksLoading, refetch: refetchTasks } = useApi(
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

  // Log tasks when they change
  useEffect(() => {
    console.log('[CaretakerTasksPage] Tasks updated:', {
      count: Array.isArray(tasks) ? tasks.length : 0,
      tasks: tasks
    });
  }, [tasks]);

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
      
      if (user?.id && newStatus === 'in_progress') {
        // #COMPLETION_DRIVE: Only assign to caretaker when starting work
        // #SUGGEST_VERIFY: Ensure assignedTo is set to ObjectId, not name
        updateData.assignedTo = user.id;
      }
      
      if (newStatus === 'completed') {
        updateData.completedAt = new Date().toISOString();
        
        if (repairPhotos.length > 0) {
          updateData.repairPhotos = repairPhotos.map(f => f.name);
        }
      }

      if (comment.trim()) {
        const existingComments = selectedTask?.comments || [];
        updateData.comments = [
          ...existingComments,
          {
            author: user?.fullName || 'Caretaker',
            authorId: user?.id,
            text: comment,
            timestamp: new Date().toISOString()
          }
        ];
      }
      
      await maintenanceApi.update(taskId, updateData);
      await refetchTasks();
      
      setShowDetailsModal(false);
      setComment('');
      setRepairPhotos([]);
      setSelectedTask(null);
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this maintenance request? This action cannot be undone.')) {
      return;
    }

    try {
      await maintenanceApi.delete(taskId);
      await refetchTasks();
      setShowDetailsModal(false);
      setSelectedTask(null);
      alert('Maintenance request deleted successfully');
    } catch (error) {
      console.error('Error deleting maintenance request:', error);
      alert('Failed to delete maintenance request. Please try again.');
    }
  };

  const handleRepairPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newPhotos = Array.from(files).slice(0, 5 - repairPhotos.length);
    setRepairPhotos(prev => [...prev, ...newPhotos]);
  };

  const removeRepairPhoto = (index: number) => {
    setRepairPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const openTaskDetails = (task: MaintenanceTask) => {
    setSelectedTask(task);
    setShowDetailsModal(true);
    setComment('');
    setRepairPhotos([]);
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
            tasksList.map((task: MaintenanceTask) => (
              <div key={task.id} className="list-item">
                <div className="item-info">
                  <h4>{task.title}</h4>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <div className="task-meta">
                    <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()} PRIORITY
                    </span>
                    {task.location && (
                      <>
                        <br />
                        <span className="text-xs text-blue-600">
                           {task.location} {task.unitNumber && `- Unit ${task.unitNumber}`}
                        </span>
                      </>
                    )}
                    {task.property && (
                      <span className="text-xs text-gray-500">
                        {task.property}
                      </span>
                    )}
                    <span className={`text-xs ${isOverdue(task.createdAt) && task.status === 'pending' ? 'text-red-600' : 'text-gray-500'}`}>
                      Created: {formatDate(task.createdAt)}
                    </span>
                    {task.assignedTo && (
                      <>
                        <br />
                        <span className="text-xs text-purple-600">
                           Assigned: {task.assignedTo}
                        </span>
                      </>
                    )}
                    {task.photos && task.photos.length > 0 && (
                      <>
                        <br />
                        <span className="text-xs text-green-600">
                           {task.photos.length} photo{task.photos.length > 1 ? 's' : ''}
                        </span>
                      </>
                    )}
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
                    <button type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={() => openTaskDetails(task)}
                      style={{ marginTop: '8px' }}
                    >
                      View Details
                    </button>
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
                          onClick={() => {
                            setSelectedTask(task);
                            setShowDetailsModal(true);
                          }}
                        >
                          Mark Complete
                        </button>
                      </>
                    )}
                    {task.status === 'in_progress' && (
                      <button type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setSelectedTask(task);
                          setShowDetailsModal(true);
                        }}
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
      
      {showDetailsModal && selectedTask && (
        <div className="modal-overlay" onClick={() => {
          setShowDetailsModal(false);
          setComment('');
          setRepairPhotos([]);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Task Details</h3>
              <button type="button" className="modal-close" onClick={() => {
                setShowDetailsModal(false);
                setComment('');
                setRepairPhotos([]);
              }}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '20px' }}>
                <h4>{selectedTask.title}</h4>
                <p className="text-sm text-gray-600">{selectedTask.description}</p>
                <div style={{ marginTop: '10px' }}>
                  <span className={`status-badge ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`text-xs ${getPriorityColor(selectedTask.priority)}`} style={{ marginLeft: '8px' }}>
                    {selectedTask.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                {selectedTask.location && (
                  <p className="text-sm text-blue-600" style={{ marginTop: '8px' }}>
                     {selectedTask.location} {selectedTask.unitNumber && `- Unit ${selectedTask.unitNumber}`}
                  </p>
                )}
                {selectedTask.assignedTo && (
                  <p className="text-sm text-purple-600">
                     Assigned to: {selectedTask.assignedTo}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  Created: {formatDate(selectedTask.createdAt)}
                </p>
                {selectedTask.completedAt && (
                  <p className="text-sm text-green-600">
                    Completed: {formatDate(selectedTask.completedAt)}
                  </p>
                )}
              </div>

              {selectedTask.photos && selectedTask.photos.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h5>Issue Photos ({selectedTask.photos.length})</h5>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {selectedTask.photos.map((photo: string, idx: number) => (
                      <div key={idx} style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        background: '#f9f9f9'
                      }}>
                        <span className="text-xs">{photo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.comments && selectedTask.comments.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h5>Comments ({selectedTask.comments.length})</h5>
                  <div style={{ marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {selectedTask.comments.map((c, idx: number) => (
                      <div key={idx} style={{
                        padding: '10px',
                        marginBottom: '8px',
                        background: '#f5f5f5',
                        borderRadius: '4px',
                        borderLeft: '3px solid #007bff'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <strong className="text-sm">{c.author}</strong>
                          <span className="text-xs text-gray-500">{formatDate(c.timestamp)}</span>
                        </div>
                        <p className="text-sm">{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTask.repairPhotos && selectedTask.repairPhotos.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <h5>Repair Photos ({selectedTask.repairPhotos.length})</h5>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {selectedTask.repairPhotos.map((photo: string, idx: number) => (
                      <div key={idx} style={{
                        padding: '8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        background: '#e8f5e9'
                      }}>
                        <span className="text-xs"> {photo}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedTask.status === 'in_progress' || selectedTask.status === 'pending') && (
                <>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                      Add Comment
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Log work notes, observations, or updates..."
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {selectedTask.status === 'in_progress' && (
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Upload Repair Photos (optional, max 5)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleRepairPhotoUpload}
                        disabled={repairPhotos.length >= 5}
                        style={{ marginBottom: '10px' }}
                      />
                      {repairPhotos.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          {repairPhotos.map((file, idx) => (
                            <div key={idx} style={{
                              padding: '8px',
                              border: '1px solid #ddd',
                              borderRadius: '4px',
                              background: '#e8f5e9',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px'
                            }}>
                              <span className="text-xs">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeRepairPhoto(idx)}
                                style={{
                                  background: 'red',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '20px',
                                  height: '20px',
                                  cursor: 'pointer',
                                  fontSize: '12px'
                                }}
                              >×</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleDeleteTask(selectedTask.id)}
                style={{ 
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
                onClick={() => {
                  setShowDetailsModal(false);
                  setComment('');
                  setRepairPhotos([]);
                }}
                style={{ whiteSpace: 'nowrap' }}
              >
                Cancel
              </button>
              {selectedTask.status === 'pending' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleStatusChange(selectedTask.id, 'in_progress')}
                  style={{ whiteSpace: 'nowrap', fontSize: '14px' }}
                >
                  Start
                </button>
              )}
              {selectedTask.status === 'in_progress' && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleStatusChange(selectedTask.id, 'completed')}
                  style={{ whiteSpace: 'nowrap', fontSize: '14px' }}
                >
                  Complete {repairPhotos.length > 0 && `(${repairPhotos.length})`}
                </button>
              )}
              {(selectedTask.status === 'in_progress' || selectedTask.status === 'pending') && comment.trim() && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleStatusChange(selectedTask.id, selectedTask.status)}
                  style={{ whiteSpace: 'nowrap', fontSize: '14px' }}
                >
                  Save
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default CaretakerTasksPage;