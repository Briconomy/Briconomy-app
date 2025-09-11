import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { tasksApi, maintenanceApi, reportsApi, useApi } from '../services/api.ts';

function CaretakerReportsPage() {
  const [user, setUser] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [reportType, setReportType] = useState('all'); // all, performance, maintenance, financial
  const [timePeriod, setTimePeriod] = useState('month'); // week, month, quarter, year
  
  const navItems = [
    { path: '/caretaker', label: 'Dashboard', active: false },
    { path: '/caretaker/tasks', label: 'Tasks', active: false },
    { path: '/caretaker/maintenance', label: 'Maintenance', active: false },
    { path: '/caretaker/reports', label: 'Reports', active: true }
  ];

  const { data: tasks, loading: tasksLoading, error: tasksError } = useApi(
    () => tasksApi.getAll(user?.id ? { caretakerId: user.id } : {}),
    [user?.id]
  );

  const { data: maintenance, loading: maintenanceLoading, error: maintenanceError } = useApi(
    () => maintenanceApi.getAll(user?.id ? { assignedTo: user.id } : {}),
    [user?.id]
  );

  const { data: reports, loading: reportsLoading, error: reportsError } = useApi(
    () => reportsApi.getAll(user?.id ? { generatedBy: user.id } : {}),
    [user?.id]
  );

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    try {
      const userRaw = localStorage.getItem('briconomy_user');
      const userData = userRaw ? JSON.parse(userRaw) : null;
      setUser(userData);
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  const getMockTasks = () => {
    return [
      {
        id: '1',
        title: 'Weekly property inspection',
        status: 'completed',
        completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 4,
        actualHours: 3.5,
        property: 'Blue Hills Apartments'
      },
      {
        id: '2',
        title: 'AC repair - Unit 2A',
        status: 'completed',
        completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 3,
        actualHours: 4,
        property: 'Blue Hills Apartments'
      },
      {
        id: '3',
        title: 'Pool cleaning',
        status: 'pending',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 2,
        property: 'Sunset Towers'
      },
      {
        id: '4',
        title: 'Garden maintenance',
        status: 'in_progress',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 6,
        actualHours: 3,
        property: 'Green Valley Complex'
      },
      {
        id: '5',
        title: 'Security system check',
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        estimatedHours: 2,
        property: 'Blue Hills Apartments'
      }
    ];
  };

  const getMockMaintenance = () => {
    return [
      {
        id: '1',
        title: 'AC repair',
        status: 'in_progress',
        property: 'Blue Hills Apartments',
        unit: '2A',
        priority: 'high',
        estimatedCost: 1500,
        actualCost: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        title: 'Leaky faucet',
        status: 'pending',
        property: 'Blue Hills Apartments',
        unit: '3C',
        priority: 'medium',
        estimatedCost: 800,
        actualCost: null,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        title: 'Broken window',
        status: 'completed',
        property: 'Green Valley Complex',
        unit: 'A1',
        priority: 'high',
        estimatedCost: 1200,
        actualCost: 1150,
        completedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        title: 'Electrical issue',
        status: 'in_progress',
        property: 'Green Valley Complex',
        unit: 'B2',
        priority: 'high',
        estimatedCost: 2000,
        actualCost: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        title: 'Dishwasher not draining',
        status: 'pending',
        property: 'Sunset Towers',
        unit: 'P1',
        priority: 'medium',
        estimatedCost: 1000,
        actualCost: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  };

  const getMockReports = () => {
    return [
      {
        id: '1',
        type: 'performance',
        period: 'monthly',
        title: 'Monthly Performance Report',
        property: 'Blue Hills Apartments',
        generatedBy: user?.id,
        generatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        data: {
          totalTasks: 15,
          completedTasks: 12,
          completionRate: 80,
          avgResponseTime: 2.5,
          efficiency: 85
        }
      },
      {
        id: '2',
        type: 'maintenance',
        period: 'weekly',
        title: 'Weekly Maintenance Summary',
        property: 'Green Valley Complex',
        generatedBy: user?.id,
        generatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        data: {
          completedRequests: 3,
          pendingRequests: 2,
          totalCost: 1950,
          avgResolutionTime: 3.2
        }
      },
      {
        id: '3',
        type: 'financial',
        period: 'monthly',
        title: 'Monthly Financial Report',
        property: 'Sunset Towers',
        generatedBy: user?.id,
        generatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        data: {
          totalRevenue: 45000,
          totalExpenses: 12000,
          maintenanceCosts: 8500,
          netIncome: 33000
        }
      }
    ];
  };

  const useMockTasksData = tasksError || !tasks;
  const useMockMaintenanceData = maintenanceError || !maintenance;
  const useMockReportsData = reportsError || !reports;
  
  const mockTasks = getMockTasks();
  const mockMaintenance = getMockMaintenance();
  const mockReports = getMockReports();
  
  const tasksData = Array.isArray(tasks) ? tasks : (useMockTasksData ? mockTasks : []);
  const maintenanceData = Array.isArray(maintenance) ? maintenance : (useMockMaintenanceData ? mockMaintenance : []);
  const reportsData = Array.isArray(reports) ? reports : (useMockReportsData ? mockReports : []);

  // Filter reports based on selected filters
  const getFilteredReports = () => {
    return reportsData.filter(report => {
      const typeMatch = reportType === 'all' || report.type === reportType;
      return typeMatch;
    });
  };

  const filteredReports = getFilteredReports();

  // Calculate statistics for current period
  const completedTasks = tasksData.filter(task => task.status === 'completed').length;
  const totalTasks = tasksData.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const completedMaintenance = maintenanceData.filter(req => req.status === 'completed').length;
  const totalMaintenanceCost = maintenanceData
    .filter(req => req.status === 'completed' && req.actualCost)
    .reduce((sum, req) => sum + (Number(req.actualCost) || 0), 0);

  const avgTaskCompletion = tasksData
    .filter(task => task.status === 'completed' && task.estimatedHours && task.actualHours)
    .reduce((sum, task) => sum + (Number(task.actualHours) / Number(task.estimatedHours)), 0) / completedTasks || 1;

  const efficiency = Math.round((1 / Math.max(avgTaskCompletion, 1)) * 100);

  const handleGenerateReport = (type) => {
    // In a real app, this would generate and save a new report
    console.log(`Generating ${type} report for period: ${timePeriod}`);
    alert(`${type.charAt(0).toUpperCase() + type.slice(1)} report generated successfully!`);
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowReportDetails(true);
  };

  const handleExportReport = (report) => {
    // In a real app, this would export the report
    console.log('Exporting report:', report);
    alert('Report exported successfully!');
  };

  const getReportTypeColor = (type) => {
    switch (type) {
      case 'performance': return 'text-blue-600 font-semibold';
      case 'maintenance': return 'text-green-600 font-semibold';
      case 'financial': return 'text-purple-600 font-semibold';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0
    }).format(Number(amount) || 0);
  };

  const loading = tasksLoading || maintenanceLoading || reportsLoading;

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout={true} />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading reports...</p>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Reports & Analytics</div>
          <div className="page-subtitle">Performance metrics and insights</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={completionRate} label="Completion Rate" />
          <StatCard value={efficiency} label="Efficiency %" />
          <StatCard value={completedTasks} label="Tasks Done" />
          <StatCard value={formatCurrency(totalMaintenanceCost)} label="Maintenance Cost" />
        </div>

        {/* Report Generation Section */}
        <ChartCard title="Generate New Report">
          <div className="report-generation">
            <div className="generation-controls">
              <div className="control-group">
                <label className="control-label">Time Period:</label>
                <select 
                  className="control-select"
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
            
            <div className="report-types">
              <button 
                className="report-type-btn"
                onClick={() => handleGenerateReport('performance')}
              >
                <div className="report-icon">📊</div>
                <div className="report-name">Performance</div>
                <div className="report-desc">Task completion and efficiency</div>
              </button>
              
              <button 
                className="report-type-btn"
                onClick={() => handleGenerateReport('maintenance')}
              >
                <div className="report-icon">🔧</div>
                <div className="report-name">Maintenance</div>
                <div className="report-desc">Maintenance requests and costs</div>
              </button>
              
              <button 
                className="report-type-btn"
                onClick={() => handleGenerateReport('financial')}
              >
                <div className="report-icon">💰</div>
                <div className="report-name">Financial</div>
                <div className="report-desc">Cost analysis and savings</div>
              </button>
            </div>
          </div>
        </ChartCard>

        {/* Report Filters */}
        <div className="filter-section">
          <div className="filter-group">
            <label className="filter-label">Report Type:</label>
            <select 
              className="filter-select"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="performance">Performance</option>
              <option value="maintenance">Maintenance</option>
              <option value="financial">Financial</option>
            </select>
          </div>
        </div>

        {/* Generated Reports List */}
        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Generated Reports</div>
            <div className="text-sm text-gray-500">
              {filteredReports.length} reports
            </div>
          </div>
          
          {filteredReports.length === 0 ? (
            <div className="no-results">
              <p>No reports found. Generate your first report above!</p>
            </div>
          ) : (
            filteredReports
              .sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt))
              .map((report) => (
                <div key={report.id} className="list-item">
                  <div className="item-info">
                    <div className="flex justify-between items-start">
                      <h4>{report.title}</h4>
                      <span className={`text-xs ${getReportTypeColor(report.type)}`}>
                        {report.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="task-meta mt-2">
                      <span className="text-xs text-gray-500">
                        {report.property}
                      </span>
                      <span className="text-xs text-gray-500">
                        {report.period} • {formatDate(report.generatedAt)}
                      </span>
                    </div>
                    {/* Report Summary */}
                    <div className="report-summary mt-2 p-2 bg-gray-50 rounded text-xs">
                      {report.type === 'performance' && (
                        <div>
                          <span className="font-semibold">Completion:</span> {report.data.completionRate}% • 
                          <span className="font-semibold"> Efficiency:</span> {report.data.efficiency}%
                        </div>
                      )}
                      {report.type === 'maintenance' && (
                        <div>
                          <span className="font-semibold">Completed:</span> {report.data.completedRequests} • 
                          <span className="font-semibold"> Cost:</span> {formatCurrency(report.data.totalCost)}
                        </div>
                      )}
                      {report.type === 'financial' && (
                        <div>
                          <span className="font-semibold">Revenue:</span> {formatCurrency(report.data.totalRevenue)} • 
                          <span className="font-semibold"> Expenses:</span> {formatCurrency(report.data.totalExpenses)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="item-actions">
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleViewReport(report)}
                    >
                      View
                    </button>
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => handleExportReport(report)}
                    >
                      Export
                    </button>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Performance Insights */}
        <ChartCard title="Performance Insights">
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <div className="insight-title">Task Completion</div>
                <div className="insight-value">{completionRate}%</div>
                <div className="insight-desc">
                  {completionRate >= 80 ? 'Excellent performance!' : 
                   completionRate >= 60 ? 'Good progress' : 'Needs improvement'}
                </div>
              </div>
            </div>
            
            <div className="insight-card">
              <div className="insight-icon">⚡</div>
              <div className="insight-content">
                <div className="insight-title">Efficiency Rating</div>
                <div className="insight-value">{efficiency}%</div>
                <div className="insight-desc">
                  {efficiency >= 90 ? 'Outstanding efficiency!' : 
                   efficiency >= 70 ? 'Good efficiency' : 'Room for improvement'}
                </div>
              </div>
            </div>
            
            <div className="insight-card">
              <div className="insight-icon">💰</div>
              <div className="insight-content">
                <div className="insight-title">Cost Management</div>
                <div className="insight-value">{formatCurrency(totalMaintenanceCost)}</div>
                <div className="insight-desc">
                  Total maintenance costs this period
                </div>
              </div>
            </div>
            
            <div className="insight-card">
              <div className="insight-icon">🎯</div>
              <div className="insight-content">
                <div className="insight-title">Tasks Completed</div>
                <div className="insight-value">{completedTasks}</div>
                <div className="insight-desc">
                  Out of {totalTasks} total tasks assigned
                </div>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default CaretakerReportsPage;
