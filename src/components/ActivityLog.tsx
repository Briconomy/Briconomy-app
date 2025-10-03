import { useState } from 'react';

interface ActivityItem {
  id: string;
  type: 'login' | 'payment' | 'maintenance_request' | 'profile_update' | 'document_upload' | 'lease_action';
  title: string;
  description: string;
  timestamp: string;
  details?: Record<string, unknown>;
  status?: 'success' | 'pending' | 'failed';
}

function ActivityLog() {
  const [activities, _setActivities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'login',
      title: 'Login',
      description: 'Successfully logged into account',
      timestamp: '2024-09-16T09:15:00Z',
      status: 'success',
      details: { device: 'Mobile App', location: 'Johannesburg' }
    },
    {
      id: '2',
      type: 'payment',
      title: 'Rent Payment',
      description: 'Monthly rent payment processed',
      timestamp: '2024-09-01T08:30:00Z',
      status: 'success',
      details: { amount: 12500, method: 'bank_transfer', reference: 'RENT-SEP-2024' }
    },
    {
      id: '3',
      type: 'maintenance_request',
      title: 'Maintenance Request Submitted',
      description: 'Plumbing issue reported in bathroom',
      timestamp: '2024-08-28T14:20:00Z',
      status: 'pending',
      details: { category: 'plumbing', priority: 'medium', request_id: 'MAINT-2024-0828' }
    },
    {
      id: '4',
      type: 'profile_update',
      title: 'Profile Updated',
      description: 'Emergency contact information updated',
      timestamp: '2024-08-25T11:45:00Z',
      status: 'success',
      details: { fields_updated: ['emergency_contact'] }
    },
    {
      id: '5',
      type: 'document_upload',
      title: 'Document Uploaded',
      description: 'Lease agreement uploaded',
      timestamp: '2024-08-20T16:30:00Z',
      status: 'success',
      details: { document_type: 'lease', file_size: '2.4 MB' }
    },
    {
      id: '6',
      type: 'lease_action',
      title: 'Lease Renewal',
      description: 'Lease renewed for another year',
      timestamp: '2024-08-15T10:00:00Z',
      status: 'success',
      details: { renewal_period: '12 months', new_monthly_rent: 13000 }
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'login' | 'payment' | 'maintenance_request' | 'profile_update' | 'document_upload' | 'lease_action'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [exporting, setExporting] = useState(false);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'login': return 'Login';
      case 'payment': return 'Payment';
      case 'maintenance_request': return 'Maintenance';
      case 'profile_update': return 'Profile';
      case 'document_upload': return 'Document';
      case 'lease_action': return 'Lease';
      default: return 'Activity';
    }
  };

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'login': return 'activity-login';
      case 'payment': return 'activity-payment';
      case 'maintenance_request': return 'activity-maintenance';
      case 'profile_update': return 'activity-profile';
      case 'document_upload': return 'activity-document';
      case 'lease_action': return 'activity-lease';
      default: return 'activity-default';
    }
  };

  const getStatusColor = (status?: ActivityItem['status']) => {
    switch (status) {
      case 'success': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-overdue';
      default: return 'status-pending';
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type === filter;
    const matchesSearch = searchTerm === '' || 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExport = () => {
    setExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      const exportData = {
        export_date: new Date().toISOString(),
        total_activities: activities.length,
        activities: activities
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `activity-log-${new Date().toISOString().split('T')[0]}.json`;
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
      minute: '2-digit'
    });
  };

  const getActivityTypeName = (type: ActivityItem['type']) => {
    switch (type) {
      case 'login': return 'Login';
      case 'payment': return 'Payment';
      case 'maintenance_request': return 'Maintenance Request';
      case 'profile_update': return 'Profile Update';
      case 'document_upload': return 'Document Upload';
      case 'lease_action': return 'Lease Action';
      default: return 'Activity';
    }
  };

  const activityCounts = {
    all: activities.length,
    login: activities.filter(a => a.type === 'login').length,
    payment: activities.filter(a => a.type === 'payment').length,
    maintenance_request: activities.filter(a => a.type === 'maintenance_request').length,
    profile_update: activities.filter(a => a.type === 'profile_update').length,
    document_upload: activities.filter(a => a.type === 'document_upload').length,
    lease_action: activities.filter(a => a.type === 'lease_action').length
  };

  return (
    <div className="activity-log">
      <div className="activity-header">
        <h3>Activity Log</h3>
        <div className="search-box" style={{ marginBottom: '16px' }}>
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: '14px',
              backgroundColor: '#fff',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => e.target.style.borderColor = '#162F1B'}
            onBlur={(e) => e.target.style.borderColor = '#ddd'}
          />
        </div>
        <div className="activity-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <button 
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      <div className="activity-filters">
        <div className="filter-buttons" style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          <button
            type="button"
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
            style={{ 
              fontSize: '11px', 
              padding: '2px 6px', 
              minHeight: 'auto', 
              borderRadius: '12px',
              border: 'none',
              whiteSpace: 'nowrap',
              flex: 'none',
              width: 'auto',
              minWidth: 'auto'
            }}
          >
            All ({activityCounts.all})
          </button>
          <button
            type="button"
            className={`btn ${filter === 'login' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('login')}
            style={{ 
              fontSize: '11px', 
              padding: '2px 6px', 
              minHeight: 'auto', 
              borderRadius: '12px',
              border: 'none',
              whiteSpace: 'nowrap',
              flex: 'none',
              width: 'auto',
              minWidth: 'auto'
            }}
          >
            Logins ({activityCounts.login})
          </button>
          <button
            type="button"
            className={`btn ${filter === 'payment' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('payment')}
            style={{ 
              fontSize: '11px', 
              padding: '2px 6px', 
              minHeight: 'auto', 
              borderRadius: '12px',
              border: 'none',
              whiteSpace: 'nowrap',
              flex: 'none',
              width: 'auto',
              minWidth: 'auto'
            }}
          >
            Payments ({activityCounts.payment})
          </button>
          <button
            type="button"
            className={`btn ${filter === 'maintenance_request' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('maintenance_request')}
            style={{ 
              fontSize: '11px', 
              padding: '2px 6px', 
              minHeight: 'auto', 
              borderRadius: '12px',
              border: 'none',
              whiteSpace: 'nowrap',
              flex: 'none',
              width: 'auto',
              minWidth: 'auto'
            }}
          >
            Maintenance ({activityCounts.maintenance_request})
          </button>
          <button
            type="button"
            className={`btn ${filter === 'profile_update' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('profile_update')}
            style={{ 
              fontSize: '11px', 
              padding: '2px 6px', 
              minHeight: 'auto', 
              borderRadius: '12px',
              border: 'none',
              whiteSpace: 'nowrap',
              flex: 'none',
              width: 'auto',
              minWidth: 'auto'
            }}
          >
            Profile ({activityCounts.profile_update})
          </button>
          <button
            type="button"
            className={`btn ${filter === 'document_upload' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('document_upload')}
            style={{ 
              fontSize: '11px', 
              padding: '2px 6px', 
              minHeight: 'auto', 
              borderRadius: '12px',
              border: 'none',
              whiteSpace: 'nowrap',
              flex: 'none',
              width: 'auto',
              minWidth: 'auto'
            }}
          >
            Documents ({activityCounts.document_upload})
          </button>
          <button
            type="button"
            className={`btn ${filter === 'lease_action' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('lease_action')}
            style={{ 
              fontSize: '11px', 
              padding: '2px 6px', 
              minHeight: 'auto', 
              borderRadius: '12px',
              border: 'none',
              whiteSpace: 'nowrap',
              flex: 'none',
              width: 'auto',
              minWidth: 'auto'
            }}
          >
            Lease ({activityCounts.lease_action})
          </button>
        </div>
      </div>

      <div className="activity-list">
        {filteredActivities.length === 0 ? (
          <div className="empty-state">
            <p>No activities found</p>
            {searchTerm && (
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => setSearchTerm('')}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-main">
                <div className="activity-icon">
                  <span className={`icon-wrapper ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </span>
                </div>
                <div className="activity-content">
                  <div className="activity-header-info">
                    <h4>{activity.title}</h4>
                    {activity.status && (
                      <span className={`status-badge ${getStatusColor(activity.status)}`}>
                        {activity.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="activity-description">{activity.description}</p>
                  <p className="activity-meta">
                    {getActivityTypeName(activity.type)} • {formatDateTime(activity.timestamp)}
                  </p>
                </div>
                <div className="activity-actions">
                  <button 
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => setSelectedActivity(activity)}
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedActivity && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Activity Details</h3>
              <button 
                type="button"
                className="close-btn"
                onClick={() => setSelectedActivity(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="activity-details">
                <div className="detail-row">
                  <label>Type:</label>
                  <span>{getActivityTypeName(selectedActivity.type)}</span>
                </div>
                <div className="detail-row">
                  <label>Title:</label>
                  <span>{selectedActivity.title}</span>
                </div>
                <div className="detail-row">
                  <label>Description:</label>
                  <span>{selectedActivity.description}</span>
                </div>
                <div className="detail-row">
                  <label>Timestamp:</label>
                  <span>{formatDateTime(selectedActivity.timestamp)}</span>
                </div>
                {selectedActivity.status && (
                  <div className="detail-row">
                    <label>Status:</label>
                    <span className={`status-badge ${getStatusColor(selectedActivity.status)}`}>
                      {selectedActivity.status.toUpperCase()}
                    </span>
                  </div>
                )}
                {selectedActivity.details && (
                  <div className="detail-row">
                    <label>Additional Details:</label>
                    <div className="details-json">
                      <pre>{JSON.stringify(selectedActivity.details, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
              <div className="form-actions">
                <button 
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedActivity(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ActivityLog;
