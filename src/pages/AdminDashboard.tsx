import React from 'react';
import { Link } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';

function AdminDashboard() {
  const navItems = [
    { path: '/admin', label: 'Dashboard', active: true },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/security', label: 'Security' },
    { path: '/admin/reports', label: 'Reports' }
  ];

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton={true} showLogout={true} />
      
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
          <div className="chart-placeholder">
            Chart.js Performance Analytics
          </div>
        </ChartCard>

        <div className="quick-actions">
          <Link 
            to="/admin/users" 
            className="action-card"
          >
            <div className="action-icon">U</div>
            <div className="action-title">Users</div>
            <div className="action-desc">Manage system users</div>
          </Link>
          
          <Link 
            to="/admin/security" 
            className="action-card"
          >
            <div className="action-icon">S</div>
            <div className="action-title">Security</div>
            <div className="action-desc">System security</div>
          </Link>
          
          <Link 
            to="/admin/operations" 
            className="action-card"
          >
            <div className="action-icon">O</div>
            <div className="action-title">Operations</div>
            <div className="action-desc">Performance & health</div>
          </Link>
          
          <Link 
            to="/admin/reports" 
            className="action-card"
          >
            <div className="action-icon">R</div>
            <div className="action-title">Reports</div>
            <div className="action-desc">Analytics & insights</div>
          </Link>
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default AdminDashboard;
