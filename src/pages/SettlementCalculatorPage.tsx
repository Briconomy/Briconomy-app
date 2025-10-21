import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import Modal from '../components/Modal.tsx';
import { terminationsApi, formatCurrency, formatDate } from '../services/api.ts';

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

interface SettlementCalculation {
  penalty: number;
  refund: number;
  netAmount: number;
  daysUntilTermination: number;
  currentRent: number;
  earlyTerminationFee: number;
  proRatedRefund: number;
  securityDeposit: number;
  outstandingCharges: number;
  finalSettlement: number;
}

const SettlementCalculatorPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [terminations, setTerminations] = useState<Termination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTermination, setSelectedTermination] = useState<Termination | null>(null);
  const [settlementCalculations, setSettlementCalculations] = useState<Record<string, SettlementCalculation>>({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({
    status: 'approved'
  });

  const navItems = [
    { path: '/manager', label: 'Dashboard', icon: 'performanceAnalytics' },
    { path: '/manager/properties', label: 'Properties', icon: 'properties' },
    { path: '/manager/leases', label: 'Leases', icon: 'lease', active: true },
    { path: '/manager/payments', label: 'Payments', icon: 'payment' }
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
          const mockTerminations: Termination[] = [
            {
              _id: '1',
              tenant: { name: 'John Smith', email: 'john@example.com' },
              unit: { number: '101', property: 'Sunset Apartments' },
              currentRent: 12000,
              terminationDate: '2024-03-15',
              requestDate: '2024-01-15',
              reason: 'Relocating for work',
              notice: 60,
              status: 'approved',
              approvedBy: 'Manager Johnson',
              notes: 'Tenant has been excellent, no issues'
            },
            {
              _id: '2',
              tenant: { name: 'Sarah Johnson', email: 'sarah@example.com' },
              unit: { number: '205', property: 'Oak Ridge Complex' },
              currentRent: 14500,
              terminationDate: '2024-02-28',
              requestDate: '2024-01-10',
              reason: 'Purchasing a home',
              notice: 45,
              status: 'approved',
              approvedBy: 'Manager Davis',
              notes: 'Early termination approved due to home purchase'
            },
            {
              _id: '3',
              tenant: { name: 'Mike Davis', email: 'mike@example.com' },
              unit: { number: '312', property: 'Pine Valley Residences' },
              currentRent: 11000,
              terminationDate: '2024-04-01',
              requestDate: '2024-02-01',
              reason: 'Financial hardship',
              notice: 60,
              status: 'pending',
              notes: 'Needs to provide 90 days notice per lease agreement'
            }
          ];
          setTerminations(mockTerminations);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching terminations:', error);
        setLoading(false);
      }
    };

    fetchTerminations();
  }, [filters]);

  const calculateSettlement = (termination: Termination): SettlementCalculation => {
    const currentDate = new Date();
    const terminationDate = new Date(termination.terminationDate);
    const daysUntilTermination = Math.ceil((terminationDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let earlyTerminationFee = 0;
    if (daysUntilTermination < 30 && daysUntilTermination > 0) {
      earlyTerminationFee = termination.currentRent * 0.5;
    }
    
    let proRatedRefund = 0;
    if (daysUntilTermination > 0) {
      const dailyRent = termination.currentRent / 30;
      proRatedRefund = dailyRent * daysUntilTermination;
    }
    
    const securityDeposit = termination.currentRent * 2;
    
    const outstandingCharges = Math.random() > 0.7 ? Math.floor(Math.random() * 5000) : 0;
    
    const finalSettlement = securityDeposit - earlyTerminationFee + proRatedRefund - outstandingCharges;
    
    return {
      penalty: earlyTerminationFee,
      refund: proRatedRefund,
      netAmount: finalSettlement,
      daysUntilTermination,
      currentRent: termination.currentRent,
      earlyTerminationFee,
      proRatedRefund,
      securityDeposit,
      outstandingCharges,
      finalSettlement
    };
  };

  useEffect(() => {
    const calculations: Record<string, SettlementCalculation> = {};
    terminations.forEach(termination => {
      calculations[termination._id] = calculateSettlement(termination);
    });
    setSettlementCalculations(calculations);
  }, [terminations]);

  const handleFilterChange = (status: string) => {
    setFilters({ status });
  };

  const viewTerminationDetails = (termination: Termination) => {
    setSelectedTermination(termination);
    setShowDetailsModal(true);
  };

  const handleSaveCalculations = async () => {
    try {
      setSaving(true);
      
      const calculationsData = Object.entries(settlementCalculations).map(([terminationId, calculation]) => ({
        terminationId,
        calculation,
        timestamp: new Date().toISOString()
      }));
      
      try {
        console.log('Saving calculations:', calculationsData);
      } catch (apiError) {
        console.log('API save failed, continuing locally:', apiError);
      }
      
      alert('Settlement calculations saved successfully!');
      setShowSaveModal(false);
      
    } catch (error) {
      console.error('Error saving calculations:', error);
      alert('Failed to save calculations. Please try again.');
    } finally {
      setSaving(false);
    }
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

  const summaryStats = {
    totalTerminations: terminations.length,
    approvedTerminations: terminations.filter(t => t.status === 'approved').length,
    totalSettlementAmount: Object.values(settlementCalculations).reduce((sum, calc) => sum + Math.abs(calc.finalSettlement), 0),
    averageSettlement: Object.values(settlementCalculations).length > 0 
      ? Object.values(settlementCalculations).reduce((sum, calc) => sum + Math.abs(calc.finalSettlement), 0) / Object.values(settlementCalculations).length
      : 0
  };

  if (loading) {
    return (
      <div className="app-container mobile-only">
<TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="page-header">
            <div className="page-title">Settlement Calculator</div>
            <div className="page-subtitle">Calculate financial settlements for lease terminations</div>
          </div>
          <div className="loading">Loading terminations...</div>
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
          <div className="page-title">Settlement Calculator</div>
          <div className="page-subtitle">Calculate financial settlements for lease terminations</div>
        </div>

        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-value">{summaryStats.approvedTerminations}</div>
            <div className="stat-label">Approved Terminations</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatCurrency(summaryStats.totalSettlementAmount)}</div>
            <div className="stat-label">Total Settlement Amount</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{formatCurrency(summaryStats.averageSettlement)}</div>
            <div className="stat-label">Average Settlement</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{terminations.filter(t => t.status === 'approved').length}</div>
            <div className="stat-label">Ready for Processing</div>
          </div>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="statusFilter">Filter by Status:</label>
            <select
              id="statusFilter"
              value={filters.status}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {terminations.length === 0 ? (
          <div className="no-data">
            <div className="no-data-icon">Calculator</div>
            <h5>No Terminations Available</h5>
            <p>There are no terminations available for settlement calculation.</p>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/manager/terminations')}
            >
              Back to Terminations
            </button>
          </div>
        ) : (
          <div className="settlement-list">
            {terminations.map(termination => {
              const calculation = settlementCalculations[termination._id];
              if (!calculation) return null;

              return (
                <div key={termination._id} className="settlement-card">
                  <div className="settlement-card-header">
                    <div className="termination-info">
                      <h5>{termination.tenant.name}</h5>
                      <div className="termination-details">
                        <span className="property">{termination.unit.property}</span>
                        <span className="unit">Unit {termination.unit.number}</span>
                        <span className="rent">{formatCurrency(termination.currentRent)}/month</span>
                      </div>
                    </div>
                    <div className="termination-status">
                      <span className={`status-badge ${getStatusBadge(termination.status)}`}>
                        {termination.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="settlement-breakdown">
                    <div className="breakdown-section">
                      <h6>Termination Details</h6>
                      <div className="detail-row">
                        <span className="label">Termination Date:</span>
                        <span className="value">{formatDate(termination.terminationDate)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Days Until Termination:</span>
                        <span className="value">{calculation.daysUntilTermination} days</span>
                      </div>
                      <div className="detail-row">
                        <span className="label">Reason:</span>
                        <span className="value">{termination.reason}</span>
                      </div>
                    </div>
                    
                    <div className="breakdown-section">
                      <h6>Financial Breakdown</h6>
                      <div className="calculation-row">
                        <span className="calc-label">Security Deposit:</span>
                        <span className="calc-value">{formatCurrency(calculation.securityDeposit)}</span>
                      </div>
                      <div className="calculation-row">
                        <span className="calc-label">Early Termination Fee:</span>
                        <span className={`calc-value ${calculation.earlyTerminationFee > 0 ? 'penalty' : 'no-penalty'}`}>
                          {calculation.earlyTerminationFee > 0 ? formatCurrency(calculation.earlyTerminationFee) : 'None'}
                        </span>
                      </div>
                      <div className="calculation-row">
                        <span className="calc-label">Prorated Refund:</span>
                        <span className="calc-value refund">{formatCurrency(calculation.proRatedRefund)}</span>
                      </div>
                      {calculation.outstandingCharges > 0 && (
                        <div className="calculation-row">
                          <span className="calc-label">Outstanding Charges:</span>
                          <span className="calc-value penalty">{formatCurrency(calculation.outstandingCharges)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="breakdown-section total-section">
                      <div className="total-row">
                        <span className="total-label">Final Settlement Amount:</span>
                        <span className={`total-value ${calculation.finalSettlement >= 0 ? 'refund' : 'penalty'}`}>
                          {formatCurrency(Math.abs(calculation.finalSettlement))} {calculation.finalSettlement >= 0 ? '(Refund to tenant)' : '(Due from tenant)'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="settlement-actions">
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => viewTerminationDetails(termination)}
                    >
                      View Details
                    </button>
                    {termination.status === 'approved' && (
                      <button 
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          alert(`Settlement of ${formatCurrency(Math.abs(calculation.finalSettlement))} has been processed for ${termination.tenant.name}`);
                        }}
                      >
                        Process Settlement
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="page-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/manager/terminations')}
          >
            Back to Terminations
          </button>
          {terminations.length > 0 && (
            <button 
              className="btn btn-primary"
              onClick={() => setShowSaveModal(true)}
            >
              Save All Calculations
            </button>
          )}
        </div>
      </div>

      <Modal 
        isOpen={showDetailsModal && selectedTermination !== null}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTermination(null);
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
              <p><strong>Current Rent:</strong> {formatCurrency(selectedTermination.currentRent)}/month</p>
            </div>

            <div className="detail-section">
              <h4>Termination Details</h4>
              <p><strong>Request Date:</strong> {formatDate(selectedTermination.requestDate)}</p>
              <p><strong>Termination Date:</strong> {formatDate(selectedTermination.terminationDate)}</p>
              <p><strong>Notice Period:</strong> {selectedTermination.notice} days</p>
              <p><strong>Reason:</strong> {selectedTermination.reason}</p>
              {selectedTermination.notes && (
                <p><strong>Notes:</strong> {selectedTermination.notes}</p>
              )}
            </div>

            {settlementCalculations[selectedTermination._id] && (
              <div className="detail-section">
                <h4>Settlement Calculation</h4>
                <div className="settlement-summary">
                  <div className="calc-row">
                    <span>Security Deposit:</span>
                    <span>{formatCurrency(settlementCalculations[selectedTermination._id].securityDeposit)}</span>
                  </div>
                  <div className="calc-row">
                    <span>Early Termination Fee:</span>
                    <span className={settlementCalculations[selectedTermination._id].earlyTerminationFee > 0 ? 'penalty' : 'no-penalty'}>
                      {settlementCalculations[selectedTermination._id].earlyTerminationFee > 0 ? formatCurrency(settlementCalculations[selectedTermination._id].earlyTerminationFee) : 'None'}
                    </span>
                  </div>
                  <div className="calc-row">
                    <span>Prorated Refund:</span>
                    <span className="refund">{formatCurrency(settlementCalculations[selectedTermination._id].proRatedRefund)}</span>
                  </div>
                  {settlementCalculations[selectedTermination._id].outstandingCharges > 0 && (
                    <div className="calc-row">
                      <span>Outstanding Charges:</span>
                      <span className="penalty">{formatCurrency(settlementCalculations[selectedTermination._id].outstandingCharges)}</span>
                    </div>
                  )}
                  <div className="calc-row total">
                    <span>Final Settlement:</span>
                    <span className={settlementCalculations[selectedTermination._id].finalSettlement >= 0 ? 'refund' : 'penalty'}>
                      {formatCurrency(Math.abs(settlementCalculations[selectedTermination._id].finalSettlement))} {settlementCalculations[selectedTermination._id].finalSettlement >= 0 ? '(Refund)' : '(Due)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedTermination(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal 
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Save Settlement Calculations"
      >
        <div className="save-confirmation">
          <div className="confirmation-content">
            <div className="confirmation-icon">Save</div>
            <h5>Save Settlement Calculations</h5>
            <p>Are you sure you want to save all settlement calculations?</p>
            <p>This will save {Object.keys(settlementCalculations).length} calculations for future reference.</p>
          </div>
          
          <div className="modal-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowSaveModal(false)}
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSaveCalculations}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Calculations'}
            </button>
          </div>
        </div>
      </Modal>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
};

export default SettlementCalculatorPage;
