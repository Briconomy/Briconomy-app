import React from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { adminApi, useApi, formatCurrency } from '../services/api.ts';

function AdminReportsPage() {
  const navItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/users', label: 'Users' },
    { path: '/admin/security', label: 'Security' },
    { path: '/admin/reports', label: 'Reports', active: true }
  ];

  const { data: financialStats, loading: statsLoading } = useApi(() => adminApi.getFinancialStats());
  const { data: availableReports, loading: reportsLoading } = useApi(() => adminApi.getAvailableReports());
  const { data: reportActivities, loading: activitiesLoading } = useApi(() => adminApi.getReportActivities());

  const getFinancialStatsData = () => {
    if (statsLoading || !financialStats) {
      return {
        monthlyRevenue: 'R840k',
        occupancyRate: '88%',
        collectionRate: '95%',
        activeReports: '24'
      };
    }
    
    const stats = financialStats[0];
    return {
      monthlyRevenue: `R${(stats.monthlyRevenue / 1000).toFixed(0)}k`,
      occupancyRate: `${stats.occupancyRate}%`,
      collectionRate: `${stats.collectionRate}%`,
      activeReports: stats.activeReports?.toString() || '24'
    };
  };

  const formatActivityTime = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return '1 day ago';
    } else {
      return `${diffDays} days ago`;
    }
  };

  const stats = getFinancialStatsData();

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Reports & Analytics</div>
          <div className="page-subtitle">Business intelligence and insights</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={stats.monthlyRevenue} label="Monthly Revenue" />
          <StatCard value={stats.occupancyRate} label="Occupancy Rate" />
          <StatCard value={stats.collectionRate} label="Collection Rate" />
          <StatCard value={stats.activeReports} label="Active Reports" />
        </div>

        <ChartCard title="Financial Overview">
          <div className="chart-placeholder">
            Chart.js Financial Analytics
          </div>
        </ChartCard>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Available Reports</div>
          </div>
          
          {reportsLoading ? (
            <div className="list-item">
              <div className="item-info">
                <h4>Loading available reports...</h4>
              </div>
            </div>
          ) : (
            availableReports?.map((report: any, index: number) => (
              <div key={index} className="list-item">
                <div className="item-info">
                  <h4>{report.title}</h4>
                  <p>{report.description}</p>
                </div>
                <span className={`status-badge status-${report.status}`}>{report.status}</span>
              </div>
            ))
          )}
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Report Generation</div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Report Type</label>
            <select className="form-select">
              <option>Financial Report</option>
              <option>Occupancy Report</option>
              <option>Maintenance Report</option>
              <option>Performance Report</option>
              <option>Custom Report</option>
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">From Date</label>
              <input type="date" className="form-input" />
            </div>
            <div className="form-group">
              <label className="form-label">To Date</label>
              <input type="date" className="form-input" />
            </div>
          </div>
          
          <button className="btn-primary btn-block">Generate Report</button>
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Recent Report Activity</div>
          </div>
          {activitiesLoading ? (
            <div className="list-item">
              <div className="item-info">
                <h4>Loading report activities...</h4>
              </div>
            </div>
          ) : (
            reportActivities?.map((activity: any, index: number) => (
              <div key={index} className="list-item">
                <div className="item-info">
                  <h4>{activity.action}</h4>
                  <p>{formatActivityTime(activity.timestamp)} - {activity.details}</p>
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

export default AdminReportsPage;
