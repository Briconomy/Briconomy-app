import React from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { adminApi, useApi } from '../services/api.ts';

function AdminUsersPage() {
  const navItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/users', label: 'Users', active: true },
    { path: '/admin/security', label: 'Security' },
    { path: '/admin/reports', label: 'Reports' }
  ];

  const { data: userStats, loading: statsLoading } = useApi(() => adminApi.getUserStats());
  const { data: userActivities, loading: activitiesLoading } = useApi(() => adminApi.getUserActivities());

  const getUserStatsData = () => {
    if (statsLoading || !userStats) {
      return {
        totalUsers: '10',
        activeUsers: '8',
        totalRoles: '5',
        pendingUsers: '2'
      };
    }
    
    const stats = userStats[0];
    return {
      totalUsers: stats?.totalUsers?.toString() || '10',
      activeUsers: stats?.activeUsers?.toString() || '8',
      totalRoles: stats?.totalRoles?.toString() || '5',
      pendingUsers: stats?.pendingUsers?.toString() || '2'
    };
  };

  const formatActivityTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return activityTime.toLocaleDateString();
    }
  };

  const stats = getUserStatsData();

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">User Management</div>
          <div className="page-subtitle">Manage system users and permissions</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={stats.totalUsers} label="Total Users" />
          <StatCard value={stats.activeUsers} label="Active" />
          <StatCard value={stats.totalRoles} label="Roles" />
          <StatCard value={stats.pendingUsers} label="Pending" />
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">User List</div>
            <button className="btn-primary">Add User</button>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>Sarah Johnson</h4>
              <p>admin@briconomy.com</p>
            </div>
            <span className="status-badge status-admin">Admin</span>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>Michael Chen</h4>
              <p>manager1@briconomy.com</p>
            </div>
            <span className="status-badge status-manager">Manager</span>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>Emma Thompson</h4>
              <p>tenant1@briconomy.com</p>
            </div>
            <span className="status-badge status-tenant">Tenant</span>
          </div>
        </div>

        <ChartCard title="Role Distribution">
          <div className="chart-placeholder">
            Chart.js Role Distribution Chart
          </div>
        </ChartCard>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Recent Activity</div>
          </div>
          {activitiesLoading ? (
            <div className="list-item">
              <div className="item-info">
                <h4>Loading activities...</h4>
              </div>
            </div>
          ) : (
            userActivities?.map((activity: any, index: number) => (
              <div key={index} className="list-item">
                <div className="item-info">
                  <h4>{activity.action}</h4>
                  <p>{formatActivityTime(activity.timestamp)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default AdminUsersPage;
