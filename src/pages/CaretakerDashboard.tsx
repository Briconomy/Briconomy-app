import React, { useState, useEffect, Suspense, useMemo } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import AIButton from '../components/AIButton.tsx';
import NotificationWidget from '../components/NotificationWidget.tsx';
import OnboardingTutorial from '../components/OnboardingTutorial.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { maintenanceApi, useApi } from '../services/api.ts';
import '../utils/chart-registration.ts';

// Lazy load TaskChart to prevent import errors from crashing the app
const TaskChart = React.lazy(() => import('../components/TaskChart.tsx'));

// Simple Error Boundary using functional component pattern
function SimpleErrorBoundary({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const [hasError, setHasError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('ErrorBoundary caught an error:', event.error);
      setHasError(true);
      setError(event.error);
    };

    globalThis.addEventListener('error', handleError);
    return () => globalThis.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return fallback || (
      <div className="error-fallback">
        <h3>Something went wrong</h3>
        <p>The dashboard encountered an error. Please refresh the page.</p>
        {error && <small>{error.message}</small>}
      </div>
    );
  }

  return <>{children}</>;
}

function CaretakerDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const [chartError, setChartError] = useState(null);
  
  const navItems = [
    { path: '/caretaker', label: t('nav.tasks'), icon: 'issue', active: true },
    { path: '/caretaker/schedule', label: t('nav.schedule'), icon: 'report' },
    { path: '/caretaker/history', label: t('nav.history'), icon: 'activityLog' },
    { path: '/caretaker/profile', label: t('nav.profile'), icon: 'profile' }
  ];

  // #COMPLETION_DRIVE: Fetch assigned requests + unassigned pending requests
  // #SUGGEST_VERIFY: Verify unassigned pending requests are properly filtered
  const { data: tasks, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useApi(
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
      await refetchTasks();
    } catch (error) {
      console.error('[CaretakerDashboard] Error updating status:', error);
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
    } catch (error) {
      console.error('[CaretakerDashboard] Error deleting request:', error);
      alert('Failed to delete request. Please try again.');
    }
  };

  useEffect(() => {
    try {
      // Dashboard initialization
    } catch (err) {
      console.error('Dashboard error:', err);
      setChartError('Dashboard initialization failed');
    }
  }, []);

  // Use real maintenance request data from API - memoized to prevent unnecessary re-renders
  const tasksData = useMemo(() => Array.isArray(tasks) ? tasks : [], [tasks]);
  
  // Log when data changes
  useEffect(() => {
    // Update dashboard when maintenance requests change
  }, [tasksData.length]);
  
  const isLoading = tasksLoading;
  const hasError = tasksError || error;
  
  // Memoize calculations to prevent recalculating on every render
  const stats = useMemo(() => {
    const assignedTasks = tasksData.length;
    
    // Filter for today's tasks
    const todayTasksArray = tasksData.filter(task => {
      const taskDate = new Date(task.createdAt || task.dueDate).toDateString();
      const today = new Date().toDateString();
      return taskDate === today;
    });
    
    const todayTasksCount = todayTasksArray.length;
    const priorityTasks = tasksData.filter(task => task.priority === 'high' || task.priority === 'urgent').length;
    const completionRate = tasksData.length > 0 
      ? Math.round((tasksData.filter(task => task.status === 'completed').length / tasksData.length) * 100) 
      : 0;
    
    return { assignedTasks, todayTasks: todayTasksCount, todayTasksArray, priorityTasks, completionRate };
  }, [tasksData]);
  
  const { assignedTasks, todayTasks, todayTasksArray, priorityTasks, completionRate } = stats;

  if (isLoading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t('caretaker.loading_dashboard')}...</p>
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
          <div className="page-title-wrapper">
            <div className="page-title">{t('caretaker.tasks')}</div>
            
          </div>
          <div className="page-subtitle">{t('caretaker.maintenance_updates')}</div>
          {hasError && (
            <div className="offline-indicator">
              <span>{t('tenant.offline_message')}</span>
            </div>
          )}
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={assignedTasks} label={t('caretaker.assigned')} />
          <StatCard value={todayTasks} label={t('caretaker.today')} />
          <StatCard value={priorityTasks} label={t('caretaker.priority')} />
          <StatCard value={`${completionRate}%`} label={t('caretaker.rate')} />
        </div>

        <ChartCard title={t('caretaker.task_performance')}>
          {chartError ? (
            <div className="chart-placeholder">
              {t('caretaker.chart_unavailable')}
            </div>
          ) : (
            <SimpleErrorBoundary fallback={
              <div className="chart-placeholder">
                {t('caretaker.chart_unavailable')}
              </div>
            }>
              <Suspense fallback={
                <div className="chart-placeholder">
                  {t('common.loading')}...
                </div>
              }>
                <TaskChart />
              </Suspense>
            </SimpleErrorBoundary>
          )}
        </ChartCard>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">{t('caretaker.today_tasks')}</div>
          </div>
          {todayTasksArray.slice(0, 5).map((task) => (
            <div key={task.id} className="list-item">
              <div className="item-info">
                <h4>
                  {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {task.title}
                </h4>
                <p>{task.description}</p>
                <span className={`status-badge status-${task.status}`} style={{ marginTop: '8px', display: 'inline-block' }}>
                  {task.status === 'in_progress' ? t('caretaker.progress') : 
                   task.status === 'pending' ? t('caretaker.scheduled') :
                   task.status === 'completed' ? t('status.completed') : task.status}
                </span>
                
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
          ))}
          {todayTasksArray.length === 0 && (
            <div className="no-results">
              <p>{t('caretaker.no_tasks_today')}</p>
            </div>
          )}
        </div>
        <div className="ai-button-container">
        <AIButton 
              userId={user?.id || "caretaker-user-1"} 
              language={localStorage.getItem('language') as 'en' | 'zu' || 'en'}
              userRole="caretaker"
            />
        </div>
        
        <NotificationWidget key="notification-widget-stable" />
      </div>
      
      <BottomNav items={navItems} responsive={false} />
      
      {/* Onboarding Tutorial */}
      <OnboardingTutorial />
    </div>
  );
}

export default CaretakerDashboard;
