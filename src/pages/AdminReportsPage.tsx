import { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import Modal from '../components/Modal.tsx';
import { adminApi, useApi } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';

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
    { path: '/admin', label: t('nav.dashboard') },
    { path: '/admin/users', label: t('nav.users') },
    { path: '/admin/security', label: t('nav.security') },
    { path: '/admin/reports', label: t('nav.reports'), active: true }
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
      
      const blob = new Blob([JSON.stringify(result)], { type: 'application/json' });
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${selectedReport}_${new Date().getTime()}.${format}`;
      document.body.appendChild(a);
      a.click();
      globalThis.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      alert(`Report exported as ${format.toUpperCase()}`);
      setShowExportModal(false);
    } catch (error) {
      alert(`Failed to export report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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

        <ChartCard title={t('reports.financial_overview')}>
          <div className="chart-placeholder">
            Chart.js {t('reports.financial')}
          </div>
        </ChartCard>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">{t('reports.available')}</div>
          </div>
          
          {reportsLoading ? (
            <div className="list-item">
              <div className="item-info">
                <h4>{t('common.loading')}...</h4>
              </div>
            </div>
          ) : (
            (availableReports || getFallbackReports()).map((report: { title: string; description: string; status: string }, index: number) => (
              <div key={`report-${report.title}-${index}`} className="list-item">
                <div className="item-info">
                  <h4>{report.title}</h4>
                  <p>{report.description}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span className={`status-badge status-${report.status}`}>{report.status}</span>
                  <button 
                    type="button" 
                    style={{
                      background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                      color: 'white',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(74, 144, 226, 0.3)',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => {
                      setSelectedReport(report.title);
                      setShowExportModal(true);
                    }}
                  >
                    Export
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">{t('reports.generate')} New Report</div>
          </div>
          
          <div className="form-group" style={{ padding: '15px' }}>
            <label className="form-label">{t('reports.type')}</label>
            <select 
              className="form-select"
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
                  className="form-input"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">{t('common.to_date')}</label>
                <input 
                  type="date" 
                  className="form-input"
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
              className="btn-primary" 
              style={{ 
                width: '100%',
                background: 'linear-gradient(135deg, #162F1B 0%, #1a4d2e 100%)',
                padding: '14px',
                borderRadius: '10px',
                fontWeight: '600',
                fontSize: '16px',
                boxShadow: '0 4px 15px rgba(22, 47, 27, 0.3)',
                transition: 'all 0.3s ease',
                border: 'none',
                cursor: 'pointer'
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
                    style={{
                      background: 'linear-gradient(135deg, #4a90e2 0%, #357abd 100%)',
                      color: 'white',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(74, 144, 226, 0.3)',
                      transition: 'all 0.3s ease',
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
              style={{
                background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                color: 'white',
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(220, 53, 69, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onClick={() => handleExportReport('pdf')}
            >
              Export as PDF
            </button>
            <button 
              type="button" 
              style={{
                background: 'linear-gradient(135deg, #28a745 0%, #218838 100%)',
                color: 'white',
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(40, 167, 69, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onClick={() => handleExportReport('csv')}
            >
              Export as CSV
            </button>
            <button 
              type="button" 
              style={{
                background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                color: 'white',
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(23, 162, 184, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onClick={() => handleExportReport('xlsx')}
            >
              Export as Excel (XLSX)
            </button>
            <button 
              type="button" 
              style={{
                background: 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
                color: 'white',
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(108, 117, 125, 0.3)',
                transition: 'all 0.3s ease'
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
