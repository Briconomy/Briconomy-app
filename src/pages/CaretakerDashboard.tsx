import React, { useState, useEffect, Suspense } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import AIButton from '../components/AIButton.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { tasksApi, useApi } from '../services/api.ts';
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

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
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
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [chartError, setChartError] = useState(null);
  
  const navItems = [
    { path: '/caretaker', label: t('nav.tasks'), active: true },
    { path: '/caretaker/schedule', label: t('nav.schedule') },
    { path: '/caretaker/history', label: t('nav.history') },
    { path: '/caretaker/profile', label: t('nav.profile') }
  ];

  const { data: tasks, loading: tasksLoading, error: tasksError } = useApi(
    () => tasksApi.getAll(user?.id ? { caretakerId: user.id } : {}),
    [user?.id]
  );

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    try {
      console.log('CaretakerDashboard mounted');
    } catch (err) {
      console.error('Dashboard error:', err);
      setChartError('Dashboard initialization failed');
    }
  }, []);

  const loadUserData = () => {
    try {
      const userRaw = localStorage.getItem('briconomy_user');
      const userData = userRaw ? JSON.parse(userRaw) : null;
      setUser(userData);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user data');
    }
  };

  const getMockTasks = () => {
    return [
      {
        id: '1',
        title: 'Plumbing Unit 2A',
        description: 'Kitchen sink repair',
        dueDate: new Date().toISOString(),
        status: 'in_progress',
        priority: 'high'
      },
      {
        id: '2',
        title: 'Electrical Unit 5C',
        description: 'Outlet replacement',
        dueDate: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        priority: 'medium'
      }
    ];
  };

  const useMockData = tasksError || !tasks;
  const mockTasks = getMockTasks();
  const tasksData = Array.isArray(tasks) ? tasks : (useMockData ? mockTasks : []);
  
  const isLoading = tasksLoading;
  const hasError = tasksError || error;
  
  const assignedTasks = tasksData.length;
  const todayTasks = tasksData.filter(task => {
    const taskDate = new Date(task.dueDate).toDateString();
    const today = new Date().toDateString();
    return taskDate === today;
  }).length;
  const priorityTasks = tasksData.filter(task => task.priority === 'high' || task.priority === 'urgent').length;
  const completionRate = tasksData.length > 0 ? Math.round((tasksData.filter(task => task.status === 'completed').length / tasksData.length) * 100) : 0;

  if (isLoading) {
    return (
      <div className="app-container mobile-only">
<TopNav showLogout={true} showBackButton={true} />
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
        <TopNav showLogout={true} showBackButton={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
          {tasksData.slice(0, 5).map((task) => (
            <div key={task.id} className="list-item">
              <div className="item-info">
                <h4>{new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {task.title}</h4>
                <p>{task.description}</p>
              </div>
              <span className={`status-badge status-${task.status}`}>
                {task.status === 'in_progress' ? t('caretaker.progress') : 
                 task.status === 'pending' ? t('caretaker.scheduled') :
                 task.status === 'completed' ? t('status.completed') : task.status}
              </span>
            </div>
          ))}
          {tasksData.length === 0 && (
            <div className="no-results">
              <p>{t('caretaker.no_tasks')}</p>
            </div>
          )}
        </div>
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <AIButton 
              userId="manager-user-1" 
              language={localStorage.getItem('language') as 'en' | 'zu' || 'en'}
            />
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default CaretakerDashboard;
