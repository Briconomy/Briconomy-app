import React from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import PaymentChart from '../components/PaymentChart.tsx';

function TenantDashboard() {
  const navItems = [
    { path: '/tenant', label: 'Home', active: true },
    { path: '/tenant/payments', label: 'Payments' },
    { path: '/tenant/requests', label: 'Requests' },
    { path: '/tenant/profile', label: 'Profile' }
  ];

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Welcome Back</div>
          <div className="page-subtitle">Unit 2A - Blue Hills</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value="R12,500" label="Rent Due" />
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
          <div className="list-item">
            <div className="item-info">
              <h4>Rent Payment</h4>
              <p>August 2024 - R12,500</p>
            </div>
            <span className="status-badge status-paid">Paid</span>
          </div>
          <div className="list-item">
            <div className="item-info">
              <h4>Maintenance Request</h4>
              <p>AC repair - Unit 2A</p>
            </div>
            <span className="status-badge status-pending">Progress</span>
          </div>
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default TenantDashboard;