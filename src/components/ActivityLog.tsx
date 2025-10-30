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

function formatDateTime(timestamp: string) {
  return new Date(timestamp).toLocaleString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusColor(status?: ActivityItem['status']) {
  switch (status) {
    case 'success':
      return 'status-paid';
    case 'pending':
      return 'status-pending';
    case 'failed':
      return 'status-overdue';
    default:
      return 'status-pending';
  }
}

function getActivityIconName(type: ActivityItem['type']) {
  return activityTypeConfig[type].icon;
}

function getActivityAccentColor(type: ActivityItem['type']) {
  return activityTypeConfig[type].color;
}

function getActivityTypeName(type: ActivityItem['type']) {
  return activityTypeConfig[type].label;
}

function escapePdfText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function formatDetailKey(key: string): string {
  return key
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function formatDetailValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '—';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map((item) => formatDetailValue(item)).join(', ');
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([entryKey, entryValue]) => `${formatDetailKey(entryKey)}: ${formatDetailValue(entryValue)}`);
    return entries.join('; ');
  }
  return String(value);
}

function formatDetailLines(details?: Record<string, unknown>): string[] {
  if (!details || Object.keys(details).length === 0) {
    return [];
  }
  const lines = ['Details:'];
  for (const [key, value] of Object.entries(details)) {
    lines.push(`  - ${formatDetailKey(key)}: ${formatDetailValue(value)}`);
  }
  return lines;
}

function wrapForPdf(text: string, max = 92): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  let firstPrefix = '';
  let restPrefix = '';
  let content = text;

  const bulletMatch = text.match(/^(\s*[\u2022\-*]\s+)/);
  if (bulletMatch) {
    firstPrefix = bulletMatch[1];
    restPrefix = ' '.repeat(firstPrefix.length);
    content = text.slice(firstPrefix.length);
  } else {
    const indentMatch = text.match(/^(\s+)/);
    if (indentMatch) {
      firstPrefix = indentMatch[1];
      restPrefix = indentMatch[1];
      content = text.slice(firstPrefix.length);
    }
  }

  const words = content.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return [text.trim()];
  }

  const lines: string[] = [];
  let current = '';
  let isFirstLine = true;

  for (const word of words) {
    const available = max - (isFirstLine ? firstPrefix.length : restPrefix.length);
    const candidate = current.length > 0 ? `${current} ${word}` : word;

    if (available <= 0) {
      const prefix = isFirstLine ? firstPrefix : restPrefix;
      lines.push(prefix + candidate);
      current = '';
      isFirstLine = false;
      continue;
    }

    if (candidate.length <= available) {
      current = candidate;
      continue;
    }

    if (current.length === 0) {
      const prefix = isFirstLine ? firstPrefix : restPrefix;
      lines.push(prefix + candidate);
      current = '';
      isFirstLine = false;
      continue;
    }

    const prefix = isFirstLine ? firstPrefix : restPrefix;
    lines.push(prefix + current);
    current = word;
    isFirstLine = false;
  }

  if (current.length > 0) {
    const prefix = lines.length === 0 ? firstPrefix : restPrefix;
    lines.push(prefix + current);
  }

  return lines;
}

function buildPdfObjects(content: string) {
  const objects: string[] = [];
  objects.push('');
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Count 1 /Kids [3 0 R] >>\nendobj\n');
  objects.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n');
  objects.push(`4 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`);
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');
  return objects;
}

function assemblePdf(contentCommands: string[]): Uint8Array {
  const header = '%PDF-1.4\n';
  const contentStream = contentCommands.join('\n');
  const objects = buildPdfObjects(contentStream);
  let body = '';
  const xrefEntries = ['0000000000 65535 f \n'];
  let offset = header.length;

  for (let index = 1; index < objects.length; index += 1) {
    const object = objects[index];
    xrefEntries.push(`${offset.toString().padStart(10, '0')} 00000 n \n`);
    body += object;
    offset += object.length;
  }

  const xrefStart = offset;
  const xref = `xref\n0 ${objects.length}\n${xrefEntries.join('')}`;
  const trailer = `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  const pdfString = header + body + xref + trailer;
  const encoder = new TextEncoder();
  return encoder.encode(pdfString);
}

function createPdfBlobFromActivities(activities: ActivityItem[]): Blob {
  const now = new Date();
  const lines: string[] = [];
  lines.push('Tenant Activity Log');
  lines.push(`Generated: ${now.toLocaleString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })}`);
  lines.push(`Total Activities: ${activities.length}`);
  lines.push('');

  if (activities.length === 0) {
    lines.push('No activity records available.');
  } else {
    activities.forEach((activity, index) => {
      lines.push(`${index + 1}. ${formatDateTime(activity.timestamp)} — ${activity.title}`);
      lines.push(`Type: ${getActivityTypeName(activity.type)} | Status: ${activity.status?.toUpperCase() ?? 'N/A'}`);
      lines.push(`Description: ${activity.description}`);
      const detailLines = formatDetailLines(activity.details);
      detailLines.forEach((detailLine) => lines.push(detailLine));
      lines.push('');
    });
  }

  const commands: string[] = [];
  commands.push('BT');
  commands.push('/F1 12 Tf');
  commands.push('18 TL');
  commands.push('1 0 0 1 60 760 Tm');

  let hasContent = false;

  const appendSegments = (segments: string[]) => {
    segments.forEach((segment) => {
      if (!hasContent) {
        commands.push(`(${escapePdfText(segment)}) Tj`);
        hasContent = true;
      } else {
        commands.push('T*');
        commands.push(`(${escapePdfText(segment)}) Tj`);
      }
    });
  };

  lines.forEach((line) => {
    if (line.trim().length === 0) {
      if (hasContent) {
        commands.push('T*');
      }
      return;
    }

    const wrapped = wrapForPdf(line);
    if (wrapped.length === 0) {
      if (hasContent) {
        commands.push('T*');
      }
      return;
    }

    appendSegments(wrapped);
  });

  commands.push('ET');

  const pdfBytes = assemblePdf(commands);
  const buffer = new ArrayBuffer(pdfBytes.byteLength);
  new Uint8Array(buffer).set(pdfBytes);
  return new Blob([buffer], { type: 'application/pdf' });
}

const defaultActivities: ActivityItem[] = [
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
];

function ActivityLog() {
  const activities = defaultActivities;
  const [filter, setFilter] = useState<ActivityFilterKey>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [exporting, setExporting] = useState(false);

  const activityCounts: Record<ActivityFilterKey, number> = {
    all: 0,
    login: 0,
    payment: 0,
    maintenance_request: 0,
    profile_update: 0,
    document_upload: 0,
    lease_action: 0
  };

  for (const activity of activities) {
    activityCounts.all += 1;
    activityCounts[activity.type] += 1;
  }

  const filterOptions: Array<{ key: ActivityFilterKey; label: string }> = [
    { key: 'all', label: 'All' },
    ...Object.entries(activityTypeConfig).map(([key, value]) => ({
      key: key as ActivityItem['type'],
      label: value.label
    }))
  ];

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredActivities = activities.filter((activity) => {
    const matchesFilter = filter === 'all' || activity.type === filter;
    const matchesSearch =
      normalizedSearch.length === 0 ||
      activity.title.toLowerCase().includes(normalizedSearch) ||
      activity.description.toLowerCase().includes(normalizedSearch);
    return matchesFilter && matchesSearch;
  });

  const handleExport = () => {
    if (exporting) {
      return;
    }
    setExporting(true);
    try {
      const blob = createPdfBlobFromActivities(activities);
      const url = globalThis.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `activity-log-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      globalThis.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Activity export failed:', error);
    } finally {
      setExporting(false);
    }
  };

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
            {exporting ? 'Exporting…' : 'Export PDF'}
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
                {`${option.label} (${activityCounts[option.key] ?? 0})`}
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
