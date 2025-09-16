import React from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';

function AdminSecurityPage() {
  const navItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/security', label: 'Security', active: true },
    { path: '/admin/reports', label: 'Reports' }
  ];

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Security Management</div>
          <div className="page-subtitle">Monitor and configure system security</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value="100%" label="Secure" />
          <StatCard value="0" label="Threats" />
          <StatCard value="24/7" label="Monitoring" />
          <StatCard value="2FA" label="Enabled" />
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Authentication Methods</div>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>SSO Authentication</h4>
              <p>Google and institutional login</p>
            </div>
            <span className="status-badge status-active">Active</span>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>Biometric Login</h4>
              <p>Fingerprint and facial recognition</p>
            </div>
            <span className="status-badge status-active">Active</span>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>Traditional Login</h4>
              <p>Email and password authentication</p>
            </div>
            <span className="status-badge status-active">Active</span>
          </div>
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Security Alerts</div>
          </div>
          <div className="list-item">
            <div className="item-info">
              <h4>System security scan completed</h4>
              <p>5 minutes ago - No threats detected</p>
            </div>
          </div>
          <div className="list-item">
            <div className="item-info">
              <h4>Password policy updated</h4>
              <p>1 hour ago - Minimum 12 characters required</p>
            </div>
          </div>
          <div className="list-item">
            <div className="item-info">
              <h4>2FA enrollment increased by 15%</h4>
              <p>3 hours ago - Enhanced security adoption</p>
            </div>
          </div>
        </div>

        <ChartCard title="Access Logs">
          <div className="chart-placeholder">
            Chart.js Access Analytics
          </div>
        </ChartCard>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Security Settings</div>
          </div>
          <div className="list-item">
            <div className="item-info">
              <h4>Session Timeout</h4>
              <p>30 minutes of inactivity</p>
            </div>
            <button className="btn-secondary">Configure</button>
          </div>
          <div className="list-item">
            <div className="item-info">
              <h4>Login Attempts</h4>
              <p>5 failed attempts before lockout</p>
            </div>
            <button className="btn-secondary">Configure</button>
          </div>
          <div className="list-item">
            <div className="item-info">
              <h4>IP Whitelisting</h4>
              <p>Restricted access from approved IPs</p>
            </div>
            <button className="btn-secondary">Configure</button>
          </div>
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default AdminSecurityPage;
