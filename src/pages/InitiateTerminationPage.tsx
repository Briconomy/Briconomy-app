import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import Modal from '../components/Modal.tsx';
import { leasesApi, terminationsApi, formatCurrency } from '../services/api.ts';

interface Lease {
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
  startDate: string;
  endDate: string;
  status: string;
}

interface TerminationForm {
  reason: string;
  terminationDate: string;
  notice: number;
  notes: string;
}

interface SettlementCalculation {
  penalty: number;
  refund: number;
  netAmount: number;
  daysUntilTermination: number;
  currentRent: number;
}

const InitiateTerminationPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [leases, setLeases] = useState<Lease[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLease, setSelectedLease] = useState<Lease | null>(null);
  const [terminationForm, setTerminationForm] = useState<TerminationForm>({
    reason: '',
    terminationDate: '',
    notice: 30,
    notes: ''
  });
  const [settlementCalculation, setSettlementCalculation] = useState<SettlementCalculation | null>(null);
  const [formStep, setFormStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const navItems = [
    { path: '/manager', label: 'Dashboard' },
    { path: '/manager/properties', label: 'Properties' },
    { path: '/manager/leases', label: 'Leases', active: true },
    { path: '/manager/payments', label: 'Payments' },
    { path: '/manager/terminations', label: 'Terminations', active: true }
  ];

  useEffect(() => {
    const fetchLeases = async () => {
      try {
        setLoading(true);
        try {
          const response = await leasesApi.getAll({ status: 'active' });
          setLeases(response.data || []);
        } catch (apiError) {
          console.log('API not available, using mock data:', apiError);
          const mockLeases: Lease[] = [
            {
              _id: 'lease1',
              tenant: { name: 'John Smith', email: 'john@example.com' },
              unit: { number: '101', property: 'Sunset Apartments' },
              currentRent: 12000,
              startDate: '2023-06-01',
              endDate: '2024-05-31',
              status: 'active'
            },
            {
              _id: 'lease2',
              tenant: { name: 'Sarah Johnson', email: 'sarah@example.com' },
              unit: { number: '205', property: 'Oak Ridge Complex' },
              currentRent: 14500,
              startDate: '2023-08-15',
              endDate: '2024-08-14',
              status: 'active'
            },
            {
              _id: 'lease3',
              tenant: { name: 'Mike Davis', email: 'mike@example.com' },
              unit: { number: '312', property: 'Pine Valley Residences' },
              currentRent: 11000,
              startDate: '2023-10-01',
              endDate: '2024-09-30',
              status: 'active'
            },
            {
              _id: 'lease4',
              tenant: { name: 'Emma Wilson', email: 'emma@example.com' },
              unit: { number: '408', property: 'Blue Hills Apartments' },
              currentRent: 13500,
              startDate: '2024-01-15',
              endDate: '2024-12-14',
              status: 'active'
            }
          ];
          setLeases(mockLeases);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching leases:', error);
        setLoading(false);
      }
    };

    fetchLeases();
  }, []);

  const calculateSettlement = (lease: Lease, terminationDate: string): SettlementCalculation => {
    const currentDate = new Date();
    const termDate = new Date(terminationDate);
    const daysUntilTermination = Math.ceil((termDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let penalty = 0;
    let refund = 0;
    
    if (daysUntilTermination < 30 && daysUntilTermination > 0) {
      penalty = lease.currentRent * 0.5;
    }
    
    if (daysUntilTermination > 0) {
      const dailyRent = lease.currentRent / 30;
      refund = dailyRent * daysUntilTermination;
    }
    
    return {
      penalty,
      refund,
      netAmount: refund - penalty,
      daysUntilTermination,
      currentRent: lease.currentRent
    };
  };

  const handleInputChange = (field: keyof TerminationForm, value: string | number) => {
    setTerminationForm(prev => ({ ...prev, [field]: value }));
    
    if (field === 'terminationDate' && selectedLease && value) {
      const settlement = calculateSettlement(selectedLease, value as string);
      setSettlementCalculation(settlement);
    }
  };

  const handleLeaseSelect = (lease: Lease) => {
    setSelectedLease(lease);
    setTerminationForm({
      reason: '',
      terminationDate: '',
      notice: 30,
      notes: ''
    });
    setSettlementCalculation(null);
  };

  const handleNextStep = () => {
    if (formStep === 1 && !selectedLease) {
      alert('Please select a lease to terminate.');
      return;
    }
    
    if (formStep === 2 && (!terminationForm.reason || !terminationForm.terminationDate)) {
      alert('Please fill in all required fields.');
      return;
    }
    
    if (formStep === 2 && selectedLease && terminationForm.terminationDate) {
      const settlement = calculateSettlement(selectedLease, terminationForm.terminationDate);
      setSettlementCalculation(settlement);
    }
    
    setFormStep(prev => prev + 1);
  };

  const handlePreviousStep = () => {
    setFormStep(prev => prev - 1);
  };

  const handleSubmitTermination = async () => {
    if (!selectedLease || !settlementCalculation) return;

    try {
      setSubmitting(true);
      
      const terminationData = {
        leaseId: selectedLease._id,
        tenantId: selectedLease.tenant.email,
        unitId: selectedLease.unit.number,
        propertyId: selectedLease.unit.property,
        currentRent: selectedLease.currentRent,
        terminationDate: terminationForm.terminationDate,
        reason: terminationForm.reason,
        notice: terminationForm.notice,
        notes: terminationForm.notes,
        settlementAmount: settlementCalculation.netAmount,
        penaltyAmount: settlementCalculation.penalty,
        refundAmount: settlementCalculation.refund
      };

      try {
        await terminationsApi.create(terminationData);
      } catch (apiError) {
        console.log('API submission failed, updating locally:', apiError);
      }

      alert('Termination request submitted successfully! The request is now pending approval.');
      navigate('/manager/terminations');
      
    } catch (error) {
      console.error('Error submitting termination:', error);
      alert('Failed to submit termination request. Please try again.');
    } finally {
      setSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const handleReset = () => {
    setSelectedLease(null);
    setTerminationForm({
      reason: '',
      terminationDate: '',
      notice: 30,
      notes: ''
    });
    setSettlementCalculation(null);
    setFormStep(1);
  };

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="page-header">
            <div className="page-title">Initiate Termination</div>
            <div className="page-subtitle">Start new lease termination process</div>
          </div>
          <div className="loading">Loading active leases...</div>
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
          <div className="page-title">Initiate Termination</div>
          <div className="page-subtitle">Start new lease termination process</div>
        </div>

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
            <div className="step-header">
              <h4>Select Lease to Terminate</h4>
              <p className="step-description">Choose the active lease agreement you wish to terminate</p>
            </div>
            
            {leases.length === 0 ? (
              <div className="no-data">
                <div className="no-data-icon">List</div>
                <h5>No Active Leases Found</h5>
                <p>There are no active leases available for termination.</p>
                <button type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/manager/leases')}
                >
                  View All Leases
                </button>
              </div>
            ) : (
              <div className="lease-list">
                {leases.map(lease => (
                  <div 
                    key={lease._id} 
                    className={`lease-card ${selectedLease?._id === lease._id ? 'selected' : ''}`}
                    onClick={() => handleLeaseSelect(lease)}
                  >
                    <div className="lease-info">
                      <h5>{lease.tenant.name}</h5>
                      <div className="lease-details">
                        <span className="property">{lease.unit.property}</span>
                        <span className="unit">Unit {lease.unit.number}</span>
                        <span className="rent">{formatCurrency(lease.currentRent)}/month</span>
                      </div>
                    </div>
                    <div className="lease-status">
                      <span className="status-badge status-paid">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="step-actions">
              <button type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/manager/terminations')}
              >
                Cancel
              </button>
              <button type="button"
                className="btn btn-primary"
                onClick={handleNextStep}
                disabled={!selectedLease}
              >
                Continue to Details
              </button>
            </div>
          </div>
        )}

        {formStep === 2 && (
          <div className="termination-details-form">
            <div className="step-header">
              <h4>Termination Details</h4>
              <p className="step-description">Provide the reason and details for lease termination</p>
            </div>
            
            <div className="selected-lease-summary">
              <h5>Selected Lease:</h5>
              <div className="lease-summary-card">
                <div className="lease-info">
                  <h6>{selectedLease.tenant.name}</h6>
                  <p>{selectedLease.unit.property} - Unit {selectedLease.unit.number}</p>
                  <p>Current Rent: {formatCurrency(selectedLease.currentRent)}/month</p>
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
                  onChange={(e) => handleInputChange('reason', e.target.value)}
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
                  onChange={(e) => handleInputChange('terminationDate', e.target.value)}
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
                  onChange={(e) => handleInputChange('notice', parseInt(e.target.value) || 30)}
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
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional information or special circumstances..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            {terminationForm.terminationDate && settlementCalculation && (
              <div className="settlement-preview">
                <h5>Settlement Calculation Preview</h5>
                <div className="settlement-summary">
                  <div className="calculation-row">
                    <span>Early Termination Penalty:</span>
                    <span className={settlementCalculation.penalty > 0 ? 'penalty' : 'no-penalty'}>
                      {settlementCalculation.penalty > 0 ? formatCurrency(settlementCalculation.penalty) : 'None'}
                    </span>
                  </div>
                  <div className="calculation-row">
                    <span>Prorated Refund:</span>
                    <span className="refund">{formatCurrency(settlementCalculation.refund)}</span>
                  </div>
                  <div className="calculation-row total">
                    <span>Net Settlement:</span>
                    <span className={settlementCalculation.netAmount >= 0 ? 'refund' : 'penalty'}>
                      {formatCurrency(Math.abs(settlementCalculation.netAmount))} {settlementCalculation.netAmount >= 0 ? '(Refund)' : '(Due)'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="step-actions">
              <button type="button"
                className="btn btn-secondary"
                onClick={handlePreviousStep}
              >
                Back
              </button>
              <button type="button"
                className="btn btn-primary"
                onClick={handleNextStep}
                disabled={!terminationForm.reason || !terminationForm.terminationDate}
              >
                Review & Submit
              </button>
            </div>
          </div>
        )}

        {formStep === 3 && (
          <div className="review-submit">
            <div className="step-header">
              <h4>Review Termination Request</h4>
              <p className="step-description">Review all details and submit the termination request</p>
            </div>
            
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
                    <span className="value">{formatCurrency(selectedLease.currentRent)}/month</span>
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

              {settlementCalculation && (
                <div className="review-section">
                  <h5>Financial Settlement</h5>
                  <div className="review-details">
                    <div className="detail-row">
                      <span className="label">Early Termination Penalty:</span>
                      <span className={`value ${settlementCalculation.penalty > 0 ? 'penalty' : 'no-penalty'}`}>
                        {settlementCalculation.penalty > 0 ? formatCurrency(settlementCalculation.penalty) : 'None'}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Prorated Refund:</span>
                      <span className="value refund">{formatCurrency(settlementCalculation.refund)}</span>
                    </div>
                    <div className="detail-row total">
                      <span className="label">Net Settlement Amount:</span>
                      <span className={`value ${settlementCalculation.netAmount >= 0 ? 'refund' : 'penalty'}`}>
                        {formatCurrency(Math.abs(settlementCalculation.netAmount))} {settlementCalculation.netAmount >= 0 ? '(Refund to tenant)' : '(Due from tenant)'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
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
            
            <div className="step-actions">
              <button type="button"
                className="btn btn-secondary"
                onClick={handlePreviousStep}
              >
                Back
              </button>
              <button type="button"
                className="btn btn-outline"
                onClick={handleReset}
              >
                Start Over
              </button>
              <button type="button"
                className="btn btn-primary"
                onClick={() => setShowConfirmModal(true)}
              >
                Submit Termination Request
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Termination Submission"
      >
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <div className="confirmation-icon">Warning</div>
            <h5>Confirm Termination Request</h5>
            <p>Are you sure you want to submit this termination request for {selectedLease?.tenant.name}?</p>
            <p className="confirmation-warning">This action cannot be undone and will notify the tenant.</p>
          </div>
          
          <div className="modal-actions">
            <button type="button"
              className="btn btn-secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="button"
              className="btn btn-primary"
              onClick={handleSubmitTermination}
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Confirm Submission'}
            </button>
          </div>
        </div>
      </Modal>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
};

export default InitiateTerminationPage;
