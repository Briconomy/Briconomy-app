import { ChangeEvent, useMemo, useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { maintenanceApi, useApi } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useToast } from '../contexts/ToastContext.tsx';

type MaintenanceStatus = 'pending' | 'in_progress' | 'completed';
type MaintenancePriority = 'high' | 'medium' | 'low';

type MaintenanceRequest = {
  id: string;
  title: string;
  status: MaintenanceStatus;
  description: string;
  property: string;
  unit?: string | null;
  priority: MaintenancePriority;
  assignedTo?: string | null;
  estimatedCost?: number | null;
  actualCost?: number | null;
  createdAt: string;
  updatedAt?: string;
  completedDate?: string;
  notes?: string;
  images?: string[];
};

function ManagerMaintenancePage() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCaretaker, setSelectedCaretaker] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | MaintenanceStatus>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | MaintenancePriority>('all');
  const [filterProperty, setFilterProperty] = useState('all');
  const [filterAssignment, setFilterAssignment] = useState<'all' | 'assigned' | 'unassigned'>('all');
  
  const navItems = [
    { path: '/manager', label: t('nav.dashboard'), icon: 'performanceAnalytics', active: false },
    { path: '/manager/properties', label: t('nav.properties'), icon: 'properties', active: false },
    { path: '/manager/leases', label: t('nav.leases'), icon: 'lease', active: false },
    { path: '/manager/payments', label: t('nav.payments'), icon: 'payment', active: false }
  ];

  const { data: maintenance, loading: maintenanceLoading, refetch: refetchMaintenance } = useApi<MaintenanceRequest[]>(
    () => maintenanceApi.getAll({}),
    []
  );

  const maintenanceData = Array.isArray(maintenance) ? maintenance : [];

  const properties = useMemo(
    () => [...new Set(maintenanceData.map((req) => req.property))],
    [maintenanceData]
  );

  // Simple caretaker options (1, 2, or 3)
  const caretakers = [
    { id: '1', name: t('managerMaintenance.caretaker1') },
    { id: '2', name: t('managerMaintenance.caretaker2') },
    { id: '3', name: t('managerMaintenance.caretaker3') }
  ];

  // Filter maintenance requests
  const filteredRequests = useMemo(() => {
    return maintenanceData.filter((request) => {
      const statusMatch = filterStatus === 'all' || request.status === filterStatus;
      const priorityMatch = filterPriority === 'all' || request.priority === filterPriority;
      const propertyMatch = filterProperty === 'all' || request.property === filterProperty;
      const assignmentMatch =
        filterAssignment === 'all' ||
        (filterAssignment === 'assigned' && request.assignedTo) ||
        (filterAssignment === 'unassigned' && !request.assignedTo);

      return statusMatch && priorityMatch && propertyMatch && assignmentMatch;
    });
  }, [filterAssignment, filterPriority, filterProperty, filterStatus, maintenanceData]);

  // Calculate statistics
  const pendingRequests = maintenanceData.filter((req) => req.status === 'pending').length;
  const inProgressRequests = maintenanceData.filter((req) => req.status === 'in_progress').length;
  const completedRequests = maintenanceData.filter((req) => req.status === 'completed').length;
  const highPriorityRequests = maintenanceData.filter((req) => req.priority === 'high' && req.status !== 'completed').length;
  const unassignedRequests = maintenanceData.filter((req) => !req.assignedTo && req.status !== 'completed').length;
  
  const totalCost = maintenanceData
    .filter((req) => req.status === 'completed' && req.actualCost)
    .reduce((sum, req) => sum + (Number(req.actualCost) || 0), 0);

  const avgResolutionTime = maintenanceData
    .filter((req) => req.status === 'completed' && req.completedDate && req.createdAt)
    .reduce((sum, req) => {
      const created = new Date(req.createdAt).getTime();
      const completed = new Date(req.completedDate).getTime();
      return sum + (completed - created);
    }, 0) /
      (completedRequests || 1) ||
    0;

  const handleViewDetails = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setSelectedRequest(null);
    setShowDetails(false);
  };

  const handleAssignCaretaker = async (requestId: string) => {
    if (!selectedCaretaker) {
      showToast(t('managerMaintenance.selectCaretakerError'), 'error');
      return;
    }

    try {
      await maintenanceApi.update(requestId, {
        assignedTo: selectedCaretaker,
        status: 'in_progress'
      });
      await refetchMaintenance();
      setShowAssignModal(false);
      setSelectedCaretaker('');
      setSelectedRequest(null);
      showToast(t('managerMaintenance.assignSuccess'), 'success');
    } catch (error) {
      console.error('Error assigning caretaker:', error);
      showToast(t('managerMaintenance.assignFailed'), 'error');
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm(t('managerMaintenance.deleteConfirm'))) {
      return;
    }

    try {
      await maintenanceApi.delete(requestId);
      await refetchMaintenance();
      setShowDetails(false);
      setSelectedRequest(null);
      showToast(t('managerMaintenance.deleteSuccess'), 'success');
    } catch (error) {
      console.error('Error deleting maintenance request:', error);
      showToast(t('managerMaintenance.deleteFailed'), 'error');
    }
  };

  const openAssignModal = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setSelectedCaretaker(request.assignedTo || '');
    setShowAssignModal(true);
  };

  const getPriorityColor = (priority: MaintenancePriority) => {
    switch (priority) {
      case 'high': return 'text-red-600 font-semibold';
      case 'medium': return 'text-yellow-600 font-semibold';
      case 'low': return 'text-green-600 font-semibold';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'in_progress': return 'status-progress';
      case 'completed': return 'status-paid';
      default: return 'status-pending';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDuration = (milliseconds: number) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h`;
    }
    return '< 1h';
  };

  const formatCurrency = (amount: number | string | null | undefined) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(Number(amount) || 0);
  };

  const sortRequests = (a: MaintenanceRequest, b: MaintenanceRequest) => {
    const priorityOrder: Record<MaintenancePriority, number> = { high: 3, medium: 2, low: 1 };
    const statusOrder: Record<MaintenanceStatus, number> = { pending: 3, in_progress: 2, completed: 1 };

    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return -priorityDiff;

    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return -statusDiff;

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  };

  const formatStatusText = (status: MaintenanceStatus) => {
    switch (status) {
      case 'in_progress': return t('managerMaintenance.inProgress');
      case 'pending': return t('managerMaintenance.pending');
      case 'completed': return t('managerMaintenance.completed');
      default: return status;
    }
  };

  const handleStatusFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(event.target.value as typeof filterStatus);
  };

  const handlePriorityFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilterPriority(event.target.value as typeof filterPriority);
  };

  const handlePropertyFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilterProperty(event.target.value);
  };

  const handleAssignmentFilterChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setFilterAssignment(event.target.value as typeof filterAssignment);
  };

  const handleCaretakerChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCaretaker(event.target.value);
  };

  const MaintenanceRequestItem = ({ request }: { request: MaintenanceRequest }) => (
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
          {request.property && (
            <>
              <br />
              <span className="text-xs text-gray-500">
                {request.property} {request.unit && `- ${request.unit}`}
              </span>
            </>
          )}
          <br />
          <span className="text-xs text-gray-500">
            {t('managerMaintenance.created')} {formatDate(request.createdAt)}
          </span>
          <br />
          {request.assignedTo ? (
            <span className="text-xs text-blue-600">
              {t('managerMaintenance.assignedTo')} {request.assignedTo}
            </span>
          ) : (
            <span className="text-xs text-orange-600">
              {t('managerMaintenance.unassigned')}
            </span>
          )}
          {request.estimatedCost && (
            <>
              <br />
              <span className="text-xs text-blue-600">
                {t('managerMaintenance.estimatedCost')} {formatCurrency(request.estimatedCost)}
              </span>
            </>
          )}
        </div>
        
        {/* Action Buttons */}
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '13px', padding: '6px 12px' }}
            onClick={() => handleViewDetails(request)}
          >
            {t('managerMaintenance.viewDetails')}
          </button>
          {request.status !== 'completed' && (
            <button
              type="button"
              className="btn btn-primary"
              style={{ fontSize: '13px', padding: '6px 12px' }}
              onClick={() => openAssignModal(request)}
            >
              {request.assignedTo ? t('managerMaintenance.reassign') : t('managerMaintenance.assign')}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (maintenanceLoading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t('managerMaintenance.loading')}</p>
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
          <div className="page-title">{t('managerMaintenance.title')}</div>
          <div className="page-subtitle">
            {t('managerMaintenance.subtitle')}
          </div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={pendingRequests} label={t('managerMaintenance.pending')} />
          <StatCard value={inProgressRequests} label={t('managerMaintenance.inProgress')} />
          <StatCard value={completedRequests} label={t('managerMaintenance.completed')} />
          <StatCard value={unassignedRequests} label={t('managerMaintenance.unassigned')} />
        </div>

        {/* Filters */}
        <div className="filter-section">
          <div className="filter-group">
            <label className="filter-label">{t('managerMaintenance.filterStatus')}</label>
            <select 
              className="filter-select"
              value={filterStatus}
              onChange={handleStatusFilterChange}
            >
              <option value="all">{t('managerMaintenance.allStatus')}</option>
              <option value="pending">{t('managerMaintenance.pending')}</option>
              <option value="in_progress">{t('managerMaintenance.inProgress')}</option>
              <option value="completed">{t('managerMaintenance.completed')}</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">{t('managerMaintenance.filterPriority')}</label>
            <select 
              className="filter-select"
              value={filterPriority}
              onChange={handlePriorityFilterChange}
            >
              <option value="all">{t('managerMaintenance.allPriorities')}</option>
              <option value="high">{t('managerMaintenance.high')}</option>
              <option value="medium">{t('managerMaintenance.medium')}</option>
              <option value="low">{t('managerMaintenance.low')}</option>
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">{t('managerMaintenance.filterProperty')}</label>
            <select 
              className="filter-select"
              value={filterProperty}
              onChange={handlePropertyFilterChange}
            >
              <option value="all">{t('managerMaintenance.allProperties')}</option>
              {properties.map(property => (
                <option key={property} value={property}>{property}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">{t('managerMaintenance.filterAssignment')}</label>
            <select 
              className="filter-select"
              value={filterAssignment}
              onChange={handleAssignmentFilterChange}
            >
              <option value="all">{t('managerMaintenance.allTasks')}</option>
              <option value="assigned">{t('managerMaintenance.assigned')}</option>
              <option value="unassigned">{t('managerMaintenance.unassigned')}</option>
            </select>
          </div>
        </div>

        {/* Maintenance Requests List */}
        <div className="data-table">
          <div className="table-header">
            <div className="table-title">{t('managerMaintenance.maintenanceRequests')}</div>
            <div className="text-sm text-gray-500">
              {t('managerMaintenance.requestsCount').replace('{count}', filteredRequests.length.toString())}
            </div>
          </div>
          
          {filteredRequests.length === 0 ? (
            <div className="no-results">
              <p>{t('managerMaintenance.noRequests')}</p>
            </div>
          ) : (
            filteredRequests
              .sort(sortRequests)
              .map((request) => <MaintenanceRequestItem key={request.id} request={request} />)
          )}
        </div>

        {/* Performance Summary */}
        <ChartCard title={t('managerMaintenance.performanceTitle')}>
          <div className="performance-stats">
            <div className="stat-row">
              <div className="stat-label">{t('managerMaintenance.totalCompleted')}</div>
              <div className="stat-value">{completedRequests}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">{t('managerMaintenance.avgResolution')}</div>
              <div className="stat-value">{formatDuration(avgResolutionTime)}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">{t('managerMaintenance.totalCost')}</div>
              <div className="stat-value">{formatCurrency(totalCost)}</div>
            </div>
            <div className="stat-row">
              <div className="stat-label">{t('managerMaintenance.highPriorityIssues')}</div>
              <div className="stat-value">{highPriorityRequests}</div>
            </div>
          </div>
        </ChartCard>
      </div>
      
      <BottomNav items={navItems} responsive={false} />

      {/* Details Modal */}
      {showDetails && selectedRequest && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('managerMaintenance.detailsTitle')}</h3>
              <button type="button" className="modal-close" onClick={handleCloseDetails}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-section">
                <h4>{selectedRequest.title}</h4>
                <span className={`status-badge ${getStatusColor(selectedRequest.status)}`}>
                  {formatStatusText(selectedRequest.status)}
                </span>
                <span className={`ml-2 text-sm ${getPriorityColor(selectedRequest.priority)}`}>
                  {selectedRequest.priority.toUpperCase()} {t('managerMaintenance.priority')}
                </span>
              </div>

              <div className="detail-section">
                <label>{t('managerMaintenance.description')}</label>
                <p>{selectedRequest.description}</p>
              </div>

              <div className="detail-section">
                <label>{t('managerMaintenance.propertyUnit')}</label>
                <p>{selectedRequest.property} {selectedRequest.unit && `- Unit ${selectedRequest.unit}`}</p>
              </div>

              <div className="detail-section">
                <label>{t('managerMaintenance.assignment')}</label>
                <p>{selectedRequest.assignedTo ? `${t('managerMaintenance.assignedTo')} ${selectedRequest.assignedTo}` : t('managerMaintenance.unassigned')}</p>
              </div>

              <div className="detail-section">
                <label>{t('managerMaintenance.dates')}</label>
                <p>{t('managerMaintenance.created')} {formatDate(selectedRequest.createdAt)}</p>
                <p>{t('managerMaintenance.lastUpdated')} {formatDate(selectedRequest.updatedAt)}</p>
                {selectedRequest.completedDate && (
                  <p>{t('managerMaintenance.completed')}: {formatDate(selectedRequest.completedDate)}</p>
                )}
              </div>

              {(selectedRequest.estimatedCost || selectedRequest.actualCost) && (
                <div className="detail-section">
                  <label>{t('managerMaintenance.costs')}</label>
                  {selectedRequest.estimatedCost && (
                    <p>{t('managerMaintenance.estimated')} {formatCurrency(selectedRequest.estimatedCost)}</p>
                  )}
                  {selectedRequest.actualCost && (
                    <p>{t('managerMaintenance.actual')} {formatCurrency(selectedRequest.actualCost)}</p>
                  )}
                </div>
              )}

              {selectedRequest.notes && (
                <div className="detail-section">
                  <label>{t('managerMaintenance.notes')}</label>
                  <p>{selectedRequest.notes}</p>
                </div>
              )}

              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div className="detail-section">
                  <label>{t('managerMaintenance.images')}</label>
                  <div className="image-list">
                    {selectedRequest.images.map((image, idx) => (
                      <div key={idx} className="image-item">{image}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleDeleteRequest(selectedRequest.id)}
                style={{ 
                  background: '#dc3545', 
                  color: 'white', 
                  marginRight: 'auto',
                  whiteSpace: 'nowrap',
                  fontSize: '14px',
                  padding: '8px 12px'
                }}
              >
                {t('managerMaintenance.delete')}
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleCloseDetails}
                style={{ whiteSpace: 'nowrap' }}
              >
                {t('managerMaintenance.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>{selectedRequest.assignedTo ? t('managerMaintenance.reassignCaretakerTitle') : t('managerMaintenance.assignCaretakerTitle')}</h3>
              <button type="button" className="modal-close" onClick={() => setShowAssignModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>{selectedRequest.title}</h4>
                <p className="text-sm text-gray-600">{selectedRequest.property}</p>
                <span className={`status-badge ${getStatusColor(selectedRequest.status)}`}>
                  {formatStatusText(selectedRequest.status)}
                </span>
              </div>

              {selectedRequest.assignedTo && (
                <div style={{ 
                  padding: '10px', 
                  background: '#f0f9ff', 
                  borderRadius: '4px', 
                  marginBottom: '15px',
                  borderLeft: '3px solid #0ea5e9'
                }}>
                  <p className="text-sm">
                    <strong>{t('managerMaintenance.currentlyAssigned')}</strong> {selectedRequest.assignedTo}
                  </p>
                </div>
              )}

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  {t('managerMaintenance.selectCaretaker')}
                </label>
                <select
                  className="filter-select"
                  value={selectedCaretaker}
                  onChange={handleCaretakerChange}
                  style={{ width: '100%', padding: '10px', fontSize: '14px' }}
                >
                  <option value="">{t('managerMaintenance.selectCaretakerPlaceholder')}</option>
                  {caretakers.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ 
                padding: '10px', 
                background: '#f9fafb', 
                borderRadius: '4px',
                fontSize: '13px',
                color: '#6b7280'
              }}>
                <p style={{ marginBottom: '4px' }}>
                  <strong>{t('managerMaintenance.assignNote')}</strong> {selectedRequest.assignedTo ? t('managerMaintenance.reassigningWill') : t('managerMaintenance.assigningWill')}
                </p>
                <ul style={{ marginLeft: '20px', marginTop: '4px' }}>
                  <li>{t('managerMaintenance.changeStatus')}</li>
                  <li>{t('managerMaintenance.notifyCaretaker')}</li>
                  {selectedRequest.assignedTo && (
                    <li>{t('managerMaintenance.notifyPrevious')}</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedCaretaker('');
                }}
                style={{ whiteSpace: 'nowrap' }}
              >
                {t('createLease.cancel')}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleAssignCaretaker(selectedRequest.id)}
                disabled={!selectedCaretaker}
                style={{ whiteSpace: 'nowrap', fontSize: '14px' }}
              >
                {selectedRequest.assignedTo ? t('managerMaintenance.reassign') : t('managerMaintenance.assign')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerMaintenancePage;
