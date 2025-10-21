import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { leasesApi, terminationsApi, useApi, formatDate } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

function TenantTerminationPage() {
  const navigate = useNavigate();
  const { t: _t } = useLanguage();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    reason: '',
    terminationDate: '',
    additionalNotes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const { data: lease, loading: leaseLoading } = useApi(
    () => user?.id ? leasesApi.getMyLease(user.id) : Promise.resolve(null),
    [user?.id]
  );

  const { data: existingTerminations, loading: terminationsLoading, refetch } = useApi(
    () => user?.id ? terminationsApi.getAll(undefined, user.id) : Promise.resolve([]),
    [user?.id]
  );

  const navItems = [
    { path: '/tenant', label: 'Home' },
    { path: '/tenant/payments', label: 'Payments' },
    { path: '/tenant/requests', label: 'Requests' },
    { path: '/tenant/profile', label: 'Profile', active: true }
  ];

  const calculateNoticePeriod = () => {
    if (!formData.terminationDate) return null;
    
    const today = new Date();
    const terminationDate = new Date(formData.terminationDate);
    const diffTime = terminationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const noticeDays = calculateNoticePeriod();
  const showEarlyTerminationWarning = noticeDays !== null && noticeDays < 30;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id || !lease?._id) {
      alert('Unable to submit termination request. Please try again.');
      return;
    }

    if (!formData.reason.trim()) {
      alert('Please provide a reason for termination.');
      return;
    }

    if (!formData.terminationDate) {
      alert('Please select a desired termination date.');
      return;
    }

    const noticePeriod = calculateNoticePeriod();
    if (noticePeriod === null || noticePeriod < 0) {
      alert('Termination date must be in the future.');
      return;
    }

    setSubmitting(true);
    try {
      const leaseData = lease as Record<string, unknown>;
      await terminationsApi.create({
        tenantId: user.id,
        leaseId: lease._id as string,
        propertyId: ((leaseData.property as Record<string, unknown>)?._id as string) || '',
        unitId: ((leaseData.unit as Record<string, unknown>)?._id as string) || '',
        reason: formData.reason.trim(),
        requestedDate: new Date(),
        terminationDate: new Date(formData.terminationDate),
        noticePeriod: noticePeriod,
        additionalNotes: formData.additionalNotes.trim() || undefined
      });

      alert('Termination request submitted successfully. Your property manager will review it.');
      setFormData({ reason: '', terminationDate: '', additionalNotes: '' });
      refetch();
      navigate('/tenant');
    } catch (err) {
      console.error('Error submitting termination:', err);
      alert('Failed to submit termination request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const hasPendingTermination = existingTerminations?.some(
    (t: Record<string, unknown>) => t.status === 'pending'
  );

  if (leaseLoading || terminationsLoading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="loading-state">
            <p>Loading...</p>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  if (!lease) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="empty-state">
            <p>No Active Lease</p>
            <small>You don't have an active lease agreement.</small>
            <button 
              type="button"
              className="btn btn-primary" 
              onClick={() => navigate('/tenant')}
              style={{ marginTop: '16px' }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  const leaseData = lease as Record<string, unknown>;

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />
      
      <div className="main-content" style={{ paddingBottom: '80px' }}>
        <div className="page-header">
          <div className="page-title">Request Termination</div>
          <div className="page-subtitle">Submit a request to terminate your lease agreement</div>
        </div>

        {hasPendingTermination && (
          <div style={{
            background: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <strong style={{ color: '#856404' }}>Pending Request</strong>
            <p style={{ margin: '8px 0 0 0', color: '#856404', fontSize: '14px' }}>
              You already have a pending termination request. Please wait for your property manager to review it.
            </p>
          </div>
        )}

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Current Lease Information</h3>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <p><strong>Property:</strong> {((leaseData.property as Record<string, unknown>)?.name as string) || 'N/A'}</p>
            <p><strong>Unit:</strong> {((leaseData.unit as Record<string, unknown>)?.unitNumber as string) || 'N/A'}</p>
            <p><strong>Lease End Date:</strong> {formatDate(leaseData.endDate as string)}</p>
            <p><strong>Monthly Rent:</strong> R {((leaseData.rentAmount as number) || 0).toLocaleString()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="reason" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                Reason for Termination <span style={{ color: 'red' }}>*</span>
              </label>
              <textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Please explain why you need to terminate your lease..."
                rows={4}
                required
                disabled={submitting || hasPendingTermination}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontFamily: 'inherit',
                  fontSize: '14px'
                }}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="terminationDate" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                Desired Termination Date <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="date"
                id="terminationDate"
                value={formData.terminationDate}
                onChange={(e) => setFormData({ ...formData, terminationDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
                disabled={submitting || hasPendingTermination}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              />
              {noticeDays !== null && (
                <p style={{ 
                  margin: '8px 0 0 0', 
                  fontSize: '12px',
                  color: showEarlyTerminationWarning ? '#e74c3c' : '#27ae60'
                }}>
                  Notice period: {noticeDays} days
                </p>
              )}
            </div>

            {showEarlyTerminationWarning && (
              <div style={{
                background: '#fee',
                border: '1px solid #e74c3c',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px'
              }}>
                <strong style={{ color: '#c0392b', fontSize: '14px' }}>Early Termination Warning</strong>
                <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#c0392b' }}>
                  Your notice period is less than 30 days. This may result in an early termination penalty 
                  of approximately R {(((leaseData.rentAmount as number) || 0) * 0.5).toLocaleString()}.
                </p>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label htmlFor="additionalNotes" style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>
                Additional Notes (Optional)
              </label>
              <textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
                placeholder="Any additional information you'd like to provide..."
                rows={3}
                disabled={submitting || hasPendingTermination}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontFamily: 'inherit',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{
              background: '#e8f4f8',
              border: '1px solid #3498db',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px'
            }}>
              <strong style={{ color: '#2980b9', fontSize: '14px' }}>Important Information</strong>
              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '13px', color: '#2c3e50' }}>
                <li>Your property manager will review your request and contact you.</li>
                <li>Standard notice period is 30 days.</li>
                <li>Early termination may incur penalties.</li>
                <li>You remain responsible for rent until termination is approved.</li>
              </ul>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || hasPendingTermination}
              style={{ width: '100%' }}
            >
              {submitting ? 'Submitting...' : 'Submit Termination Request'}
            </button>
          </div>
        </form>

        {existingTerminations && existingTerminations.length > 0 && (
          <div style={{ marginTop: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>Previous Requests</h3>
            {existingTerminations.map((termination: Record<string, unknown>) => (
              <div
                key={termination._id as string}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ marginBottom: '8px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: (termination.status as string) === 'approved' ? '#d4edda' : 
                                  (termination.status as string) === 'rejected' ? '#f8d7da' : '#fff3cd',
                      color: (termination.status as string) === 'approved' ? '#155724' : 
                             (termination.status as string) === 'rejected' ? '#721c24' : '#856404'
                    }}
                  >
                    {((termination.status as string)?.toUpperCase()) || 'PENDING'}
                  </span>
                </div>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  <strong>Requested:</strong> {formatDate(termination.requestedDate as string)}
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  <strong>Termination Date:</strong> {formatDate(termination.terminationDate as string)}
                </p>
                <p style={{ margin: '4px 0', fontSize: '14px' }}>
                  <strong>Reason:</strong> {termination.reason as string}
                </p>
                {termination.rejectionReason && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#e74c3c' }}>
                    <strong>Rejection Reason:</strong> {termination.rejectionReason as string}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default TenantTerminationPage;
