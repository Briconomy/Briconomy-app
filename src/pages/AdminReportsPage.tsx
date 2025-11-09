import { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import Modal from '../components/Modal.tsx';
import { adminApi, useApi } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { exportService, ExportColumn } from '../utils/export-utils.ts';

interface GeneratedReport {
  reportId: string;
  reportType: string;
  fromDate: string;
  toDate: string;
  generatedAt: string;
  status: string;
  summary?: Record<string, unknown>;
}

function AdminReportsPage() {
  const { t } = useLanguage();
  const [reportType, setReportType] = useState('financial');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportResult, setReportResult] = useState<string | null>(null);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  
  const navItems = [
    { path: '/admin', label: t('nav.dashboard'), icon: 'performanceAnalytics' },
    { path: '/admin/users', label: t('nav.users'), icon: 'users' },
    { path: '/admin/security', label: t('nav.security'), icon: 'security' },
    { path: '/admin/reports', label: t('nav.reports'), icon: 'report', active: true }
  ];

  const { data: financialStats, loading: statsLoading, error: statsError } = useApi(() => adminApi.getFinancialStats());
  const { data: availableReports, loading: reportsLoading, error: reportsError } = useApi(() => adminApi.getAvailableReports());
  const { data: reportActivities, loading: activitiesLoading, error: activitiesError } = useApi(() => adminApi.getReportActivities());

  const getFinancialStatsData = () => {
    if (statsError || !financialStats || (Array.isArray(financialStats) && financialStats.length === 0)) {
      return {
        monthlyRevenue: 'R840k',
        occupancyRate: '88%',
        collectionRate: '95%',
        activeReports: '24'
      };
    }
    
    if (statsLoading) {
      return {
        monthlyRevenue: t('common.loading') + '...',
        occupancyRate: t('common.loading') + '...',
        collectionRate: t('common.loading') + '...',
        activeReports: t('common.loading') + '...'
      };
    }
    
    const stats = Array.isArray(financialStats) ? financialStats[0] : financialStats;
    return {
      monthlyRevenue: `R${(stats.monthlyRevenue / 1000).toFixed(0)}k`,
      occupancyRate: `${stats.occupancyRate}%`,
      collectionRate: `${stats.collectionRate}%`,
      activeReports: stats.activeReports?.toString() || '24'
    };
  };

  const getFallbackReports = () => [
    { title: t('reports.financial') + ' ' + t('reports.title'), description: 'Monthly financial summary report', status: 'ready' },
    { title: t('reports.occupancy') + ' ' + t('reports.title'), description: 'Property occupancy analysis report', status: 'pending' },
    { title: t('reports.maintenance') + ' ' + t('reports.title'), description: 'Maintenance cost analysis report', status: 'ready' },
    { title: t('reports.performance') + ' ' + t('reports.title'), description: 'System performance metrics report', status: 'processing' }
  ];

  const getFallbackActivities = () => [
    { 
      action: t('reports.financial') + ' ' + t('reports.title') + ' ' + t('reports.generate'),
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      details: 'System generated monthly report automatically'
    },
    { 
      action: t('reports.occupancy') + ' analysis updated',
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      details: 'Automated analysis completed successfully'
    },
    { 
      action: t('reports.maintenance') + ' ' + t('reports.title') + ' ' + t('reports.generate'),
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      details: 'Weekly maintenance summary completed'
    }
  ];

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

  const handleGenerateReport = async () => {
    if (!fromDate || !toDate) {
      alert('Please select both start and end dates');
      return;
    }

    setGenerating(true);
    setReportResult(null);

    try {
      const filters = {
        reportType,
        fromDate,
        toDate,
        generatedAt: new Date().toISOString()
      };
      
      const result = await adminApi.generateReport(reportType, filters);
      setReportResult('Report generated successfully!');
      setSelectedReport(result.reportId || 'new-report');
      
      // Add to generated reports list
      const newReport: GeneratedReport = {
        reportId: result.reportId || `report-${Date.now()}`,
        reportType,
        fromDate,
        toDate,
        generatedAt: new Date().toISOString(),
        status: 'ready',
        summary: result.data
      };
      setGeneratedReports(prev => [newReport, ...prev]);
      
      alert('Report generated successfully! You can now export it or view it below.');
    } catch (error) {
      setReportResult(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
      alert('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleExportReport = async (format: string) => {
    if (!selectedReport) {
      alert('No report selected');
      return;
    }

    try {
      const result = await adminApi.exportReport(selectedReport, format);
      
      if (!result.success) {
        alert(`Failed to export report: ${result.message || result.error || 'Unknown error'}`);
        return;
      }

      // Find the report data - either from generatedReports or result.data
      let reportData = result.data;
      if (!reportData && generatedReports.length > 0) {
        const foundReport = generatedReports.find(r => r.reportId === selectedReport);
        if (foundReport) {
          reportData = foundReport.summary || foundReport;
        }
      }

      // Prepare data for export
      const exportData = prepareReportDataForExport(reportData, selectedReport);
      const filename = `report_${selectedReport}_${new Date().toISOString().split('T')[0]}`;

      // Export based on format
      switch (format.toLowerCase()) {
        case 'csv': {
          exportService.exportToCSV(exportData.data, exportData.columns, filename);
          break;
        }
        case 'pdf': {
          exportService.exportToPDF(exportData.data, exportData.columns, exportData.title, filename);
          break;
        }
        case 'xlsx': {
          await exportService.exportToXLSX(exportData.data, exportData.columns, filename);
          break;
        }
        case 'json': {
          const jsonBlob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(jsonBlob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${filename}.json`;
          document.body.appendChild(a);
          a.click();
          URL.revokeObjectURL(url);
          document.body.removeChild(a);
          break;
        }
        default: {
          alert(`Unsupported export format: ${format}`);
          return;
        }
      }
      
      alert(`Report exported successfully as ${format.toUpperCase()}`);
      setShowExportModal(false);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Failed to export report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const prepareReportDataForExport = (reportData: unknown, reportId: string) => {
    // Default columns for basic report structure
    const defaultColumns: ExportColumn[] = [
      { key: 'metric', label: 'Metric' },
      { key: 'value', label: 'Value' },
      { key: 'description', label: 'Description' }
    ];

    let data: Record<string, unknown>[] = [];
    const title = `Report: ${reportId}`;
    const columns = defaultColumns;

    if (!reportData || (typeof reportData === 'object' && Object.keys(reportData as object).length === 0)) {
      // Fallback data
      data = [
        { metric: 'Report ID', value: reportId, description: 'Generated report identifier' },
        { metric: 'Generated Date', value: new Date().toLocaleDateString(), description: 'Date when report was generated' },
        { metric: 'Status', value: 'Complete', description: 'Report generation status' }
      ];
    } else if (typeof reportData === 'object' && reportData !== null) {
      // Convert object properties to rows
      const reportObj = reportData as Record<string, unknown>;
      data = Object.entries(reportObj).map(([key, value]) => ({
        metric: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        value: typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''),
        description: `${key} data from report`
      }));
    } else {
      // Simple value
      data = [
        { metric: 'Report Data', value: String(reportData), description: 'Report content' }
      ];
    }

    return { data, columns, title };
  };



  const stats = getFinancialStatsData();

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton showLogout />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">{t('reports.title')} & {t('nav.analytics')}</div>
          <div className="page-subtitle">{t('reports.title')} {t('dashboard.analytics_insights')}</div>
        </div>

        {(statsError || reportsError || activitiesError) && (
          <div className="alert alert-warning mb-4">
            <p>API connection failed - Using fallback data</p>
          </div>
        )}
        
        <div className="dashboard-grid">
          <StatCard value={stats.monthlyRevenue} label={t('payments.monthly_revenue')} />
          <StatCard value={stats.occupancyRate} label={t('reports.occupancy')} />
          <StatCard value={stats.collectionRate} label={t('payments.collection_rate')} />
          <StatCard value={stats.activeReports} label={t('reports.active_reports')} />
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">{t('admin_reports.available_reports')}</div>
          </div>
          {reportsLoading ? (
            <div className="list-item">
              <div className="item-info">
                <h4>{t('common.loading')}...</h4>
              </div>
            </div>
          ) : (
            (Array.isArray(availableReports) && availableReports.length > 0 ? availableReports : getFallbackReports()).map((report, index) => {
              const entry = report as Record<string, unknown>;
              const keyValue = entry.reportId ?? entry.id ?? entry.title ?? index;
              const title = typeof entry.title === 'string' ? entry.title : `${t('admin_reports.title')} ${index + 1}`;
              const description = typeof entry.description === 'string' ? entry.description : 'No description available';
              const rawStatus = typeof entry.status === 'string' ? entry.status : 'ready';
              const statusClass = rawStatus.toLowerCase().replace(/[^a-z0-9-]/g, '-');

              return (
                <div key={`available-${String(keyValue)}`} className="list-item">
                  <div className="item-info">
                    <h4>{title}</h4>
                    <p>{description}</p>
                  </div>
                  <span className={`status-badge status-${statusClass}`}>{rawStatus}</span>
                </div>
              );
            })
          )}
        </div>

        <ChartCard title={t('reports.financial_overview')}>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#2c3e50' }}>
                {t('reports.financial_overview')}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Total Revenue Generated</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#27ae60' }}>R2.85M</div>
                  <div style={{ fontSize: '11px', color: '#27ae60' }}>↑ 12.5% {t('dashboard.from_last_week')}</div>
                </div>
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Reports Generated</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#3498db' }}>342</div>
                  <div style={{ fontSize: '11px', color: '#27ae60' }}>↑ 8.3% {t('dashboard.from_last_week')}</div>
                </div>
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Avg Generation Time</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#2563eb' }}>4.2s</div>
                  <div style={{ fontSize: '11px', color: '#27ae60' }}>↓ 15.6% {t('dashboard.faster')}</div>
                </div>
                <div style={{ padding: '12px', background: '#f8f9fa', borderRadius: '6px' }}>
                  <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '4px' }}>Data Processed</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#f39c12' }}>52.3 GB</div>
                  <div style={{ fontSize: '11px', color: '#6c757d' }}>Monthly total</div>
                </div>
              </div>
            </div>
          </div>
        </ChartCard>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">{t('reports.generate')} New Report</div>
          </div>
          
          <div className="form-group2" style={{ padding: '15px' }}>
            <label className="form-label">{t('reports.type')}</label>
            <select 
              className="form-select2"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '15px' }}
            >
              <option value="financial">{t('reports.financial')}</option>
              <option value="occupancy">{t('reports.occupancy')}</option>
              <option value="maintenance">{t('reports.maintenance')}</option>
              <option value="performance">{t('reports.performance')}</option>
              <option value="custom">{t('reports.custom')}</option>
            </select>
          
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">{t('common.from_date')}</label>
                <input 
                  type="date" 
                  className="form-input2"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">{t('common.to_date')}</label>
                <input 
                  type="date" 
                  className="form-input2"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
            </div>
            
            {reportResult && (
              <div className={`alert ${reportResult.includes('Failed') ? 'alert-error' : 'alert-success'}`} style={{ marginBottom: '15px' }}>
                {reportResult}
              </div>
            )}
          
            <button 
              type="button" 
              className="btn btn-primary generateReport-btn" 
              style={{ 
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                boxShadow: '0 4px 15px rgba(22, 47, 27, 0.3)'
              }}
              onClick={handleGenerateReport}
              disabled={generating}
              onMouseOver={(e) => {
                if (!generating) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(22, 47, 27, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(22, 47, 27, 0.3)';
              }}
            >
              {generating ? 'Generating...' : t('reports.generate') + ' Report'}
            </button>
          </div>
        </div>

        {/* Generated Reports Section */}
        {generatedReports.length > 0 && (
          <div className="data-table">
            <div className="table-header">
              <div className="table-title">Generated Reports</div>
            </div>
            
            {generatedReports.map((report) => (
              <div key={report.reportId} className="list-item">
                <div className="item-info">
                  <h4>
                    {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)} Report
                  </h4>
                  <p>
                    Generated: {new Date(report.generatedAt).toLocaleString()} • 
                    Period: {new Date(report.fromDate).toLocaleDateString()} - {new Date(report.toDate).toLocaleDateString()}
                  </p>
                  {report.summary && (
                    <div style={{ 
                      marginTop: '10px', 
                      padding: '12px', 
                      background: '#f8f9fa', 
                      borderRadius: '8px',
                      fontSize: '14px'
                    }}>
                      <strong>Summary:</strong>
                      <div style={{ marginTop: '8px' }}>
                        {Object.entries(report.summary).map(([key, value]) => (
                          <div key={key} style={{ marginBottom: '4px' }}>
                            <span style={{ color: '#6c757d' }}>{key}:</span>{' '}
                            <span style={{ fontWeight: '600', color: '#162F1B' }}>
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexDirection: 'column' }}>
                  <span className={`status-badge status-${report.status}`}>{report.status}</span>
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    style={{
                      padding: '10px 20px',
                      fontSize: '14px',
                      boxShadow: '0 3px 10px rgba(255, 137, 77, 0.3)',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={() => {
                      setSelectedReport(report.reportId);
                      setShowExportModal(true);
                    }}
                  >
                    Export
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">{t('reports.recent_activity')}</div>
          </div>
          {activitiesLoading ? (
            <div className="list-item">
              <div className="item-info">
                <h4>{t('common.loading')}...</h4>
              </div>
            </div>
          ) : (
            (reportActivities || getFallbackActivities()).map((activity: { action: string; timestamp: string; details: string }, index: number) => (
              <div key={`activity-${activity.timestamp}-${index}`} className="list-item">
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
      
      {showExportModal && (
        <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} title="Export Report">
          <p>Select export format for: <strong>{selectedReport}</strong></p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            <button 
              type="button"
              className="btn btn-secondary"
              style={{
                padding: '14px',
                fontSize: '15px',
                boxShadow: '0 4px 12px rgba(255, 137, 77, 0.3)'
              }}
              onClick={() => handleExportReport('pdf')}
            >
              Export as PDF
            </button>
            <button 
              type="button"
              className="btn btn-secondary"
              style={{
                padding: '14px',
                fontSize: '15px',
                boxShadow: '0 4px 12px rgba(255, 137, 77, 0.3)'
              }}
              onClick={() => handleExportReport('csv')}
            >
              Export as CSV
            </button>
            <button 
              type="button"
              className="btn btn-secondary"
              style={{
                padding: '14px',
                fontSize: '15px',
                boxShadow: '0 4px 12px rgba(255, 137, 77, 0.3)'
              }}
              onClick={() => handleExportReport('xlsx')}
            >
              Export as Excel (XLSX)
            </button>
            <button 
              type="button"
              className="btn btn-notifications"
              style={{
                padding: '14px',
                fontSize: '15px',
                boxShadow: '0 4px 12px rgba(108, 117, 125, 0.3)'
              }}
              onClick={() => handleExportReport('json')}
            >
              Export as JSON
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AdminReportsPage;
