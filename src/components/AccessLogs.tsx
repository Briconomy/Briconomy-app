import { useState, useEffect } from 'react';
import { adminApi } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import Icon from './Icon.tsx';

interface AuditLogItem {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  timestamp: string;
}

interface AccessLogsProps {
  userId?: string;
  resourceFilter?: string;
  maxItems?: number;
  showFilters?: boolean;
}

function AccessLogs({ userId, resourceFilter, maxItems = 50, showFilters = true }: AccessLogsProps) {
  const { t } = useLanguage();
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilterState, setResourceFilterState] = useState<string>(resourceFilter || 'all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [exporting, setExporting] = useState(false);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const filters: Record<string, unknown> = {};
      
      if (userId) {
        filters.userId = userId;
      }
      
      if (resourceFilterState !== 'all') {
        filters.resource = resourceFilterState;
      }
      
      if (actionFilter !== 'all') {
        filters.action = actionFilter;
      }
      
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate: Date;
        
        switch (dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          default:
            startDate = new Date(0);
        }
        
        filters.timestamp = { $gte: startDate.toISOString() };
      }

      const response = await adminApi.getAuditLogs(filters);
      const logs = Array.isArray(response) ? response : response.data || [];
      setAuditLogs(logs.slice(0, maxItems));
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [userId, actionFilter, resourceFilterState, dateFilter, maxItems]);

  const getActionIconName = (action: string) => {
    switch (action.toLowerCase()) {
      case 'user_login':
      case 'login':
        return 'security';
      case 'user_logout':
      case 'logout':
        return 'refresh';
      case 'payment_created':
      case 'payment':
        return 'payment';
      case 'maintenance_request_created':
      case 'maintenance':
        return 'maintenance';
      case 'profile_update':
        return 'profile';
      case 'document_upload':
        return 'uploadDoc';
      case 'security_change':
        return 'security';
      case 'admin_action':
        return 'manage';
      default:
        return 'activityLog';
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'user_login':
      case 'login':
        return '#28a745';
      case 'user_logout':
      case 'logout':
        return '#6c757d';
      case 'payment_created':
      case 'payment':
        return '#007bff';
      case 'maintenance_request_created':
      case 'maintenance':
        return '#fd7e14';
      case 'security_change':
        return '#dc3545';
      case 'admin_action':
        return '#6f42c1';
      default:
        return '#17a2b8';
    }
  };

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && JSON.stringify(log.details).toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const handleExport = () => {
    setExporting(true);
    
    setTimeout(() => {
      const exportData = {
        export_date: new Date().toISOString(),
        total_logs: filteredLogs.length,
        filters: {
          action: actionFilter,
          resource: resourceFilterState,
          date: dateFilter,
          search: searchTerm
        },
        logs: filteredLogs
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `access-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setExporting(false);
    }, 1000);
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDetails = (details: Record<string, unknown>) => {
    if (!details || Object.keys(details).length === 0) return null;
    
    return Object.entries(details)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(([key, value]) => `${key}: ${String(value)}`)
      .join(', ');
  };

  const actionTypes = [
    { value: 'all', label: t('common.all') || 'All' },
    { value: 'user_login', label: 'Login' },
    { value: 'user_logout', label: 'Logout' },
    { value: 'payment_created', label: 'Payment' },
    { value: 'maintenance_request_created', label: 'Maintenance' },
    { value: 'profile_update', label: 'Profile Update' },
    { value: 'security_change', label: 'Security Change' },
    { value: 'admin_action', label: 'Admin Action' }
  ];

  const resourceTypes = [
    { value: 'all', label: t('common.all') || 'All' },
    { value: 'authentication', label: 'Authentication' },
    { value: 'payments', label: 'Payments' },
    { value: 'maintenance_requests', label: 'Maintenance' },
    { value: 'users', label: 'Users' },
    { value: 'security', label: 'Security' },
    { value: 'system', label: 'System' }
  ];

  const dateRanges = [
    { value: 'all', label: t('common.all') || 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'This Month' }
  ];

  return (
    <div className="access-logs">
      <div className="access-logs-header">
        <h3>{t('security.access_logs') || 'Access Logs'}</h3>
        
        {showFilters && (
          <div className="access-logs-controls" style={{ 
            display: 'flex', 
            gap: '12px', 
            flexWrap: 'wrap',
            marginBottom: '16px',
            alignItems: 'center'
          }}>
            <div className="search-box" style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                placeholder={t('common.search') || 'Search logs...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  outline: 'none'
                }}
              />
            </div>
            
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px',
                backgroundColor: '#fff',
                outline: 'none',
                minWidth: '120px'
              }}
            >
              {actionTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            <select
              value={resourceFilterState}
              onChange={(e) => setResourceFilterState(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px',
                backgroundColor: '#fff',
                outline: 'none',
                minWidth: '120px'
              }}
            >
              {resourceTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: '14px',
                backgroundColor: '#fff',
                outline: 'none',
                minWidth: '120px'
              }}
            >
              {dateRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
            
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting || filteredLogs.length === 0}
              style={{
                background: exporting ? '#6c757d' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: exporting ? 'not-allowed' : 'pointer',
                minWidth: '80px'
              }}
            >
              {exporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="loading-state" style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#666'
        }}>
          <div>Loading access logs...</div>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="empty-state" style={{ 
          textAlign: 'center', 
          padding: '40px',
          color: '#666'
        }}>
          <div>No access logs found</div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            {searchTerm || actionFilter !== 'all' || resourceFilterState !== 'all' || dateFilter !== 'all' 
              ? 'Try adjusting your filters' 
              : 'No activity has been logged yet'
            }
          </div>
        </div>
      ) : (
        <div className="access-logs-list">
          {filteredLogs.map((log) => (
            <div key={log.id} className="log-item" style={{
              border: '1px solid #e9ecef',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '12px',
              backgroundColor: '#fff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}>
              <div className="log-header" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <div className="log-action" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span
                    className="log-action-icon"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: getActionColor(log.action),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 0 2px rgba(255,255,255,0.9)'
                    }}
                  >
                    <Icon
                      name={getActionIconName(log.action)}
                      size={18}
                      noBackground
                      preserveColor
                    />
                  </span>
                  <span style={{ 
                    fontWeight: '600',
                    color: getActionColor(log.action)
                  }}>
                    {log.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                
                <div className="log-time" style={{
                  fontSize: '12px',
                  color: '#6c757d'
                }}>
                  {formatDateTime(log.timestamp)}
                </div>
              </div>
              
              <div className="log-resource" style={{
                fontSize: '14px',
                color: '#495057',
                marginBottom: '4px'
              }}>
                <strong>Resource:</strong> {log.resource}
              </div>
              
              {log.userId && (
                <div className="log-user" style={{
                  fontSize: '14px',
                  color: '#495057',
                  marginBottom: '4px'
                }}>
                  <strong>User ID:</strong> {log.userId}
                </div>
              )}
              
              {formatDetails(log.details) && (
                <div className="log-details" style={{
                  fontSize: '13px',
                  color: '#6c757d',
                  backgroundColor: '#f8f9fa',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  marginTop: '8px',
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                  {formatDetails(log.details)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {!showFilters && filteredLogs.length >= maxItems && (
        <div style={{
          textAlign: 'center',
          padding: '16px',
          color: '#6c757d',
          fontSize: '14px'
        }}>
          Showing latest {maxItems} entries. View the full access logs page for more.
        </div>
      )}
    </div>
  );
}

export default AccessLogs;