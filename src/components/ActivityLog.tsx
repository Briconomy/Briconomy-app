import { useState } from 'react';
import Icon from './Icon.tsx';

interface ActivityItem {
  id: string;
  type: 'login' | 'payment' | 'maintenance_request' | 'profile_update' | 'document_upload' | 'lease_action';
  title: string;
  description: string;
  timestamp: string;
  details?: Record<string, unknown>;
  status?: 'success' | 'pending' | 'failed';
}

type ActivityFilterKey = 'all' | ActivityItem['type'];

const activityTypeConfig: Record<ActivityItem['type'], { label: string; icon: string; color: string }> = {
  login: { label: 'Logins', icon: 'activityLog', color: 'var(--brand-primary)' },
  payment: { label: 'Payments', icon: 'payment', color: 'var(--brand-secondary)' },
  maintenance_request: { label: 'Maintenance', icon: 'maintenance', color: 'var(--brand-ai)' },
  profile_update: { label: 'Profile', icon: 'profile', color: 'var(--info)' },
  document_upload: { label: 'Documents', icon: 'document', color: 'var(--primary)' },
  lease_action: { label: 'Lease', icon: 'lease', color: 'var(--success)' }
};

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

  const [filter, setFilter] = useState<ActivityFilterKey>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [exporting, setExporting] = useState(false);

  const getActivityIconName = (type: ActivityItem['type']) => activityTypeConfig[type].icon;

  const getActivityAccentColor = (type: ActivityItem['type']) => activityTypeConfig[type].color;

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
    const matchesSearch =
      searchTerm === '' ||
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExport = () => {
    setExporting(true);
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

  const getActivityTypeName = (type: ActivityItem['type']) => activityTypeConfig[type].label;

  const activityCounts = activities.reduce((acc, activity) => {
    acc.all += 1;
    acc[activity.type] += 1;
    return acc;
  }, {
    all: 0,
    login: 0,
    payment: 0,
    maintenance_request: 0,
    profile_update: 0,
    document_upload: 0,
    lease_action: 0
  } as Record<ActivityFilterKey, number>);

  const filterOptions: Array<{ key: ActivityFilterKey; label: string }> = [
    { key: 'all', label: 'All' },
    ...Object.entries(activityTypeConfig).map(([key, value]) => ({
      key: key as ActivityItem['type'],
      label: value.label
    }))
  ];

  return (
    <div className="activity-log">
      <section className="activity-card activity-log-controls">
        <div className="activity-search-row">
          <input
            type="search"
            className="input activity-search-input"
            placeholder="Search activities"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label="Search activities"
          />
          <button
            type="button"
            className="button button-md button-primary activity-export-button"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
        <div className="activity-filter-list">
          {filterOptions.map((option) => {
            const isActive = filter === option.key;
            const buttonClass = [
              'activity-filter-button',
              option.key !== 'all' ? `activity-filter-${option.key}` : '',
              isActive ? 'active' : ''
            ].filter(Boolean).join(' ');

            return (
              <button
                key={option.key}
                type="button"
                className={buttonClass}
                onClick={() => setFilter(option.key)}
              >
                {`${option.label} (${activityCounts[option.key]})`}
              </button>
            );
          })}
        </div>
      </section>

      <div className="activity-list">
        {filteredActivities.length === 0 ? (
          <div className="activity-card activity-empty">
            <p>No activities found</p>
            {searchTerm && (
              <button
                type="button"
                className="button button-sm button-secondary"
                onClick={() => setSearchTerm('')}
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredActivities.map((activity) => (
            <div key={activity.id} className="activity-card activity-item">
              <div className="activity-item-top">
                <div className="activity-item-icon">
                  <Icon
                    name={getActivityIconName(activity.type)}
                    size={40}
                    color={getActivityAccentColor(activity.type)}
                    borderRadius="50%"
                  />
                </div>
                <div className="activity-item-body">
                  <div className="activity-item-heading">
                    <h4 className="activity-item-title">{activity.title}</h4>
                    {activity.status && (
                      <span className={`status-badge ${getStatusColor(activity.status)}`}>
                        {activity.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="activity-item-description">{activity.description}</p>
                  <div className="activity-item-meta">
                    <span>{getActivityTypeName(activity.type)}</span>
                    <span className="activity-item-meta-separator" aria-hidden="true">•</span>
                    <span>{formatDateTime(activity.timestamp)}</span>
                  </div>
                </div>
                <div className="activity-item-actions">
                  <button
                    type="button"
                    className="button button-sm button-secondary activity-details-button"
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
          <div className="modal-content modal-large">
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
                  className="button button-md button-secondary"
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
