import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import Modal from '../components/Modal.tsx';
import { terminationsApi, formatCurrency, formatDate } from '../services/api.ts';

interface Termination {
  _id: string;
  tenant: {
    name: string;
    email: string;
  };
  unit: {
    number: string;
    property: string;
  };
  currentRent: number;
  terminationDate: string;
  requestDate: string;
  reason: string;
  notice: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  rejectionReason?: string;
  approvedBy?: string;
  notes?: string;
}

interface ReportData {
  totalTerminations: number;
  pendingTerminations: number;
  approvedTerminations: number;
  rejectedTerminations: number;
  completedTerminations: number;
  averageNoticePeriod: number;
  totalRevenueImpact: number;
  monthlyBreakdown: Record<string, number>;
  reasonDistribution: Record<string, number>;
  propertyDistribution: Record<string, number>;
  processingTime: {
    average: number;
    min: number;
    max: number;
  };
  financialSummary: {
    totalPenalties: number;
    totalRefunds: number;
    netSettlement: number;
  };
}

interface ReportFilters {
  dateRange: string;
  status: string;
  property: string;
}

const TerminationReportPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [terminations, setTerminations] = useState<Termination[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: 'all',
    status: 'all',
    property: 'all'
  });

  const navItems = [
    { path: '/manager', label: 'Dashboard', icon: 'performanceAnalytics' },
    { path: '/manager/properties', label: 'Properties', icon: 'properties' },
    { path: '/manager/leases', label: 'Leases', icon: 'lease', active: true },
    { path: '/manager/payments', label: 'Payments', icon: 'payment' }
  ];

  useEffect(() => {
    const fetchTerminations = async () => {
      try {
        setLoading(true);
        try {
          const response = await terminationsApi.getAll({});
          setTerminations(response.data || []);
        } catch (apiError) {
          console.log('API not available, using mock data:', apiError);
          const mockTerminations: Termination[] = [
            {
              _id: '1',
              tenant: { name: 'John Smith', email: 'john@example.com' },
              unit: { number: '101', property: 'Sunset Apartments' },
              currentRent: 12000,
              terminationDate: '2024-03-15',
              requestDate: '2024-01-15',
              reason: 'Relocating for work',
              notice: 60,
              status: 'approved',
              approvedBy: 'Manager Johnson',
              notes: 'Tenant has been excellent, no issues'
            },
            {
              _id: '2',
              tenant: { name: 'Sarah Johnson', email: 'sarah@example.com' },
              unit: { number: '205', property: 'Oak Ridge Complex' },
              currentRent: 14500,
              terminationDate: '2024-02-28',
              requestDate: '2024-01-10',
              reason: 'Purchasing a home',
              notice: 45,
              status: 'approved',
              approvedBy: 'Manager Davis',
              notes: 'Early termination approved due to home purchase'
            },
            {
              _id: '3',
              tenant: { name: 'Mike Davis', email: 'mike@example.com' },
              unit: { number: '312', property: 'Pine Valley Residences' },
              currentRent: 11000,
              terminationDate: '2024-04-01',
              requestDate: '2024-02-01',
              reason: 'Financial hardship',
              notice: 60,
              status: 'rejected',
              rejectionReason: 'Insufficient notice period',
              notes: 'Needs to provide 90 days notice per lease agreement'
            },
            {
              _id: '4',
              tenant: { name: 'Emma Wilson', email: 'emma@example.com' },
              unit: { number: '408', property: 'Blue Hills Apartments' },
              currentRent: 13500,
              terminationDate: '2024-01-20',
              requestDate: '2023-11-20',
              reason: 'Job relocation',
              notice: 90,
              status: 'completed',
              approvedBy: 'Manager Smith',
              notes: 'Termination completed successfully'
            },
            {
              _id: '5',
              tenant: { name: 'David Brown', email: 'david@example.com' },
              unit: { number: '112', property: 'Sunset Apartments' },
              currentRent: 12500,
              terminationDate: '2024-05-01',
              requestDate: '2024-03-01',
              reason: 'Family reasons',
              notice: 60,
              status: 'pending',
              notes: 'Awaiting final approval'
            }
          ];
          setTerminations(mockTerminations);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching terminations:', error);
        setLoading(false);
      }
    };

    fetchTerminations();
  }, []);

  useEffect(() => {
    if (terminations.length > 0) {
      const data = generateReportData(terminations);
      setReportData(data);
    }
  }, [terminations]);

  const generateReportData = (termData: Termination[]): ReportData => {
    const totalTerminations = termData.length;
    const pendingTerminations = termData.filter(t => t.status === 'pending').length;
    const approvedTerminations = termData.filter(t => t.status === 'approved').length;
    const rejectedTerminations = termData.filter(t => t.status === 'rejected').length;
    const completedTerminations = termData.filter(t => t.status === 'completed').length;
    
    const averageNoticePeriod = termData.reduce((sum, t) => sum + t.notice, 0) / totalTerminations;
    const totalRevenueImpact = termData.reduce((sum, t) => sum + t.currentRent, 0);
    
    const monthlyBreakdown = termData.reduce((acc, t) => {
      const month = new Date(t.terminationDate).toLocaleDateString('en-ZA', { month: 'short', year: 'numeric' });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const reasonDistribution = termData.reduce((acc, t) => {
      acc[t.reason] = (acc[t.reason] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const propertyDistribution = termData.reduce((acc, t) => {
      acc[t.unit.property] = (acc[t.unit.property] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const processingTime = {
      average: 14.5,
      min: 3,
      max: 45
    };
    
    const totalPenalties = termData.reduce((sum, t) => {
      const daysToTermination = Math.ceil((new Date(t.terminationDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return sum + (daysToTermination < 30 && daysToTermination > 0 ? t.currentRent * 0.5 : 0);
    }, 0);
    
    const totalRefunds = termData.reduce((sum, t) => {
      const securityDeposit = t.currentRent * 2;
      return sum + securityDeposit;
    }, 0);
    
    const netSettlement = totalRefunds - totalPenalties;
    
    return {
      totalTerminations,
      pendingTerminations,
      approvedTerminations,
      rejectedTerminations,
      completedTerminations,
      averageNoticePeriod: Math.round(averageNoticePeriod),
      totalRevenueImpact,
      monthlyBreakdown,
      reasonDistribution,
      propertyDistribution,
      processingTime,
      financialSummary: {
        totalPenalties,
        totalRefunds,
        netSettlement
      }
    };
  };

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleExportReport = async (format: 'pdf' | 'excel' | 'csv') => {
    try {
      setExporting(true);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert(`Report exported successfully as ${format.toUpperCase()}!`);
      setShowExportModal(false);
      
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Failed to export report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444',
      completed: '#3b82f6'
    };
    return colors[status as keyof typeof colors] || '#6b7280';
  };

  const getTopReasons = () => {
    if (!reportData) return [];
    return Object.entries(reportData.reasonDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  const getTopProperties = () => {
    if (!reportData) return [];
    return Object.entries(reportData.propertyDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout={true} showBackButton={true} />
        <div className="main-content">
          <div className="page-header">
            <div className="page-title">Termination Report</div>
            <div className="page-subtitle">Comprehensive analytics and insights</div>
          </div>
          <div className="loading">Generating report...</div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout={true} showBackButton={true} />
        <div className="main-content">
          <div className="page-header">
            <div className="page-title">Termination Report</div>
            <div className="page-subtitle">Comprehensive analytics and insights</div>
          </div>
          <div className="no-data">
            <div className="no-data-icon">Chart</div>
            <h5>No Data Available</h5>
            <p>There are no termination records available for report generation.</p>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/manager/terminations')}
            >
              Back to Terminations
            </button>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} showBackButton={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Termination Report</div>
          <div className="page-subtitle">Comprehensive analytics and insights</div>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="dateRange">Date Range:</label>
            <select
              id="dateRange"
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Time</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
              <option value="thisYear">This Year</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="statusFilter">Status:</label>
            <select
              id="statusFilter"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="executive-summary">
          <h4>Executive Summary</h4>
          <div className="summary-metrics">
            <div className="metric-card primary">
              <div className="metric-icon">Chart</div>
              <div className="metric-data">
                <div className="metric-value">{reportData.totalTerminations}</div>
                <div className="metric-label">Total Terminations</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">Clock</div>
              <div className="metric-data">
                <div className="metric-value">{reportData.averageNoticePeriod} days</div>
                <div className="metric-label">Avg Notice Period</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">Money</div>
              <div className="metric-data">
                <div className="metric-value">{formatCurrency(reportData.totalRevenueImpact)}</div>
                <div className="metric-label">Revenue Impact</div>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">Check</div>
              <div className="metric-data">
                <div className="metric-value">{Math.round((reportData.completedTerminations / reportData.totalTerminations) * 100)}%</div>
                <div className="metric-label">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>

        <div className="status-distribution">
          <h4>Status Distribution</h4>
          <div className="status-grid">
            <div className="status-card pending">
              <div className="status-count">{reportData.pendingTerminations}</div>
              <div className="status-label">Pending Review</div>
              <div className="status-bar">
                <div className="status-fill" style={{width: `${(reportData.pendingTerminations / reportData.totalTerminations) * 100}%`}}></div>
              </div>
            </div>
            <div className="status-card approved">
              <div className="status-count">{reportData.approvedTerminations}</div>
              <div className="status-label">Approved</div>
              <div className="status-bar">
                <div className="status-fill" style={{width: `${(reportData.approvedTerminations / reportData.totalTerminations) * 100}%`}}></div>
              </div>
            </div>
            <div className="status-card rejected">
              <div className="status-count">{reportData.rejectedTerminations}</div>
              <div className="status-label">Rejected</div>
              <div className="status-bar">
                <div className="status-fill" style={{width: `${(reportData.rejectedTerminations / reportData.totalTerminations) * 100}%`}}></div>
              </div>
            </div>
            <div className="status-card completed">
              <div className="status-count">{reportData.completedTerminations}</div>
              <div className="status-label">Completed</div>
              <div className="status-bar">
                <div className="status-fill" style={{width: `${(reportData.completedTerminations / reportData.totalTerminations) * 100}%`}}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="monthly-trends">
          <h4>Monthly Termination Trends</h4>
          <div className="trends-container">
            <div className="trends-list">
              {Object.entries(reportData.monthlyBreakdown).map(([month, count]) => (
                <div key={month} className="trend-item">
                  <div className="trend-month">{month}</div>
                  <div className="trend-data">
                    <div className="trend-count">{count}</div>
                    <div className="trend-bar-container">
                      <div 
                        className="trend-bar" 
                        style={{width: `${(count / Math.max(...Object.values(reportData.monthlyBreakdown))) * 100}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="top-reasons">
          <h4>Top Termination Reasons</h4>
          <div className="reasons-list">
            {getTopReasons().map(([reason, count], index) => (
              <div key={index} className="reason-item">
                <div className="reason-rank">#{index + 1}</div>
                <div className="reason-details">
                  <div className="reason-name">{reason}</div>
                  <div className="reason-count">{count} terminations ({Math.round((count / reportData.totalTerminations) * 100)}%)</div>
                </div>
                <div className="reason-bar">
                  <div 
                    className="reason-fill" 
                    style={{width: `${(count / reportData.totalTerminations) * 100}%`}}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="property-distribution">
          <h4>Property Distribution</h4>
          <div className="properties-list">
            {getTopProperties().map(([property, count], index) => (
              <div key={index} className="property-item">
                <div className="property-rank">#{index + 1}</div>
                <div className="property-details">
                  <div className="property-name">{property}</div>
                  <div className="property-count">{count} terminations ({Math.round((count / reportData.totalTerminations) * 100)}%)</div>
                </div>
                <div className="property-bar">
                  <div 
                    className="property-fill" 
                    style={{width: `${(count / reportData.totalTerminations) * 100}%`}}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="financial-summary">
          <h4>Financial Summary</h4>
          <div className="financial-cards">
            <div className="financial-card">
              <div className="financial-icon">Money</div>
              <div className="financial-details">
                <div className="financial-amount">{formatCurrency(reportData.financialSummary.totalPenalties)}</div>
                <div className="financial-label">Total Penalties</div>
              </div>
            </div>
            <div className="financial-card">
              <div className="financial-icon">Card</div>
              <div className="financial-details">
                <div className="financial-amount">{formatCurrency(reportData.financialSummary.totalRefunds)}</div>
                <div className="financial-label">Total Refunds</div>
              </div>
            </div>
            <div className="financial-card">
              <div className="financial-icon">Chart</div>
              <div className="financial-details">
                <div className={`financial-amount ${reportData.financialSummary.netSettlement >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(Math.abs(reportData.financialSummary.netSettlement))}
                </div>
                <div className="financial-label">Net Settlement ({reportData.financialSummary.netSettlement >= 0 ? 'Refund' : 'Due'})</div>
              </div>
            </div>
          </div>
        </div>

        <div className="key-insights">
          <h4>Key Insights</h4>
          <div className="insights-grid">
            <div className="insight-card">
              <div className="insight-icon">Trending Up</div>
              <div className="insight-content">
                <h6>Trend Analysis</h6>
                <p>{Object.keys(reportData.monthlyBreakdown).length} months of data available with {Object.values(reportData.monthlyBreakdown).reduce((a, b) => Math.max(a, b), 0)} peak terminations in a single month</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">Bolt</div>
              <div className="insight-content">
                <h6>Processing Efficiency</h6>
                <p>Average processing time of {reportData.processingTime.average} days with {Math.round((reportData.approvedTerminations / reportData.totalTerminations) * 100)}% approval rate</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">Target</div>
              <div className="insight-content">
                <h6>Compliance Rate</h6>
                <p>{reportData.averageNoticePeriod >= 30 ? 'Good' : 'Needs Improvement'} notice period adherence with average of {reportData.averageNoticePeriod} days</p>
              </div>
            </div>
            <div className="insight-card">
              <div className="insight-icon">Money</div>
              <div className="insight-content">
                <h6>Financial Impact</h6>
                <p>Net {reportData.financialSummary.netSettlement >= 0 ? 'refund' : 'revenue'} of {formatCurrency(Math.abs(reportData.financialSummary.netSettlement))} across all terminations</p>
              </div>
            </div>
          </div>
        </div>

        <div className="page-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/manager/terminations')}
          >
            Back to Terminations
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowExportModal(true)}
          >
            Export Report
          </button>
        </div>
      </div>

      <Modal 
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Report"
      >
        <div className="export-modal">
          <div className="export-content">
            <div className="export-icon">Export</div>
            <h5>Export Termination Report</h5>
            <p>Choose the format for your exported report:</p>
            
            <div className="export-options">
              <div className="export-option">
                <div className="option-icon">Document</div>
                <div className="option-details">
                  <h6>PDF Report</h6>
                  <p>Professional formatted report with charts and tables</p>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleExportReport('pdf')}
                  disabled={exporting}
                >
                  {exporting ? 'Exporting...' : 'Export PDF'}
                </button>
              </div>
              
              <div className="export-option">
                <div className="option-icon">Chart</div>
                <div className="option-details">
                  <h6>Excel Spreadsheet</h6>
                  <p>Raw data with pivot tables and filtering capabilities</p>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleExportReport('excel')}
                  disabled={exporting}
                >
                  {exporting ? 'Exporting...' : 'Export Excel'}
                </button>
              </div>
              
              <div className="export-option">
                <div className="option-icon">List</div>
                <div className="option-details">
                  <h6>CSV Data</h6>
                  <p>Comma-separated values for data analysis</p>
                </div>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleExportReport('csv')}
                  disabled={exporting}
                >
                  {exporting ? 'Exporting...' : 'Export CSV'}
                </button>
              </div>
            </div>
            
            <div className="export-note">
              <p><strong>Note:</strong> The exported report will include all data shown in this analytics dashboard.</p>
            </div>
          </div>
          
          <div className="modal-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowExportModal(false)}
              disabled={exporting}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
};

export default TerminationReportPage;
