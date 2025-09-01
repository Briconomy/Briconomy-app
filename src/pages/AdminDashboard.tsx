import React from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import PerformanceChart from '../components/PerformanceChart.tsx';

function AdminDashboard() {
  const navItems = [
    { path: '/admin', label: 'Dashboard', active: true },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/security', label: 'Security' },
    { path: '/admin/reports', label: 'Reports' }
  ];

  return (
    <div className="app-container responsive">
      <TopNav showLogout={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Admin Dashboard</div>
          <div className="page-subtitle">System overview and management</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value="156" label="Total Users" />
          <StatCard value="24" label="Properties" />
          <StatCard value="99.9%" label="Uptime" />
          <StatCard value="245ms" label="Response" />
        </div>

        <ChartCard title="System Performance">
          <PerformanceChart />
        </ChartCard>

        <div className="quick-actions">
          <ActionCard
            to="/admin/users"
            icon="U"
            title="Users"
            description="Manage system users"
          />
          <ActionCard
            to="/admin/security"
            icon="S"
            title="Security"
            description="System security"
          />
          <ActionCard
            to="/admin/operations"
            icon="O"
            title="Operations"
            description="Performance & health"
          />
          <ActionCard
            to="/admin/reports"
            icon="R"
            title="Reports"
            description="Analytics & insights"
          />
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={true} />
    </div>
  );
}

export default AdminDashboard;