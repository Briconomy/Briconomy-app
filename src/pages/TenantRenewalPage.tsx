import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { renewalsApi, useApi, formatCurrency, formatDate } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

function TenantRenewalPage() {
  const navigate = useNavigate();
  const { t: _t } = useLanguage();
  const { user } = useAuth();
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedRenewal, setSelectedRenewal] = useState<Record<string, unknown> | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const { data: renewals, loading, error, refetch } = useApi(
    () => user?.id ? renewalsApi.getAll(undefined, user.id) : Promise.resolve([]),
    [user?.id]
  );

  const navItems = [
    { path: '/tenant', label: 'Home' },
    { path: '/tenant/payments', label: 'Payments' },
    { path: '/tenant/requests', label: 'Requests' },
    { path: '/tenant/profile', label: 'Profile', active: true }
  ];

  const handleAcceptClick = (renewal: Record<string, unknown>) => {
    setSelectedRenewal(renewal);
    setShowAcceptModal(true);
  };

  const handleDeclineClick = (renewal: Record<string, unknown>) => {
    setSelectedRenewal(renewal);
    setDeclineReason('');
    setShowDeclineModal(true);
  };

  const handleAcceptSubmit = async () => {
    if (!selectedRenewal?.id || !user?.id) return;

    setProcessing(true);
    try {
      await renewalsApi.update(selectedRenewal.id as string, {
        status: 'accepted',
        tenantResponse: 'accepted',
        tenantResponseDate: new Date(),
        managerId: user.id
      });
      alert('Renewal offer accepted successfully!');
      setShowAcceptModal(false);
      setSelectedRenewal(null);
      refetch();
    } catch (err) {
      console.error('Error accepting renewal:', err);
      alert('Failed to accept renewal offer. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeclineSubmit = async () => {
    if (!selectedRenewal?.id || !user?.id || !declineReason.trim()) {
      alert('Please provide a reason for declining.');
      return;
    }

    setProcessing(true);
    try {
      await renewalsApi.update(selectedRenewal.id as string, {
        status: 'declined',
        tenantResponse: 'declined',
        tenantResponseDate: new Date(),
        declineReason: declineReason.trim(),
        managerId: user.id
      });
      alert('Renewal offer declined.');
      setShowDeclineModal(false);
      setSelectedRenewal(null);
      setDeclineReason('');
      refetch();
    } catch (err) {
      console.error('Error declining renewal:', err);
      alert('Failed to decline renewal offer. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="loading-state">
            <p>Loading renewal offers...</p>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="error-state">
            <p>Error loading renewal offers: {error}</p>
            <button type="button" className="btn btn-primary" onClick={() => refetch()}>
              Retry
            </button>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />
      
      <div className="main-content" style={{ paddingBottom: '80px' }}>
        <div className="page-header">
          <div className="page-title">Renewal Offers</div>
          <div className="page-subtitle">Review and respond to your lease renewal offers</div>
        </div>

        {!renewals || renewals.length === 0 ? (
          <div className="empty-state">
            <p>No Pending Renewals</p>
            <small>You don't have any pending renewal offers at this time.</small>
            <button 
              type="button"
              className="btn btn-primary" 
              onClick={() => navigate('/tenant')}
              style={{ marginTop: '16px' }}
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <div className="renewal-list">
            {renewals.map((renewal: Record<string, unknown>) => (
              <div key={renewal.id as string} className="renewal-card" style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '16px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold' }}>
                    {((renewal.property as Record<string, unknown>)?.name as string) || 'Property'}
                  </h3>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    Unit {((renewal.unit as Record<string, unknown>)?.unitNumber as string) || 'N/A'}
                  </p>
                </div>

                <div className="detail-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '20px'
                }}>
                  <div>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
                      Current Rent
                    </label>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '16px' }}>
                      {formatCurrency(renewal.currentRent as number)}
                    </p>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
                      Proposed Rent
                    </label>
                    <p style={{ margin: 0, fontWeight: '600', fontSize: '16px', color: '#3498db' }}>
                      {formatCurrency(renewal.proposedRent as number)}
                    </p>
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px' }}>
                      New Lease Period
                    </label>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                      {formatDate(renewal.proposedStartDate as string)} - {formatDate(renewal.proposedEndDate as string)}
                    </p>
                  </div>

                  {renewal.proposedTerms && (
                    <div style={{ gridColumn: '1 / -1', background: '#f8f9fa', padding: '12px', borderRadius: '8px' }}>
                      <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '4px', fontWeight: '600' }}>
                        Additional Terms
                      </label>
                      <p style={{ margin: 0, fontSize: '14px' }}>
                        {renewal.proposedTerms as string}
                      </p>
                    </div>
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  gap: '12px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e0e0e0'
                }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleAcceptClick(renewal)}
                    style={{ flex: 1 }}
                  >
                    Accept Offer
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleDeclineClick(renewal)}
                    style={{ flex: 1 }}
                  >
                    Decline Offer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAcceptModal && selectedRenewal && (
        <div className="modal-backdrop" onClick={() => !processing && setShowAcceptModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h2 style={{ marginTop: 0 }}>Accept Renewal Offer</h2>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Are you sure you want to accept this renewal offer?
            </p>

            <div style={{
              background: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Property:</strong> {((selectedRenewal.property as Record<string, unknown>)?.name as string) || 'N/A'}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Unit:</strong> {((selectedRenewal.unit as Record<string, unknown>)?.unitNumber as string) || 'N/A'}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>New Rent:</strong> {formatCurrency(selectedRenewal.proposedRent as number)}
              </div>
              <div>
                <strong>Period:</strong> {formatDate(selectedRenewal.proposedStartDate as string)} - {formatDate(selectedRenewal.proposedEndDate as string)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAcceptModal(false)}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAcceptSubmit}
                disabled={processing}
              >
                {processing ? 'Processing...' : 'Confirm Accept'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeclineModal && selectedRenewal && (
        <div className="modal-backdrop" onClick={() => !processing && setShowDeclineModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h2 style={{ marginTop: 0 }}>Decline Renewal Offer</h2>
            <p style={{ marginBottom: '16px', color: '#666' }}>
              Please provide a reason for declining this renewal offer:
            </p>

            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Enter your reason for declining..."
              rows={4}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                marginBottom: '24px',
                fontFamily: 'inherit',
                fontSize: '14px'
              }}
              disabled={processing}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowDeclineModal(false)}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeclineSubmit}
                disabled={processing || !declineReason.trim()}
              >
                {processing ? 'Processing...' : 'Confirm Decline'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default TenantRenewalPage;
