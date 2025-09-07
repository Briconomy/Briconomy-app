import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import PaymentChart from '../components/PaymentChart.tsx';
import { paymentsApi, dashboardApi, formatCurrency } from '../services/api.ts';

function TenantDashboard() {
  const [payments, setPayments] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const navItems = [
    { path: '/tenant', label: 'Home', active: true },
    { path: '/tenant/payments', label: 'Payments' },
    { path: '/tenant/requests', label: 'Requests' },
    { path: '/tenant/profile', label: 'Profile' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock tenant ID - in real app this would come from authentication
      const tenantId = '507f1f77bcf86cd799439012';
      
      const [paymentsData, statsData] = await Promise.all([
        paymentsApi.getAll({ tenantId }),
        dashboardApi.getStats()
      ]);
      
      setPayments(paymentsData);
      setDashboardStats(statsData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching tenant data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Welcome Back</div>
          <div className="page-subtitle">Unit 2A - Blue Hills</div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading your dashboard...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Error loading data: {error}</p>
            <button onClick={fetchData} className="btn btn-primary">Retry</button>
          </div>
        ) : (
          <>
            <div className="dashboard-grid">
              <StatCard value={formatCurrency(12500)} label="Rent Due" />
              <StatCard value="5 days" label="Due Date" />
              <StatCard value="2" label="Requests" />
              <StatCard value="Good" label="Standing" />
            </div>

        <ChartCard title="Payment History">
              <PaymentChart />
            </ChartCard>

            <div className="data-table">
              <div className="table-header">
                <div className="table-title">Recent Activity</div>
              </div>
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="list-item">
                  <div className="item-info">
                    <h4>{payment.type === 'rent' ? 'Rent Payment' : 'Other Payment'}</h4>
                    <p>{payment.type} - {formatCurrency(payment.amount)}</p>
                    {payment.paymentDate && (
                      <p className="text-sm text-gray-600">Paid: {new Date(payment.paymentDate).toLocaleDateString()}</p>
                    )}
                  </div>
                  <span className={`status-badge ${payment.status === 'paid' ? 'status-paid' : payment.status === 'pending' ? 'status-pending' : 'status-overdue'}`}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default TenantDashboard;