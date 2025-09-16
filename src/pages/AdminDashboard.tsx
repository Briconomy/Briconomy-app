import React from 'react';
import { Link } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { adminApi, useApi } from '../services/api.ts';

function AdminDashboard() {
  const navItems = [
    { path: '/admin', label: 'Dashboard', active: true },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/security', label: 'Security' },
    { path: '/admin/reports', label: 'Reports' }
  ];

  const { data: systemStats, loading: statsLoading } = useApi(() => adminApi.getSystemStats());

  const getStatsData = () => {
    if (statsLoading || !systemStats) {
      return {
        totalUsers: '156',
        totalProperties: '24',
        uptime: '99.9%',
        responseTime: '245ms'
      };
    }
    
    const overviewStats = systemStats.find((stat: any) => stat.category === 'overview');
    return {
      totalUsers: overviewStats?.totalUsers?.toString() || '156',
      totalProperties: overviewStats?.totalProperties?.toString() || '24',
      uptime: overviewStats?.uptime || '99.9%',
      responseTime: overviewStats?.responseTime || '245ms'
    };
  };

  const stats = getStatsData();

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton={true} showLogout={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Admin Dashboard</div>
          <div className="page-subtitle">System overview and management</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={stats.totalUsers} label="Total Users" />
          <StatCard value={stats.totalProperties} label="Properties" />
          <StatCard value={stats.uptime} label="Uptime" />
          <StatCard value={stats.responseTime} label="Response" />
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
