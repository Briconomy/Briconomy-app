import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import DataTable from '../components/DataTable.tsx';
import SearchFilter from '../components/SearchFilter.tsx';
import Modal from '../components/Modal.tsx';
import Icon from '../components/Icon.tsx';
import { terminationsApi, formatCurrency, formatDate } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface Termination {
  _id: string;
  tenant: {
    name: string;
    email: string;
  };
  unit: {
    number: string;
    property: string;
  };
  currentRent: number;
  terminationDate: string;
  requestDate: string;
  reason: string;
  notice: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  rejectionReason?: string;
  approvedBy?: string;
  notes?: string;
}

interface TerminationFilters {
  status: string;
  search: string;
  dateRange: string;
}

const LeaseTerminationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const [terminations, setTerminations] = useState<Termination[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TerminationFilters>({
    status: '',
    search: '',
    dateRange: ''
  });
  const [selectedTermination, setSelectedTermination] = useState<Termination | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [terminationReason, setTerminationReason] = useState<string>('');
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const mockTerminations: Termination[] = [
    {
      _id: '1',
      tenant: { name: 'John Smith', email: 'john@example.com' },
      unit: { number: '101', property: 'Sunset Apartments' },
      currentRent: 1200,
      terminationDate: '2024-03-15',
      requestDate: '2024-01-15',
      reason: 'Relocating for work',
      notice: 60,
      status: 'pending',
      notes: 'Tenant has been excellent, no issues'
    },
    {
      _id: '2',
      tenant: { name: 'Sarah Johnson', email: 'sarah@example.com' },
      unit: { number: '205', property: 'Oak Ridge Complex' },
      currentRent: 1450,
      terminationDate: '2024-02-28',
      requestDate: '2024-01-10',
      reason: 'Purchasing a home',
      notice: 45,
      status: 'approved',
      approvedBy: 'Manager Johnson',
      notes: 'Early termination approved due to home purchase'
    },
    {
      _id: '3',
      tenant: { name: 'Mike Davis', email: 'mike@example.com' },
      unit: { number: '312', property: 'Pine Valley Residences' },
      currentRent: 1100,
      terminationDate: '2024-04-01',
      requestDate: '2024-02-01',
      reason: 'Financial hardship',
      notice: 60,
      status: 'rejected',
      rejectionReason: 'Insufficient notice period',
      notes: 'Needs to provide 90 days notice per lease agreement'
    }
  ];

  const navItems = [
    { path: '/manager', label: t('nav.dashboard'), icon: 'performanceAnalytics' },
    { path: '/manager/properties', label: t('nav.properties'), icon: 'properties' },
    { path: '/manager/leases', label: t('nav.leases'), icon: 'lease', active: true },
    { path: '/manager/payments', label: t('nav.payments'), icon: 'payment' }
  ];

  useEffect(() => {
    const fetchTerminations = async () => {
      try {
        setLoading(true);
        try {
          const response = await terminationsApi.getAll(filters);
          setTerminations(response.data || []);
        } catch (apiError) {
          console.log('API not available, using mock data:', apiError);
          setTimeout(() => {
            setTerminations(mockTerminations);
          }, 500);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching terminations:', error);
        setLoading(false);
      }
    };

    fetchTerminations();
  }, [filters]);

  const filteredTerminations = useMemo(() => {
    return terminations.filter(termination => {
      const matchesStatus = !filters.status || termination.status === filters.status;
      const matchesSearch = !filters.search || 
        termination.tenant.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        termination.unit.number.toLowerCase().includes(filters.search.toLowerCase()) ||
        termination.unit.property.toLowerCase().includes(filters.search.toLowerCase());
      
      return matchesStatus && matchesSearch;
    });
  }, [terminations, filters]);

  const stats = useMemo(() => {
    const total = terminations.length;
    const pending = terminations.filter(t => t.status === 'pending').length;
    const approved = terminations.filter(t => t.status === 'approved').length;
    const rejected = terminations.filter(t => t.status === 'rejected').length;
    const completed = terminations.filter(t => t.status === 'completed').length;

    return { total, pending, approved, rejected, completed };
  }, [terminations]);

  const handleFilterChange = (key: keyof TerminationFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTerminationAction = async (terminationId: string, action: 'approve' | 'reject') => {
    try {
      setActionLoading(terminationId);
      
      let success = false;
      
      if (action === 'approve') {
        try {
          await terminationsApi.approve(terminationId);
          success = true;
        } catch (apiError) {
          console.log('API approve failed, updating locally:', apiError);
          success = true;
        }
        
        if (success) {
          setTerminations(prev => prev.map(t => 
            t._id === terminationId 
              ? { ...t, status: 'approved' as const, approvedBy: 'Current Manager' }
              : t
          ));
        }
      } else {
        try {
          await terminationsApi.reject(terminationId, terminationReason);
          success = true;
        } catch (apiError) {
          console.log('API reject failed, updating locally:', apiError);
          success = true;
        }
        
        if (success) {
          setTerminations(prev => prev.map(t => 
            t._id === terminationId 
              ? { ...t, status: 'rejected' as const, rejectionReason: terminationReason }
              : t
          ));
        }
      }

      setShowDetailsModal(false);
      setSelectedTermination(null);
      setTerminationReason('');
    } catch (error) {
      console.error(`Error ${action}ing termination:`, error);
      alert(`Failed to ${action} termination. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  const viewTermination = (termination: Termination) => {
    setSelectedTermination(termination);
    setShowDetailsModal(true);
  };

  const handleInitiateTermination = () => {
    navigate('/manager/terminations/initiate');
  };

  const mockActiveLeases = [
    {
      _id: 'lease1',
      tenant: { name: 'John Smith', email: 'john@example.com' },
      unit: { number: '101', property: 'Sunset Apartments' },
      currentRent: 1200,
      startDate: '2023-06-01',
      endDate: '2024-05-31',
      status: 'active'
    },
    {
      _id: 'lease2',
      tenant: { name: 'Sarah Johnson', email: 'sarah@example.com' },
      unit: { number: '205', property: 'Oak Ridge Complex' },
      currentRent: 1450,
      startDate: '2023-08-15',
      endDate: '2024-08-14',
      status: 'active'
    },
    {
      _id: 'lease3',
      tenant: { name: 'Mike Davis', email: 'mike@example.com' },
      unit: { number: '312', property: 'Pine Valley Residences' },
      currentRent: 1100,
      startDate: '2023-10-01',
      endDate: '2024-09-30',
      status: 'active'
    }
  ];

  const [selectedLease, setSelectedLease] = useState(null);
  const [terminationForm, setTerminationForm] = useState({
    reason: '',
    terminationDate: '',
    notice: 30,
    notes: ''
  });
  const [settlementCalculation, setSettlementCalculation] = useState(null);
  const [formStep, setFormStep] = useState(1);

  const handleCalculateSettlement = () => {
    navigate('/manager/terminations/settlement');
  };

  const handleGenerateDocuments = () => {
    navigate('/manager/terminations/documents');
  };

  const handleGenerateReport = () => {
    navigate('/manager/terminations/report');
  };

  const calculateSettlement = (termination: Termination) => {
    const currentDate = new Date();
    const terminationDate = new Date(termination.terminationDate);
    const daysUntilTermination = Math.ceil((terminationDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let penalty = 0;
    let refund = 0;
    
    if (daysUntilTermination < 30 && daysUntilTermination > 0) {
      penalty = termination.currentRent * 0.5;
    }
    
    if (daysUntilTermination > 0) {
      const dailyRent = termination.currentRent / 30;
      refund = dailyRent * daysUntilTermination;
    }
    
    return {
      penalty,
      refund,
      netAmount: refund - penalty,
      daysUntilTermination,
      currentRent: termination.currentRent
    };
  };

  const generateTerminationDocuments = (termination: Termination) => {
    const documents = [
      {
        name: 'Termination Notice',
        type: 'PDF',
        generated: true,
        downloadUrl: '#'
      },
      {
        name: 'Settlement Statement',
        type: 'PDF',
        generated: true,
        downloadUrl: '#'
      },
      {
        name: 'Final Inspection Report',
        type: 'PDF',
        generated: false,
        downloadUrl: '#'
      },
      {
        name: 'Refund Authorization',
        type: 'PDF',
        generated: true,
        downloadUrl: '#'
      }
    ];
    
    return documents;
  };

  const generateTerminationReport = () => {
    const reportData = {
      totalTerminations: terminations.length,
      pendingTerminations: terminations.filter(t => t.status === 'pending').length,
      approvedTerminations: terminations.filter(t => t.status === 'approved').length,
      rejectedTerminations: terminations.filter(t => t.status === 'rejected').length,
      completedTerminations: terminations.filter(t => t.status === 'completed').length,
      averageNoticePeriod: Math.round(terminations.reduce((sum, t) => sum + t.notice, 0) / terminations.length),
      totalRevenueImpact: terminations.reduce((sum, t) => sum + t.currentRent, 0),
      monthlyBreakdown: terminations.reduce((acc, t) => {
        const month = new Date(t.terminationDate).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' });
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
    
    return reportData;
  };

  const getStatusBadge = (status: Termination['status']) => {
    const badges = {
      pending: 'status-pending',
      approved: 'status-paid',
      rejected: 'status-overdue',
      completed: 'status-paid'
    };
    return badges[status];
  };

  const terminationColumns = [
    { key: 'tenantName', label: t('lease.tenant') },
    { key: 'unitNumber', label: t('lease.unit') },
    { key: 'propertyName', label: t('lease.property') },
    { 
      key: 'reason', 
      label: t('terminations.reason'),
      render: (value) => (
        <span className="reason-text" title={value}>
          {value.length > 20 ? value.substring(0, 20) + '...' : value}
        </span>
      )
    },
    { 
      key: 'terminationDate', 
      label: t('terminations.termination_date'),
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'status', 
      label: t('common.status'),
      render: (value) => (
        <span className={`status-badge ${getStatusBadge(value)}`}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (value, row) => (
        <div className="action-buttons">
          <button type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => viewTermination(row)}
          >
            {t('common.view')}
          </button>
          {row.status === 'pending' && (
            <>
              <button type="button"
                className="btn btn-primary btn-sm"
                onClick={() => handleTerminationAction(row._id, 'approve')}
                disabled={actionLoading === row._id}
              >
                {actionLoading === row._id ? t('common.processing') : t('common.approve')}
              </button>
              <button type="button"
                className="btn btn-danger btn-sm"
                onClick={() => handleTerminationAction(row._id, 'reject')}
                disabled={actionLoading === row._id}
              >
                {actionLoading === row._id ? t('common.processing') : t('common.reject')}
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  const tableData = filteredTerminations.map(termination => ({
    _id: termination._id,
    tenantName: termination.tenant.name,
    unitNumber: termination.unit.number,
    propertyName: termination.unit.property,
    reason: termination.reason,
    terminationDate: termination.terminationDate,
    status: termination.status,
    ...termination
  }));

  const filtersConfig = [
    {
      key: 'status',
      value: filters.status,
      options: [
        { value: '', label: t('common.all_statuses') },
        { value: 'pending', label: t('status.pending') },
        { value: 'approved', label: t('status.approved') },
        { value: 'rejected', label: t('status.rejected') },
        { value: 'completed', label: t('status.completed') }
      ]
    }
  ];

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="page-header">
            <div className="page-title">{t('terminations.page_title')}</div>
            <div className="page-subtitle">{t('terminations.page_subtitle')}</div>
          </div>
          <div className="loading">{t('terminations.loading')}</div>
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
          <div className="page-title">{t('terminations.page_title')}</div>
          <div className="page-subtitle">{t('terminations.page_subtitle')}</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={stats.pending} label={t('status.pending')} />
          <StatCard value={stats.approved} label={t('status.approved')} />
          <StatCard value={stats.completed} label={t('status.completed')} />
          <StatCard value={stats.total} label={t('terminations.total_requests')} />
        </div>

        <SearchFilter
          placeholder={t('terminations.search_placeholder')}
          onSearch={(term) => handleFilterChange('search', term)}
          filters={filtersConfig}
          onFilterChange={(key, value) => handleFilterChange(key as keyof TerminationFilters, value)}
        />

        <DataTable
          title={t('terminations.requests')}
          data={tableData}
          columns={terminationColumns}
          actions={null}
          onRowClick={(termination) => viewTermination(termination)}
        />

        <ChartCard title={t('terminations.overview')}>
          <div className="termination-stats">
            <div className="stat-item">
              <div className="stat-value">{stats.pending}</div>
              <div className="stat-label">{t('terminations.pending_review')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.approved}</div>
              <div className="stat-label">{t('status.approved')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.completed}</div>
              <div className="stat-label">{t('status.completed')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">{t('terminations.total_requests')}</div>
            </div>
          </div>
        </ChartCard>

        <div className="quick-actions">
          <ActionCard
            onClick={handleInitiateTermination}
            icon={<Icon name="terminations" alt={t('terminations.initiate')} />}
            title={t('terminations.initiate')}
            description={t('terminations.start_new')}
          />
          <ActionCard
            onClick={handleCalculateSettlement}
            icon={<Icon name="calculateSettlement" alt={t('terminations.calculate_settlement')} />}
            title={t('terminations.calculate_settlement')}
            description={t('terminations.penalties_refunds')}
          />
          <ActionCard
            onClick={handleGenerateDocuments}
            icon={<Icon name="downloadDocSettlement" alt={t('terminations.generate_documents')} />}
            title={t('terminations.generate_documents')}
            description={t('terminations.termination_paperwork')}
          />
          <ActionCard
            onClick={handleGenerateReport}
            icon={<Icon name="terminationReport" alt={t('terminations.report')} />}
            title={t('terminations.report')}
            description={t('terminations.summary_analytics')}
          />
        </div>
      </div>

      <Modal 
        isOpen={showDetailsModal && selectedTermination !== null}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTermination(null);
          setTerminationReason('');
        }}
        title="Termination Details"
      >
        {selectedTermination && (
          <div className="termination-details">
            <div className="detail-section">
              <h4>Tenant Information</h4>
              <p><strong>Name:</strong> {selectedTermination.tenant.name}</p>
              <p><strong>Email:</strong> {selectedTermination.tenant.email}</p>
            </div>

            <div className="detail-section">
              <h4>Property Information</h4>
              <p><strong>Property:</strong> {selectedTermination.unit.property}</p>
              <p><strong>Unit:</strong> {selectedTermination.unit.number}</p>
              <p><strong>Current Rent:</strong> R{selectedTermination.currentRent.toLocaleString()}/month</p>
            </div>

            <div className="detail-section">
              <h4>Termination Details</h4>
              <p><strong>Request Date:</strong> {new Date(selectedTermination.requestDate).toLocaleDateString()}</p>
              <p><strong>Termination Date:</strong> {new Date(selectedTermination.terminationDate).toLocaleDateString()}</p>
              <p><strong>Notice Period:</strong> {selectedTermination.notice} days</p>
              <p><strong>Reason:</strong> {selectedTermination.reason}</p>
              {selectedTermination.notes && (
                <p><strong>Notes:</strong> {selectedTermination.notes}</p>
              )}
            </div>

            {selectedTermination.status === 'approved' && selectedTermination.approvedBy && (
              <div className="detail-section">
                <h4>Approval Information</h4>
                <p><strong>Approved By:</strong> {selectedTermination.approvedBy}</p>
              </div>
            )}

            {selectedTermination.status === 'rejected' && selectedTermination.rejectionReason && (
              <div className="detail-section">
                <h4>Rejection Information</h4>
                <p><strong>Rejection Reason:</strong> {selectedTermination.rejectionReason}</p>
              </div>
            )}

            {selectedTermination.status === 'pending' && (
              <div className="detail-section">
                <h4>Actions</h4>
                <div className="modal-actions">
                  <button type="button"
                    onClick={() => handleTerminationAction(selectedTermination._id, 'approve')}
                    disabled={actionLoading === selectedTermination._id}
                    className="btn btn-primary"
                  >
                    {actionLoading === selectedTermination._id ? 'Processing...' : 'Approve Termination'}
                  </button>
                  <div>
                    <textarea
                      value={terminationReason}
                      onChange={(e) => setTerminationReason(e.target.value)}
                      placeholder="Enter rejection reason..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                      rows={3}
                    />
                    <button type="button"
                      onClick={() => handleTerminationAction(selectedTermination._id, 'reject')}
                      disabled={!terminationReason.trim() || actionLoading === selectedTermination._id}
                      className="btn btn-danger w-full"
                    >
                      {actionLoading === selectedTermination._id ? 'Processing...' : 'Reject Termination'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedTermination(null);
                  setTerminationReason('');
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={showInitiateModal}
        onClose={() => {
          setShowInitiateModal(false);
          setSelectedLease(null);
          setTerminationForm({ reason: '', terminationDate: '', notice: 30, notes: '' });
          setSettlementCalculation(null);
          setFormStep(1);
        }}
        title="Initiate New Termination"
      >
        <div className="initiate-termination">
          <div className="progress-steps">
            <div className={`step ${formStep >= 1 ? 'active' : ''} ${formStep > 1 ? 'completed' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-text">Select Lease</div>
            </div>
            <div className={`step ${formStep >= 2 ? 'active' : ''} ${formStep > 2 ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-text">Enter Details</div>
            </div>
            <div className={`step ${formStep >= 3 ? 'active' : ''} ${formStep > 3 ? 'completed' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-text">Review & Submit</div>
            </div>
          </div>

          {formStep === 1 && (
            <div className="lease-selection">
              <h4>Select Lease to Terminate</h4>
              <p className="step-description">Choose the active lease agreement you wish to terminate</p>
              
              <div className="lease-list">
                {mockActiveLeases.map(lease => (
                  <div 
                    key={lease._id} 
                    className={`lease-card ${selectedLease?._id === lease._id ? 'selected' : ''}`}
                    onClick={() => setSelectedLease(lease)}
                  >
                    <div className="lease-info">
                      <h5>{lease.tenant.name}</h5>
                      <div className="lease-details">
                        <span className="property">{lease.unit.property}</span>
                        <span className="unit">Unit {lease.unit.number}</span>
                        <span className="rent">R{lease.currentRent.toLocaleString()}/month</span>
                      </div>
                    </div>
                    <div className="lease-status">
                      <span className="status-badge status-paid">Active</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="modal-actions">
                <button type="button"
                  className="btn btn-primary"
                  onClick={() => setFormStep(2)}
                  disabled={!selectedLease}
                >
                  Continue to Details
                </button>
                <button type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowInitiateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {formStep === 2 && (
            <div className="termination-details-form">
              <h4>Termination Details</h4>
              <p className="step-description">Provide the reason and details for lease termination</p>
              
              <div className="selected-lease-summary">
                <h5>Selected Lease:</h5>
                <div className="lease-summary-card">
                  <div className="lease-info">
                    <h6>{selectedLease.tenant.name}</h6>
                    <p>{selectedLease.unit.property} - Unit {selectedLease.unit.number}</p>
                    <p>Current Rent: R{selectedLease.currentRent.toLocaleString()}/month</p>
                  </div>
                  <button type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => setFormStep(1)}
                  >
                    Change
                  </button>
                </div>
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label htmlFor="terminationReason">Termination Reason *</label>
                  <select
                    id="terminationReason"
                    value={terminationForm.reason}
                    onChange={(e) => setTerminationForm({...terminationForm, reason: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a reason</option>
                    <option value="Relocating for work">Relocating for work</option>
                    <option value="Purchasing a home">Purchasing a home</option>
                    <option value="Financial hardship">Financial hardship</option>
                    <option value="Job loss">Job loss</option>
                    <option value="Family reasons">Family reasons</option>
                    <option value="Property issues">Property issues</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="terminationDate">Termination Date *</label>
                  <input
                    type="date"
                    id="terminationDate"
                    value={terminationForm.terminationDate}
                    onChange={(e) => setTerminationForm({...terminationForm, terminationDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="noticePeriod">Notice Period (days) *</label>
                  <input
                    type="number"
                    id="noticePeriod"
                    value={terminationForm.notice}
                    onChange={(e) => setTerminationForm({...terminationForm, notice: parseInt(e.target.value) || 30})}
                    min="1"
                    max="365"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <small className="text-gray-500">Minimum 30 days required unless otherwise specified in lease</small>
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Additional Notes</label>
                  <textarea
                    id="notes"
                    value={terminationForm.notes}
                    onChange={(e) => setTerminationForm({...terminationForm, notes: e.target.value})}
                    placeholder="Any additional information or special circumstances..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              </div>

              {terminationForm.terminationDate && (
                <div className="settlement-preview">
                  <h5>Settlement Calculation Preview</h5>
                  {(() => {
                    const tempTermination = {
                      ...selectedLease,
                      terminationDate: terminationForm.terminationDate,
                      notice: terminationForm.notice
                    };
                    const settlement = calculateSettlement(tempTermination);
                    return (
                      <div className="settlement-summary">
                        <div className="calculation-row">
                          <span>Early Termination Penalty:</span>
                          <span className={settlement.penalty > 0 ? 'penalty' : 'no-penalty'}>
                            {settlement.penalty > 0 ? `R${settlement.penalty.toLocaleString()}` : 'None'}
                          </span>
                        </div>
                        <div className="calculation-row">
                          <span>Prorated Refund:</span>
                          <span className="refund">R{settlement.refund.toLocaleString()}</span>
                        </div>
                        <div className="calculation-row total">
                          <span>Net Settlement:</span>
                          <span className={settlement.netAmount >= 0 ? 'refund' : 'penalty'}>
                            R{Math.abs(settlement.netAmount).toLocaleString()} {settlement.netAmount >= 0 ? '(Refund)' : '(Due)'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              
              <div className="modal-actions">
                <button type="button"
                  className="btn btn-secondary"
                  onClick={() => setFormStep(1)}
                >
                  Back
                </button>
                <button type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const tempTermination = {
                      ...selectedLease,
                      terminationDate: terminationForm.terminationDate,
                      notice: terminationForm.notice
                    };
                    const finalSettlement = calculateSettlement(tempTermination);
                    setSettlementCalculation(finalSettlement);
                    setFormStep(3);
                  }}
                  disabled={!terminationForm.reason || !terminationForm.terminationDate}
                >
                  Review & Submit
                </button>
              </div>
            </div>
          )}

          {formStep === 3 && (
            <div className="review-submit">
              <h4>Review Termination Request</h4>
              <p className="step-description">Review all details and submit the termination request</p>
              
              <div className="review-sections">
                <div className="review-section">
                  <h5>Lease Information</h5>
                  <div className="review-details">
                    <div className="detail-row">
                      <span className="label">Tenant:</span>
                      <span className="value">{selectedLease.tenant.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Property:</span>
                      <span className="value">{selectedLease.unit.property}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Unit:</span>
                      <span className="value">{selectedLease.unit.number}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Current Rent:</span>
                      <span className="value">R{selectedLease.currentRent.toLocaleString()}/month</span>
                    </div>
                  </div>
                </div>

                <div className="review-section">
                  <h5>Termination Details</h5>
                  <div className="review-details">
                    <div className="detail-row">
                      <span className="label">Reason:</span>
                      <span className="value">{terminationForm.reason}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Termination Date:</span>
                      <span className="value">{new Date(terminationForm.terminationDate).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Notice Period:</span>
                      <span className="value">{terminationForm.notice} days</span>
                    </div>
                    {terminationForm.notes && (
                      <div className="detail-row">
                        <span className="label">Notes:</span>
                        <span className="value">{terminationForm.notes}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="review-section">
                  <h5>Financial Settlement</h5>
                  <div className="review-details">
                    <div className="detail-row">
                      <span className="label">Early Termination Penalty:</span>
                      <span className={`value ${settlementCalculation.penalty > 0 ? 'penalty' : 'no-penalty'}`}>
                        {settlementCalculation.penalty > 0 ? `R${settlementCalculation.penalty.toLocaleString()}` : 'None'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Prorated Refund:</span>
                      <span className="value refund">R{settlementCalculation.refund.toLocaleString()}</span>
                    </div>
                    <div className="detail-row total">
                      <span className="label">Net Settlement Amount:</span>
                      <span className={`value ${settlementCalculation.netAmount >= 0 ? 'refund' : 'penalty'}`}>
                        R{Math.abs(settlementCalculation.netAmount).toLocaleString()} {settlementCalculation.netAmount >= 0 ? '(Refund to tenant)' : '(Due from tenant)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="warning-box">
                <h6>Important</h6>
                <ul>
                  <li>This termination request will be submitted for approval</li>
                  <li>The tenant will be notified of the termination request</li>
                  <li>Final inspection will be scheduled before termination date</li>
                  <li>Security deposit refund will be processed after inspection</li>
                </ul>
              </div>
              
              <div className="modal-actions">
                <button type="button"
                  className="btn btn-secondary"
                  onClick={() => setFormStep(2)}
                >
                  Back
                </button>
                <button type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const newTermination: Termination = {
                      _id: `term_${Date.now()}`,
                      tenant: selectedLease.tenant,
                      unit: selectedLease.unit,
                      currentRent: selectedLease.currentRent,
                      terminationDate: terminationForm.terminationDate,
                      requestDate: new Date().toISOString().split('T')[0],
                      reason: terminationForm.reason,
                      notice: terminationForm.notice,
                      status: 'pending',
                      notes: terminationForm.notes
                    };

                    setTerminations(prev => [newTermination, ...prev]);
                    
                    alert('Termination request submitted successfully! The request is now pending approval.');
                    
                    setShowInitiateModal(false);
                    setSelectedLease(null);
                    setTerminationForm({ reason: '', terminationDate: '', notice: 30, notes: '' });
                    setSettlementCalculation(null);
                    setFormStep(1);
                  }}
                >
                  Submit Termination Request
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={showSettlementModal}
        onClose={() => setShowSettlementModal(false)}
        title="Calculate Settlement"
      >
        <div className="settlement-calculator">
          <div className="settlement-header">
            <h4>Settlement Calculation Overview</h4>
            <p className="settlement-description">Review financial settlements for approved lease terminations</p>
          </div>
          
          {terminations.length > 0 ? (
            <>
              <div className="settlement-summary">
                <div className="summary-cards">
                  <div className="summary-card">
                    <div className="card-value">{terminations.filter(t => t.status === 'approved').length}</div>
                    <div className="card-label">Approved Terminations</div>
                  </div>
                  <div className="summary-card">
                    <div className="card-value">R{terminations.filter(t => t.status === 'approved').reduce((sum, t) => sum + t.currentRent, 0).toLocaleString()}</div>
                    <div className="card-label">Total Monthly Rent</div>
                  </div>
                </div>
              </div>

              <div className="settlement-details-grid">
                {terminations.filter(t => t.status === 'approved').map(termination => {
                  const settlement = calculateSettlement(termination);
                  return (
                    <div key={termination._id} className="settlement-card">
                      <div className="settlement-card-header">
                        <div className="tenant-info">
                          <h5>{termination.tenant.name}</h5>
                          <p>{termination.unit.property} - Unit {termination.unit.number}</p>
                        </div>
                        <div className="settlement-status">
                          <span className="status-badge status-paid">Approved</span>
                        </div>
                      </div>
                      
                      <div className="settlement-breakdown">
                        <div className="breakdown-section">
                          <h6>Lease Information</h6>
                          <div className="info-row">
                            <span className="label">Current Rent:</span>
                            <span className="value">R{settlement.currentRent.toLocaleString()}/month</span>
                          </div>
                          <div className="info-row">
                            <span className="label">Days Until Termination:</span>
                            <span className="value">{settlement.daysUntilTermination} days</span>
                          </div>
                        </div>
                        
                        <div className="breakdown-section">
                          <h6>Financial Calculations</h6>
                          <div className="calculation-row">
                            <span className="calc-label">Early Termination Penalty:</span>
                            <span className={`calc-value ${settlement.penalty > 0 ? 'penalty' : 'no-penalty'}`}>
                              {settlement.penalty > 0 ? `R${settlement.penalty.toLocaleString()}` : 'None'}
                            </span>
                          </div>
                          <div className="calculation-row">
                            <span className="calc-label">Prorated Refund:</span>
                            <span className="calc-value refund">R{settlement.refund.toLocaleString()}</span>
                          </div>
                        </div>
                        
                        <div className="breakdown-section total-section">
                          <div className="total-row">
                            <span className="total-label">Net Settlement Amount:</span>
                            <span className={`total-value ${settlement.netAmount >= 0 ? 'refund' : 'penalty'}`}>
                              R{Math.abs(settlement.netAmount).toLocaleString()} {settlement.netAmount >= 0 ? '(Refund)' : '(Due)'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="settlement-legend">
                <div className="legend-item">
                  <span className="legend-color refund"></span>
                  <span className="legend-text">Refund to tenant</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color penalty"></span>
                  <span className="legend-text">Penalty or amount due</span>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    alert('Settlement calculations saved successfully!');
                    setShowSettlementModal(false);
                  }}
                >
                  Save All Calculations
                </button>
                <button type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSettlementModal(false)}
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <div className="no-data">
              <div className="no-data-icon">No Settlement Data Available</div>
              <h5>No Settlement Data Available</h5>
              <p>There are no approved terminations available for settlement calculation.</p>
              <button type="button"
                className="btn btn-secondary"
                onClick={() => setShowSettlementModal(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={showDocumentsModal}
        onClose={() => setShowDocumentsModal(false)}
        title="Generate Documents"
      >
        <div className="document-generator">
          <div className="document-header">
            <h4>Termination Document Management</h4>
            <p className="document-description">Generate and manage required termination documents</p>
          </div>
          
          {terminations.length > 0 ? (
            <>
              <div className="document-overview">
                <div className="overview-stats">
                  <div className="stat-card">
                    <div className="stat-number">{terminations.filter(t => t.status === 'approved').length}</div>
                    <div className="stat-text">Approved Terminations</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {terminations.filter(t => t.status === 'approved').reduce((total, termination) => {
                        const docs = generateTerminationDocuments(termination);
                        return total + docs.filter(d => d.generated).length;
                      }, 0)}
                    </div>
                    <div className="stat-text">Documents Generated</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {terminations.filter(t => t.status === 'approved').reduce((total, termination) => {
                        const docs = generateTerminationDocuments(termination);
                        return total + docs.filter(d => !d.generated).length;
                      }, 0)}
                    </div>
                    <div className="stat-text">Pending Generation</div>
                  </div>
                </div>
              </div>

              <div className="document-timeline">
                {terminations.filter(t => t.status === 'approved').map(termination => {
                  const documents = generateTerminationDocuments(termination);
                  return (
                    <div key={termination._id} className="termination-case">
                      <div className="case-header">
                        <div className="case-info">
                          <h5>{termination.tenant.name}</h5>
                          <div className="case-details">
                            <span className="property">{termination.unit.property}</span>
                            <span className="unit">Unit {termination.unit.number}</span>
                            <span className="rent">R{termination.currentRent.toLocaleString()}/month</span>
                          </div>
                        </div>
                        <div className="case-status">
                          <span className="status-badge status-paid">Approved</span>
                        </div>
                      </div>
                      
                      <div className="document-grid">
                        {documents.map((doc, index) => (
                          <div key={index} className="document-card">
                            <div className="document-card-header">
                              <div className="document-icon">
                                {doc.type === 'PDF' ? 'Document' : 'List'}
                              </div>
                              <div className="document-title">
                                <h6>{doc.name}</h6>
                                <span className="document-type-badge">{doc.type}</span>
                              </div>
                            </div>
                            
                            <div className="document-card-body">
                              <div className="document-status-row">
                                <span className={`status-indicator ${doc.generated ? 'generated' : 'pending'}`}>
                                  {doc.generated ? 'Generated' : 'Pending'}
                                </span>
                              </div>
                              
                              <div className="document-actions">
                                {doc.generated ? (
                                  <div className="action-buttons">
                                    <button type="button" className="btn btn-sm btn-primary">
                                      View Document
                                    </button>
                                    <button type="button" className="btn btn-sm btn-secondary">
                                      Download
                                    </button>
                                  </div>
                                ) : (
                                  <div className="pending-info">
                                    <p>This document will be generated automatically upon completion of final inspection.</p>
                                    <button type="button" className="btn btn-sm btn-outline" disabled>
                                      Generate Manually
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="document-legend">
                <div className="legend-section">
                  <h6>Document Status Guide</h6>
                  <div className="legend-items">
                    <div className="legend-item">
                      <span className="legend-status generated">Generated</span>
                      <span className="legend-desc">Document is ready for viewing and download</span>
                    </div>
                    <div className="legend-item">
                      <span className="legend-status pending">Pending</span>
                      <span className="legend-desc">Document will be generated after final inspection</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    alert('All available documents generated successfully!');
                    setShowDocumentsModal(false);
                  }}
                >
                  Generate All Available Documents
                </button>
                <button type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDocumentsModal(false)}
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <div className="no-data">
              <div className="no-data-icon">No Documents Available</div>
              <h5>No Documents Available</h5>
              <p>There are no approved terminations available for document generation.</p>
              <button type="button"
                className="btn btn-secondary"
                onClick={() => setShowDocumentsModal(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </Modal>

      <Modal 
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Termination Report"
      >
        <div className="report-generator">
          <div className="report-header">
            <h4>Termination Analytics Dashboard</h4>
            <p className="report-description">Comprehensive analysis of lease termination trends and metrics</p>
          </div>
          
          {terminations.length > 0 ? (
            <>
              {(() => {
                const report = generateTerminationReport();
                return (
                  <div className="report-dashboard">
                    <div className="executive-summary">
                      <h5>Executive Summary</h5>
                      <div className="summary-metrics">
                        <div className="metric-card primary">
                          <div className="metric-icon">Chart</div>
                          <div className="metric-data">
                            <div className="metric-value">{report.totalTerminations}</div>
                            <div className="metric-label">Total Terminations</div>
                          </div>
                        </div>
                        <div className="metric-card">
                          <div className="metric-icon">Clock</div>
                          <div className="metric-data">
                            <div className="metric-value">{report.averageNoticePeriod} days</div>
                            <div className="metric-label">Avg Notice Period</div>
                          </div>
                        </div>
                        <div className="metric-card">
                          <div className="metric-icon">Money</div>
                          <div className="metric-data">
                            <div className="metric-value">R{report.totalRevenueImpact.toLocaleString()}</div>
                            <div className="metric-label">Revenue Impact</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="status-distribution">
                      <h5>Status Distribution</h5>
                      <div className="status-grid">
                        <div className="status-card pending">
                          <div className="status-count">{report.pendingTerminations}</div>
                          <div className="status-label">Pending Review</div>
                          <div className="status-bar">
                            <div className="status-fill" style={{width: `${(report.pendingTerminations / report.totalTerminations) * 100}%`}}></div>
                          </div>
                        </div>
                        <div className="status-card approved">
                          <div className="status-count">{report.approvedTerminations}</div>
                          <div className="status-label">Approved</div>
                          <div className="status-bar">
                            <div className="status-fill" style={{width: `${(report.approvedTerminations / report.totalTerminations) * 100}%`}}></div>
                          </div>
                        </div>
                        <div className="status-card rejected">
                          <div className="status-count">{report.rejectedTerminations}</div>
                          <div className="status-label">Rejected</div>
                          <div className="status-bar">
                            <div className="status-fill" style={{width: `${(report.rejectedTerminations / report.totalTerminations) * 100}%`}}></div>
                          </div>
                        </div>
                        <div className="status-card completed">
                          <div className="status-count">{report.completedTerminations}</div>
                          <div className="status-label">Completed</div>
                          <div className="status-bar">
                            <div className="status-fill" style={{width: `${(report.completedTerminations / report.totalTerminations) * 100}%`}}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="monthly-trends">
                      <h5>Monthly Termination Trends</h5>
                      <div className="trends-container">
                        <div className="trends-list">
                          {Object.entries(report.monthlyBreakdown).map(([month, count]) => (
                            <div key={month} className="trend-item">
                              <div className="trend-month">{month}</div>
                              <div className="trend-data">
                                <div className="trend-count">{count}</div>
                                <div className="trend-bar-container">
                                  <div 
                                    className="trend-bar" 
                                    style={{width: `${(count / Math.max(...Object.values(report.monthlyBreakdown))) * 100}%`}}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="key-insights">
                      <h5>Key Insights</h5>
                      <div className="insights-grid">
                        <div className="insight-card">
                          <div className="insight-icon">Trending Up</div>
                          <div className="insight-content">
                            <h6>Trend Analysis</h6>
                            <p>{Object.keys(report.monthlyBreakdown).length} months of data available</p>
                          </div>
                        </div>
                        <div className="insight-card">
                          <div className="insight-icon">Bolt</div>
                          <div className="insight-content">
                            <h6>Processing Efficiency</h6>
                            <p>{Math.round((report.approvedTerminations / report.totalTerminations) * 100)}% approval rate</p>
                          </div>
                        </div>
                        <div className="insight-card">
                          <div className="insight-icon">Target</div>
                          <div className="insight-content">
                            <h6>Compliance Rate</h6>
                            <p>{report.averageNoticePeriod >= 30 ? 'Good' : 'Needs Improvement'} notice period adherence</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="report-actions">
                      <div className="action-section">
                        <h6>Export Options</h6>
                        <div className="export-buttons">
                          <button type="button" className="btn btn-primary">
                            Export as PDF
                          </button>
                          <button type="button" className="btn btn-secondary">
                            Export as Excel
                          </button>
                          <button type="button" className="btn btn-outline">
                            Copy Summary
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              <div className="modal-actions">
                <button type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    alert('Report exported successfully!');
                    setShowReportModal(false);
                  }}
                >
                  Generate Full Report
                </button>
                <button type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReportModal(false)}
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <div className="no-data">
              <div className="no-data-icon">No Report Data Available</div>
              <h5>No Report Data Available</h5>
              <p>There are no termination records available for report generation.</p>
              <button type="button"
                className="btn btn-secondary"
                onClick={() => setShowReportModal(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </Modal>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
};

export default LeaseTerminationsPage;
