import React from 'react';
import { exportService, ExportColumn } from '../utils/export-utils.ts';

interface ExportButtonProps {
  data: Record<string, unknown>[];
  columns: ExportColumn[];
  filename: string;
  title?: string;
  format?: 'csv' | 'pdf' | 'both';
  disabled?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  columns,
  filename,
  title,
  format = 'both',
  disabled = false
}) => {
  const handleExport = (exportFormat: 'csv' | 'pdf') => {
    if (disabled || !data || data.length === 0) {
      alert('No data available to export');
      return;
    }

    try {
      if (exportFormat === 'csv') {
        exportService.exportToCSV(data, columns, filename);
      } else {
        exportService.exportToPDF(data, columns, title || filename, filename);
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  if (format === 'both') {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => handleExport('csv')}
          disabled={disabled}
          style={{
            padding: '8px 16px',
            background: disabled ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: disabled ? 0.6 : 1
          }}
          title="Export to CSV"
        >
          <span>📊</span>
          <span>Export CSV</span>
        </button>
        
        <button
          type="button"
          onClick={() => handleExport('pdf')}
          disabled={disabled}
          style={{
            padding: '8px 16px',
            background: disabled ? '#ccc' : '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: disabled ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            opacity: disabled ? 0.6 : 1
          }}
          title="Export to PDF"
        >
          <span>📄</span>
          <span>Export PDF</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => handleExport(format as 'csv' | 'pdf')}
      disabled={disabled}
      style={{
        padding: '8px 16px',
        background: disabled ? '#ccc' : format === 'csv' ? '#28a745' : '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        opacity: disabled ? 0.6 : 1
      }}
      title={`Export to ${format.toUpperCase()}`}
    >
      <span>{format === 'csv' ? '📊' : '📄'}</span>
      <span>Export {format.toUpperCase()}</span>
    </button>
  );
};

export default ExportButton;
