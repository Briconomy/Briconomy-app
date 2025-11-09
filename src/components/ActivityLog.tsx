import { useMemo, useState } from 'react';
import Icon from './Icon.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

type ActivityStatus = 'success' | 'pending' | 'failed';

interface ActivityItem {
  id: string;
  type: 'login' | 'payment' | 'maintenance_request' | 'profile_update' | 'document_upload' | 'lease_action';
  title: string;
  description: string;
  timestamp: string;
  details?: Record<string, unknown>;
  status?: ActivityStatus;
}

type ActivityFilterKey = 'all' | ActivityItem['type'];

interface ActivityTemplate extends Omit<ActivityItem, 'title' | 'description'> {
  titleKey: string;
  descriptionKey: string;
}

const activityTypeConfig: Record<ActivityItem['type'], { labelKey: string; icon: string; color: string }> = {
  login: { labelKey: 'activity.types.login', icon: 'activityLog', color: 'var(--brand-primary)' },
  payment: { labelKey: 'activity.types.payment', icon: 'payment', color: 'var(--brand-secondary)' },
  maintenance_request: { labelKey: 'activity.types.maintenance', icon: 'maintenance', color: 'var(--brand-ai)' },
  profile_update: { labelKey: 'activity.types.profile', icon: 'profile', color: 'var(--info)' },
  document_upload: { labelKey: 'activity.types.documents', icon: 'document', color: 'var(--primary)' },
  lease_action: { labelKey: 'activity.types.lease', icon: 'lease', color: 'var(--success)' }
};

const statusLabelKeys: Record<ActivityStatus, string> = {
  success: 'status.success',
  pending: 'status.pending',
  failed: 'status.failed'
};

function formatDateTime(timestamp: string, locale: string) {
  return new Date(timestamp).toLocaleString(locale || 'en-ZA', {
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

function getActivityTypeName(type: ActivityItem['type'], translate: (key: string) => string) {
  return translate(activityTypeConfig[type].labelKey);
}

function getStatusLabel(status: ActivityStatus | undefined, translate: (key: string) => string) {
  if (!status) {
    return translate('activity.status.unknown') || 'N/A';
  }
  const key = statusLabelKeys[status];
  return key ? translate(key) : status.toUpperCase();
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

function formatDetailLines(details: Record<string, unknown> | undefined, translate: (key: string) => string): string[] {
  if (!details || Object.keys(details).length === 0) {
    return [];
  }
  const heading = translate('activity.pdf.detailsHeading') || 'Details:';
  const itemTemplate = translate('activity.pdf.detailsItem') || '  - {key}: {value}';
  const lines = [heading];
  for (const [key, value] of Object.entries(details)) {
    lines.push(
      itemTemplate
        .replace('{key}', formatDetailKey(key))
        .replace('{value}', formatDetailValue(value))
    );
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

function createPdfBlobFromActivities(
  activities: ActivityItem[],
  translate: (key: string) => string,
  locale: string
): Blob {
  const now = new Date();
  const headerTimestamp = now.toLocaleString(locale || 'en-ZA', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  const lines: string[] = [];
  lines.push(translate('activity.pdf.title') || 'Tenant Activity Log');
  lines.push((translate('activity.pdf.generated') || 'Generated: {timestamp}').replace('{timestamp}', headerTimestamp));
  lines.push((translate('activity.pdf.total') || 'Total Activities: {count}').replace('{count}', activities.length.toString()));
  lines.push('');

  if (activities.length === 0) {
    lines.push(translate('activity.pdf.none') || 'No activity records available.');
  } else {
    activities.forEach((activity, index) => {
      const entryLine = (translate('activity.pdf.entry') || '{index}. {timestamp} - {title}')
        .replace('{index}', (index + 1).toString())
        .replace('{timestamp}', formatDateTime(activity.timestamp, locale))
        .replace('{title}', activity.title);
      lines.push(entryLine);
      const typeStatusLine = (translate('activity.pdf.typeStatus') || 'Type: {type} | Status: {status}')
        .replace('{type}', translate(activityTypeConfig[activity.type].labelKey))
        .replace('{status}', getStatusLabel(activity.status, translate));
      lines.push(typeStatusLine);
      lines.push((translate('activity.pdf.description') || 'Description: {description}')
        .replace('{description}', activity.description));
      const detailLines = formatDetailLines(activity.details, translate);
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

const defaultActivityTemplates: ActivityTemplate[] = [
  {
    id: '1',
    type: 'login',
    titleKey: 'activity.sample.login.title',
    descriptionKey: 'activity.sample.login.description',
    timestamp: '2024-09-16T09:15:00Z',
    status: 'success',
    details: { device: 'Mobile App', location: 'Johannesburg' }
  },
  {
    id: '2',
    type: 'payment',
    titleKey: 'activity.sample.payment.title',
    descriptionKey: 'activity.sample.payment.description',
    timestamp: '2024-09-01T08:30:00Z',
    status: 'success',
    details: { amount: 12500, method: 'bank_transfer', reference: 'RENT-SEP-2024' }
  },
  {
    id: '3',
    type: 'maintenance_request',
    titleKey: 'activity.sample.maintenance.title',
    descriptionKey: 'activity.sample.maintenance.description',
    timestamp: '2024-08-28T14:20:00Z',
    status: 'pending',
    details: { category: 'plumbing', priority: 'medium', request_id: 'MAINT-2024-0828' }
  },
  {
    id: '4',
    type: 'profile_update',
    titleKey: 'activity.sample.profile.title',
    descriptionKey: 'activity.sample.profile.description',
    timestamp: '2024-08-25T11:45:00Z',
    status: 'success',
    details: { fields_updated: ['emergency_contact'] }
  },
  {
    id: '5',
    type: 'document_upload',
    titleKey: 'activity.sample.document.title',
    descriptionKey: 'activity.sample.document.description',
    timestamp: '2024-08-20T16:30:00Z',
    status: 'success',
    details: { document_type: 'lease', file_size: '2.4 MB' }
  },
  {
    id: '6',
    type: 'lease_action',
    titleKey: 'activity.sample.lease.title',
    descriptionKey: 'activity.sample.lease.description',
    timestamp: '2024-08-15T10:00:00Z',
    status: 'success',
    details: { renewal_period: '12 months', new_monthly_rent: 13000 }
  }
];

function buildDefaultActivities(translate: (key: string) => string): ActivityItem[] {
  return defaultActivityTemplates.map(({ titleKey, descriptionKey, ...rest }) => ({
    ...rest,
    title: translate(titleKey),
    description: translate(descriptionKey)
  }));
}

function ActivityLog() {
  const { t, language } = useLanguage();
  const locale = language === 'zu' ? 'zu-ZA' : 'en-ZA';
  const activities = useMemo(() => buildDefaultActivities(t), [t]);
  const [filter, setFilter] = useState<ActivityFilterKey>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [exporting, setExporting] = useState(false);

  const filterOptions = useMemo(() => {
    const options: Array<{ key: ActivityFilterKey; label: string }> = [
      { key: 'all', label: t('activity.filters.all') || 'All' }
    ];
    for (const [key, value] of Object.entries(activityTypeConfig)) {
      const typedKey = key as ActivityItem['type'];
      options.push({ key: typedKey, label: t(value.labelKey) });
    }
    return options;
  }, [t]);

  const searchPlaceholder = t('activity.searchPlaceholder') || 'Search activities';
  const searchAriaLabel = t('activity.searchAria') || searchPlaceholder;
  const exportButtonLabel = t('activity.exportPdf') || 'Export PDF';
  const exportingLabel = t('activity.exporting') || 'Exporting...';
  const emptyStateTitle = t('activity.emptyTitle') || 'No activities found';
  const clearSearchLabel = t('activity.clearSearch') || 'Clear search';
  const detailsLabel = t('activity.detailsButton') || 'Details';
  const modalHeading = t('activity.modal.heading') || 'Activity Details';
  const typeLabel = t('activity.modal.typeLabel') || 'Type';
  const titleLabel = t('activity.modal.titleLabel') || 'Title';
  const descriptionLabel = t('activity.modal.descriptionLabel') || 'Description';
  const timestampLabel = t('activity.modal.timestampLabel') || 'Timestamp';
  const statusLabel = t('activity.modal.statusLabel') || 'Status';
  const additionalDetailsLabel = t('activity.modal.additionalDetailsLabel') || 'Additional Details';
  const closeLabel = t('common.close') || 'Close';

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
      const blob = createPdfBlobFromActivities(activities, t, locale);
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
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            aria-label={searchAriaLabel}
          />
          <button
            type="button"
            className="button button-md button-primary activity-export-button"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? exportingLabel : exportButtonLabel}
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
            <p>{emptyStateTitle}</p>
            {searchTerm && (
              <button
                type="button"
                className="button button-sm button-secondary"
                onClick={() => setSearchTerm('')}
              >
                {clearSearchLabel}
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
                        {getStatusLabel(activity.status, t)}
                      </span>
                    )}
                  </div>
                  <p className="activity-item-description">{activity.description}</p>
                  <div className="activity-item-meta">
                    <span>{getActivityTypeName(activity.type, t)}</span>
                    <span className="activity-item-meta-separator" aria-hidden="true">•</span>
                    <span>{formatDateTime(activity.timestamp, locale)}</span>
                  </div>
                </div>
                <div className="activity-item-actions">
                  <button
                    type="button"
                    className="button button-sm button-secondary activity-details-button"
                    onClick={() => setSelectedActivity(activity)}
                  >
                    {detailsLabel}
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
              <h3>{modalHeading}</h3>
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
                  <label>{`${typeLabel}:`}</label>
                  <span>{getActivityTypeName(selectedActivity.type, t)}</span>
                </div>
                <div className="detail-row">
                  <label>{`${titleLabel}:`}</label>
                  <span>{selectedActivity.title}</span>
                </div>
                <div className="detail-row">
                  <label>{`${descriptionLabel}:`}</label>
                  <span>{selectedActivity.description}</span>
                </div>
                <div className="detail-row">
                  <label>{`${timestampLabel}:`}</label>
                  <span>{formatDateTime(selectedActivity.timestamp, locale)}</span>
                </div>
                {selectedActivity.status && (
                  <div className="detail-row">
                    <label>{`${statusLabel}:`}</label>
                    <span className={`status-badge ${getStatusColor(selectedActivity.status)}`}>
                      {getStatusLabel(selectedActivity.status, t)}
                    </span>
                  </div>
                )}
                {selectedActivity.details && (
                  <div className="detail-row">
                    <label>{`${additionalDetailsLabel}:`}</label>
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
                  {closeLabel}
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
