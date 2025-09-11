import React from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';

function AdminUsersPage() {
  const navItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/users', label: 'Users', active: true },
    { path: '/admin/security', label: 'Security' },
    { path: '/admin/reports', label: 'Reports' }
  ];

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">User Management</div>
          <div className="page-subtitle">Manage system users and permissions</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value="10" label="Total Users" />
          <StatCard value="8" label="Active" />
          <StatCard value="5" label="Roles" />
          <StatCard value="2" label="Pending" />
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
          <div className="list-item">
            <div className="item-info">
              <h4>User login: Sarah Johnson</h4>
              <p>2 minutes ago</p>
            </div>
          </div>
          <div className="list-item">
            <div className="item-info">
              <h4>User created: Maria Garcia</h4>
              <p>1 hour ago</p>
            </div>
          </div>
          <div className="list-item">
            <div className="item-info">
              <h4>Password updated: James Smith</h4>
              <p>3 hours ago</p>
            </div>
          </div>
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default AdminUsersPage;
