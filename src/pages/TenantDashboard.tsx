import _React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import { paymentsApi, dashboardApi, leasesApi, maintenanceApi, notificationsApi, formatCurrency, formatDate, useApi } from '../services/api.ts';

function TenantDashboard() {
  const [user, setUser] = useState(null);
  const [loading, _setLoading] = useState(true);
  const [_error, _setError] = useState<unknown>(null);
  const [notifications, setNotifications] = useState([]);
  
  const navItems = [
    { path: '/tenant', label: 'Home', active: true },
    { path: '/tenant/payments', label: 'Payments' },
    { path: '/tenant/requests', label: 'Requests' },
    { path: '/tenant/profile', label: 'Profile' }
  ];

  const { data: payments, loading: paymentsLoading, error: paymentsError, refetch: _refetchPayments } = useApi(
    () => paymentsApi.getAll({ tenantId: user?.id || '68bde3529b1d854514fa336a' }),
    [user?.id]
  );

  const { data: lease, loading: leaseLoading, error: leaseError } = useApi(
    () => leasesApi.getAll({ tenantId: user?.id || '68bde3529b1d854514fa336a' }),
    [user?.id]
  );

  const { data: requests, loading: requestsLoading, error: requestsError } = useApi(
    () => maintenanceApi.getAll({ tenantId: user?.id || '68bde3529b1d854514fa336a' }),
    [user?.id]
  );

  const { data: _stats, loading: statsLoading, error: statsError } = useApi(
    () => dashboardApi.getStats(),
    []
  );

  useEffect(() => {
    loadUserData();
    loadNotifications();
  }, []);

  const loadUserData = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('briconomy_user') || localStorage.getItem('user') || '{}');
      setUser(userData);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const loadNotifications = async () => {
    try {
      if (user?.id) {
        const notificationsData = await notificationsApi.getAll(user.id || '68bde3529b1d854514fa336a');
        setNotifications(notificationsData.filter(n => !n.read).slice(0, 5));
      }
    } catch (err) {
      console.error('Error loading notifications:', err);
    }
  };

  const getMockData = () => {
    return {
      payments: [],
      lease: [],
      requests: [],
      notifications: []
    };
  };

  const getUpcomingPayment = () => {
  const list = payments || (paymentsError ? getMockData().payments : []);
  if (!list) return null;
  return list
      .filter(p => p.status === 'pending')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];
  };

  const getDaysUntilDue = (dueDate: string | Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const useMockData = paymentsError || leaseError || requestsError || statsError;
  const mockData = getMockData();
  
  const _paymentsData = payments || (useMockData ? mockData.payments : []);
  const leaseData = lease || (useMockData ? mockData.lease : []);
  const requestsData = requests || (useMockData ? mockData.requests : []);
  const notificationsData = notifications.length > 0 ? notifications : (useMockData ? mockData.notifications : []);

  const isLoading = loading || paymentsLoading || leaseLoading || requestsLoading || statsLoading;
  const hasError = paymentsError || leaseError || requestsError || statsError;
  const upcomingPayment = hasError ? null : getUpcomingPayment();
  const currentLease = hasError ? null : leaseData?.[0];
  const pendingRequests = hasError ? [] : requestsData?.filter(r => r.status === 'pending') || [];
  const unreadNotifications = hasError ? 0 : notificationsData.length;

  if (isLoading) {
    return (
      <div className="app-container mobile-only">
  <TopNav showLogout />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  return (
    <div className="app-container mobile-only">
  <TopNav showLogout />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Welcome Back</div>
          <div className="page-subtitle">
            {currentLease?.unitId?.unitNumber || 'Unit 2A'} - {currentLease?.propertyId?.name || 'Blue Hills'}
          </div>
          {hasError && (
            <div className="offline-indicator">
              <span>Offline - Please check your connection</span>
            </div>
          )}
        </div>
        
        <div className="dashboard-grid">
          <StatCard 
            value={upcomingPayment ? formatCurrency(upcomingPayment.amount) : 'R0'} 
            label="Rent Due" 
          />
          <StatCard 
            value={upcomingPayment ? `${getDaysUntilDue(upcomingPayment.dueDate)} days` : 'N/A'} 
            label="Due Date" 
          />
          <StatCard 
            value={pendingRequests.length} 
            label="Requests" 
          />
          <StatCard 
            value={unreadNotifications} 
            label="Notifications" 
          />
        </div>

        {currentLease && (
          <div className="lease-info-card">
            <h3>Lease Information</h3>
            <div className="lease-details">
              <div className="lease-row">
                <span>Monthly Rent:</span>
                <span className="lease-value">{formatCurrency(currentLease.monthlyRent)}</span>
              </div>
              <div className="lease-row">
                <span>Lease Period:</span>
                <span className="lease-value">
                  {formatDate(currentLease.startDate)} - {formatDate(currentLease.endDate)}
                </span>
              </div>
              <div className="lease-row">
                <span>Security Deposit:</span>
                <span className="lease-value">{formatCurrency(currentLease.deposit)}</span>
              </div>
              <div className="lease-row">
                <span>Status:</span>
                <span className={`lease-status ${currentLease.status === 'active' ? 'status-active' : ''}`}>
                  {currentLease.status.charAt(0).toUpperCase() + currentLease.status.slice(1)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="quick-actions">
          <ActionCard
            onClick={() => globalThis.location.href = '/tenant/payments'}
            icon="P"
            title="Pay Rent"
            description="Make a payment"
          />
          <ActionCard
            onClick={() => globalThis.location.href = '/tenant/requests'}
            icon="M"
            title="Maintenance"
            description="Report an issue"
          />
          <ActionCard
            onClick={() => globalThis.location.href = '/tenant/messages'}
            icon="C"
            title="Contact"
            description="Message management"
          />
          <ActionCard
            onClick={() => globalThis.location.href = '/tenant/profile'}
            icon="U"
            title="Profile"
            description="Update information"
          />
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default TenantDashboard;