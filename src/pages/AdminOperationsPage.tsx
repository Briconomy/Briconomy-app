import React from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';

function AdminOperationsPage() {
  const navItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/security', label: 'Security' },
    { path: '/admin/reports', label: 'Reports' }
  ];

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Operations Management</div>
          <div className="page-subtitle">System performance and health monitoring</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value="99.9%" label="Uptime" />
          <StatCard value="245ms" label="Response" />
          <StatCard value="0.1%" label="Error Rate" />
          <StatCard value="98%" label="Health" />
        </div>

        <ChartCard title="System Performance">
          <div className="chart-placeholder">
            Chart.js Performance Analytics
          </div>
        </ChartCard>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Database Health</div>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>MongoDB Connection</h4>
              <p>Response time: 12ms</p>
            </div>
            <span className="status-badge status-healthy">Healthy</span>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>Database Size</h4>
              <p>156 documents across 11 collections</p>
            </div>
            <span className="status-badge status-normal">2.4 GB</span>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>Index Performance</h4>
              <p>All queries using indexes efficiently</p>
            </div>
            <span className="status-badge status-optimal">Optimal</span>
          </div>
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">API Endpoints</div>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>Authentication API</h4>
              <p>100% success rate</p>
            </div>
            <span className="status-badge status-good">200ms</span>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>Property Management API</h4>
              <p>99.8% success rate</p>
            </div>
            <span className="status-badge status-good">180ms</span>
          </div>
          
          <div className="list-item">
            <div className="item-info">
              <h4>Payment Processing API</h4>
              <p>98.5% success rate</p>
            </div>
            <span className="status-badge status-warning">350ms</span>
          </div>
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">System Alerts</div>
          </div>
          <div className="list-item">
            <div className="item-info">
              <h4>System backup completed successfully</h4>
              <p>2 hours ago - All data secured</p>
            </div>
          </div>
          <div className="list-item">
            <div className="item-info">
              <h4>High memory usage detected</h4>
              <p>4 hours ago - Currently at 78% utilization</p>
            </div>
          </div>
          <div className="list-item">
            <div className="item-info">
              <h4>Performance optimization applied</h4>
              <p>6 hours ago - 15% improvement in response times</p>
            </div>
          </div>
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default AdminOperationsPage;
