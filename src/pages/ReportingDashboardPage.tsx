import { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import PaymentChart from '../components/PaymentChart.tsx';

type DashboardReport = {
  id: string;
  title: string;
  type: string;
  period: string;
  generatedDate: string;
  status: string;
  data: Record<string, number>;
};

function ReportingDashboardPage() {
  const [reports, setReports] = useState<DashboardReport[]>([
    {
      id: '1',
      title: 'Monthly Financial Report',
      type: 'financial',
      period: 'monthly',
      generatedDate: '2024-09-01',
      status: 'completed',
      data: {
        totalRevenue: 180000,
        totalExpenses: 45000,
        occupancyRate: 89,
        collectionsRate: 95,
        netIncome: 135000
      }
    },
    {
      id: '2',
      title: 'Maintenance Performance Report',
      type: 'maintenance',
      period: 'weekly',
      generatedDate: '2024-09-05',
      status: 'completed',
      data: {
        completedTasks: 12,
        pendingTasks: 5,
        avgResponseTime: 2.5,
        urgentRequests: 1
      }
    },
    {
      id: '3',
      title: 'Occupancy Analysis',
      type: 'occupancy',
      period: 'monthly',
      generatedDate: '2024-09-01',
      status: 'completed',
      data: {
        totalUnits: 24,
        occupiedUnits: 21,
        vacantUnits: 3,
        occupancyRate: 87.5
      }
    },
    {
      id: '4',
      title: 'Tenant Satisfaction Survey',
      type: 'survey',
      period: 'quarterly',
      generatedDate: '2024-08-15',
      status: 'pending',
      data: {
        responseRate: 0,
        satisfactionScore: 0,
        totalResponses: 0
      }
    }
  ]);

  const [showReportGenerator, setShowReportGenerator] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('');

  const navItems = [
    { path: '/manager', label: 'Dashboard', icon: 'performanceAnalytics', active: false },
    { path: '/manager/properties', label: 'Properties', icon: 'properties' },
    { path: '/manager/leases', label: 'Leases', icon: 'lease' },
    { path: '/manager/payments', label: 'Payments', icon: 'payment' }
  ];

  const totalRevenue = reports
    .filter(r => r.type === 'financial' && r.status === 'completed')
    .reduce((sum, r) => sum + r.data.totalRevenue, 0);
  
  const avgOccupancyRate = reports
    .filter(r => r.type === 'occupancy' && r.status === 'completed')
    .reduce((sum, r, _, arr) => sum + r.data.occupancyRate / arr.length, 0);

  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const completedReports = reports.filter(r => r.status === 'completed').length;

  const reportTypes: Array<{ value: string; label: string; icon: string }> = [
    { value: 'financial', label: 'Financial Report', icon: 'F' },
    { value: 'occupancy', label: 'Occupancy Report', icon: 'O' },
    { value: 'maintenance', label: 'Maintenance Report', icon: 'M' },
    { value: 'tenant', label: 'Tenant Report', icon: 'T' },
    { value: 'performance', label: 'Performance Report', icon: 'P' }
  ];

  const handleGenerateReport = (type: string) => {
    setSelectedReportType(type);
    setShowReportGenerator(true);
  };

  const handleCreateReport = () => {
    const newReport = {
      id: Date.now().toString(),
      title: `${reportTypes.find(t => t.value === selectedReportType)?.label} - ${new Date().toLocaleDateString()}`,
      type: selectedReportType,
      period: 'monthly',
      generatedDate: new Date().toISOString().split('T')[0],
      status: 'generating',
      data: {}
    };
    
    setReports(prev => [newReport, ...prev]);
    setShowReportGenerator(false);
    setSelectedReportType('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'generating': return 'status-progress';
      default: return 'status-pending';
    }
  };

return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Reports & Analytics</div>
          <div className="page-subtitle">Property performance insights</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={`R${(totalRevenue / 1000).toFixed(0)}k`} label="Total Revenue" />
          <StatCard value={`${avgOccupancyRate.toFixed(1)}%`} label="Occupancy Rate" />
          <StatCard value={completedReports} label="Reports Generated" />
          <StatCard value={pendingReports} label="Pending Reports" />
        </div>

        <ChartCard title="Revenue Overview">
          <PaymentChart />
        </ChartCard>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Recent Reports</div>
            <button 
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setShowReportGenerator(true)}
            >
              Generate Report
            </button>
          </div>
          
          {reports.map((report) => (
            <div key={report.id} className="list-item">
              <div className="item-info">
                <h4>{report.title}</h4>
                <p className="text-sm text-gray-600">
                  {reportTypes.find(t => t.value === report.type)?.icon} {reportTypes.find(t => t.value === report.type)?.label}
                </p>
                <div className="report-meta">
                  <span className="text-xs text-gray-500">
                    {new Date(report.generatedDate).toLocaleDateString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    {report.period}
                  </span>
                </div>
              </div>
              <div className="item-actions">
                <span className={`status-badge ${getStatusColor(report.status)}`}>
                  {report.status.toUpperCase()}
                </span>
                <div className="report-actions">
                  <button type="button" className="btn btn-sm btn-secondary">View</button>
                  <button type="button" className="btn btn-sm btn-secondary">Download</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="quick-actions">
          {reportTypes.map((type) => (
            <ActionCard
              key={type.value}
              onClick={() => handleGenerateReport(type.value)}
              icon={type.icon}
              title={type.label}
              description={`Generate ${type.label.toLowerCase()}`}
            />
          ))}
        </div>

        <ChartCard title="Key Metrics">
          <div className="metrics-grid">
            <div className="metric-item">
              <div className="metric-value">89%</div>
              <div className="metric-label">Occupancy Rate</div>
              <div className="metric-change positive">+2.3%</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">95%</div>
              <div className="metric-label">Collection Rate</div>
              <div className="metric-change positive">+1.2%</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">2.5h</div>
              <div className="metric-label">Avg Response Time</div>
              <div className="metric-change negative">+0.3h</div>
            </div>
            <div className="metric-item">
              <div className="metric-value">4.2</div>
              <div className="metric-label">Tenant Satisfaction</div>
              <div className="metric-change positive">+0.2</div>
            </div>
          </div>
        </ChartCard>
      </div>
      
      {showReportGenerator && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Generate Report</h3>
              <button type="button" className="close-btn" onClick={() => setShowReportGenerator(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="report-types">
                <h4>Select Report Type</h4>
                <div className="report-options">
                  {reportTypes.map((type) => (
                    <label key={type.value} className="report-option">
                      <input
                        type="radio"
                        name="reportType"
                        value={type.value}
                        checked={selectedReportType === type.value}
                        onChange={() => setSelectedReportType(type.value)}
                      />
                      <span>{type.icon} {type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {selectedReportType && (
                <div className="report-config">
                  <h4>Report Configuration</h4>
                  <div className="form-group">
                    <label>Report Period</label>
                    <select>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Properties</label>
                    <select multiple>
                      <option value="all">All Properties</option>
                      <option value="blue-hills">Blue Hills Apartments</option>
                      <option value="green-valley">Green Valley Complex</option>
                      <option value="sunset-towers">Sunset Towers</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Export Format</label>
                    <select>
                      <option value="pdf">PDF</option>
                      <option value="excel">Excel</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>
                </div>
              )}
              
              <div className="form-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReportGenerator(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateReport}
                  disabled={!selectedReportType}
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default ReportingDashboardPage;