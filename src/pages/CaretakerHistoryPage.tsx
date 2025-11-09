import { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';
import { maintenanceApi, useApi } from '../services/api.ts';

function CaretakerHistoryPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const navItems = [
    { path: '/caretaker', label: t('nav.tasks'), icon: 'issue', active: false },
    { path: '/caretaker/schedule', label: t('nav.schedule'), icon: 'report', active: false },
    { path: '/caretaker/history', label: t('nav.history'), icon: 'activityLog', active: true },
    { path: '/caretaker/profile', label: t('nav.profile'), icon: 'profile', active: false }
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
      const updateData: { status: string; assignedTo?: string } = { status: newStatus };
      if (newStatus === 'in_progress') {
        updateData.assignedTo = user?.id;
      }
      await maintenanceApi.update(requestId, updateData);
      await refetchMaintenance();
      console.log(`[CaretakerHistoryPage] Updated request ${requestId} status to ${newStatus}`);
    } catch (error) {
      console.error('[CaretakerHistoryPage] Error updating status:', error);
      showToast(t('caretakerHistory.updateFailed'), 'error');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm(t('caretakerHistory.deleteConfirm'))) {
      return;
    }
    
    try {
      await maintenanceApi.delete(requestId);
      await refetchMaintenance();
      console.log(`[CaretakerHistoryPage] Deleted request ${requestId}`);
    } catch (error) {
      console.error('[CaretakerHistoryPage] Error deleting request:', error);
      showToast(t('caretakerHistory.deleteFailed'), 'error');
    }
  };

  const maintenanceData = Array.isArray(maintenance) ? maintenance : [];
  const caretakerId = user?.id;
  const relevantMaintenance = caretakerId
    ? maintenanceData.filter(req => req.assignedTo === caretakerId)
    : maintenanceData;

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

    return relevantMaintenance.filter(req => dateFilter(req) && statusFilter(req));
  };

  const filteredData = getFilteredData();

  const completedMaintenance = relevantMaintenance.filter(req => req.status === 'completed').length;
  const totalCompleted = completedMaintenance;
  
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(Number(amount) || 0);
  };

  const loading = maintenanceLoading;
  const hasMaintenanceError = Boolean(maintenanceError);

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t('caretakerHistory.loading')}</p>
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
          <div className="page-title">{t('caretakerHistory.title')}</div>
          <div className="page-subtitle">{t('caretakerHistory.subtitle')}</div>
        </div>
        
        {hasMaintenanceError && (
          <div className="alert alert-error">
            <p>{t('caretakerHistory.errorMessage')}</p>
          </div>
        )}

        <div className="dashboard-grid">
          <StatCard value={totalCompleted} label={t('caretakerHistory.completed')} />
          <StatCard value={relevantMaintenance.length} label={t('caretakerHistory.total')} />
          <StatCard value={relevantMaintenance.filter(r => r.status === 'pending').length} label={t('caretakerHistory.pending')} />
          <StatCard value={relevantMaintenance.filter(r => r.status === 'in_progress').length} label={t('caretakerHistory.inProgress')} />
        </div>

        {/* Filters */}
        <div className="filter-section">
          <div className="filter-group">
            <label className="filter-label">{t('caretakerHistory.period')}:</label>
            <select 
              className="filter-select"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <option value="all">{t('caretakerHistory.allTime')}</option>
              <option value="week">{t('caretakerHistory.lastWeek')}</option>
              <option value="month">{t('caretakerHistory.lastMonth')}</option>
              <option value="year">{t('caretakerHistory.lastYear')}</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">{t('caretakerHistory.status')}:</label>
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">{t('caretakerHistory.all')}</option>
              <option value="completed">{t('caretakerHistory.completedFilter')}</option>
              <option value="in_progress">{t('caretakerHistory.inProgressFilter')}</option>
              <option value="pending">{t('caretakerHistory.pendingFilter')}</option>
            </select>
          </div>
        </div>

        {/* All Maintenance Requests */}
        <div className="data-table">
          <div className="table-header">
            <div className="table-title">{t('caretakerHistory.maintenanceRequests')}</div>
            <div className="text-sm text-gray-500">
              {filteredData.length} {t('caretakerHistory.requests')}
            </div>
          </div>
          
          {filteredData.length === 0 ? (
            <div className="no-results">
              <p>{t('caretakerHistory.noRecords')}</p>
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
                        {request.status === 'completed' ? t('caretakerHistory.completedStatus') : 
                         request.status === 'in_progress' ? t('caretakerHistory.inProgressStatus') : t('caretakerHistory.pendingStatus')}
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
                          `${t('caretakerHistory.completedOn')}: ${formatDate(request.completedDate)}` : 
                          `${t('caretakerHistory.createdOn')}: ${formatDate(request.createdAt)}`}
                      </span>
                      {request.actualCost && (
                        <span className="text-xs text-green-600 font-semibold">
                          {formatCurrency(request.actualCost)}
                        </span>
                      )}
                    </div>
                    {request.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <strong>{t('caretakerHistory.notes')}:</strong> {request.notes}
                      </div>
                    )}
                    {request.images && request.images.length > 0 && (
                      <div className="mt-2">
                        <span className="text-xs text-blue-600">
                          {request.images.length} {t('caretakerHistory.imagesAttached')}
                        </span>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div style={{ 
                      marginTop: '12px', 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
                      gap: '8px',
                      marginBottom: '-10px' 
                    }}>
                      {request.status === 'pending' && (
                        <button
                          type="button"
                          className="btn btn-primary"
                          style={{ fontSize: '13px', padding: '6px 12px' }}
                          onClick={() => handleStatusChange(request.id, 'in_progress')}
                        >
                          {t('caretakerHistory.startWork')}
                        </button>
                      )}
                      {request.status === 'in_progress' && (
                        <button
                          type="button"
                          className="btn btn-success"
                          style={{ fontSize: '13px', padding: '6px 12px' }}
                          onClick={() => handleStatusChange(request.id, 'completed')}
                        >
                          {t('caretakerHistory.complete')}
                        </button>
                      )}
                      {request.status === 'completed' && (
                        <button
                          type="button"
                          className="btn btn-secondary reopen-btn"
                          style={{ fontSize: '13px', padding: '6px 12px' }}
                          onClick={() => handleStatusChange(request.id, 'pending')}
                        >
                          {t('caretakerHistory.reopen')}
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-danger delete-btn"
                        style={{ fontSize: '13px', padding: '6px 12px' }}
                        onClick={() => handleDeleteRequest(request.id)}
                      >
                        {t('caretakerHistory.delete')}
                      </button>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Performance Summary */}
        <ChartCard title={t('caretakerHistory.summary')}>
          <div className="performance-stats">
            <div className="stat-row">
              <div className="stat-label">{t('caretakerHistory.totalRequests')}:</div>
              <div className="stat-value">{relevantMaintenance.length}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">{t('caretakerHistory.completedCount')}:</div>
              <div className="stat-value">{completedMaintenance}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">{t('caretakerHistory.inProgressCount')}:</div>
              <div className="stat-value">{relevantMaintenance.filter(r => r.status === 'in_progress').length}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">{t('caretakerHistory.pendingCount')}:</div>
              <div className="stat-value">{relevantMaintenance.filter(r => r.status === 'pending').length}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">{t('caretakerHistory.completionRate')}:</div>
              <div className="stat-value">
                {relevantMaintenance.length > 0 ? Math.round((completedMaintenance / relevantMaintenance.length) * 100) : 0}%
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
