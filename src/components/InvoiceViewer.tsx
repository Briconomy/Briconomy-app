import { useState } from 'react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: string;
  description?: string;
  tenant?: { fullName: string };
  property?: { name: string; address: string };
}

interface InvoiceViewerProps {
  invoice: Invoice;
  onDownload?: (id: string, format: 'pdf' | 'markdown') => void;
  onPay?: (invoice: Invoice) => void;
  isLoading?: boolean;
}

function InvoiceViewer({ invoice, onDownload, onPay, isLoading }: InvoiceViewerProps) {
  const [expandedDetails, setExpandedDetails] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'status-paid';
      case 'overdue':
        return 'status-overdue';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-pending';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-ZA');
  };

  return (
    <div className="invoice-card" style={{
      background: 'var(--surface)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '16px',
      boxShadow: 'var(--shadow-sm)',
      border: '1px solid var(--border-primary)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px',
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-primary)'
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
            {invoice.invoiceNumber}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Issued: {formatDate(invoice.issueDate)}
          </div>
        </div>
        <span className={`status-badge ${getStatusColor(invoice.status)}`}>
          {invoice.status?.toUpperCase()}
        </span>
      </div>

      {/* Amount */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
          AMOUNT DUE
        </div>
        <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--primary)' }}>
          {formatCurrency(invoice.amount)}
        </div>
      </div>

      {/* Key Dates */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '16px',
        padding: '12px',
        background: 'var(--background)',
        borderRadius: '8px'
      }}>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            ISSUE DATE
          </div>
          <div style={{ fontSize: '14px', fontWeight: '500' }}>
            {formatDate(invoice.issueDate)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
            DUE DATE
          </div>
          <div style={{ fontSize: '14px', fontWeight: '500' }}>
            {formatDate(invoice.dueDate)}
          </div>
        </div>
      </div>

      {/* Details Toggle */}
      <div
        onClick={() => setExpandedDetails(!expandedDetails)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 0',
          color: 'var(--primary)',
          fontSize: '14px',
          fontWeight: '500'
        }}
      >
        <span>{expandedDetails ? '▼' : '▶'}</span>
        Details
      </div>

      {/* Expanded Details */}
      {expandedDetails && (
        <div style={{
          padding: '12px 0',
          borderTop: '1px solid var(--border-primary)',
          marginTop: '12px'
        }}>
          {invoice.property && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                PROPERTY
              </div>
              <div style={{ fontSize: '14px' }}>
                {invoice.property.name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {invoice.property.address}
              </div>
            </div>
          )}
          {invoice.tenant && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                TENANT
              </div>
              <div style={{ fontSize: '14px' }}>
                {invoice.tenant.fullName}
              </div>
            </div>
          )}
          {invoice.description && (
            <div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                DESCRIPTION
              </div>
              <div style={{ fontSize: '14px' }}>
                {invoice.description}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-primary)',
        flexWrap: 'wrap'
      }}>
        {invoice.status !== 'paid' && onPay && (
          <button
            type="button"
            onClick={() => onPay(invoice)}
            disabled={isLoading}
            className="btn btn-primary"
            style={{ flex: 1, minWidth: '100px', fontSize: '13px' }}
          >
            {isLoading ? '...' : 'Pay'}
          </button>
        )}
        <button
          type="button"
          onClick={() => onDownload?.(invoice.id, 'pdf')}
          disabled={isLoading}
          className="btn btn-secondary"
          style={{ flex: 1, minWidth: '80px', fontSize: '13px' }}
        >
          {isLoading ? '...' : 'PDF'}
        </button>
        <button
          type="button"
          onClick={() => onDownload?.(invoice.id, 'markdown')}
          disabled={isLoading}
          className="btn btn-secondary"
          style={{ flex: 1, minWidth: '80px', fontSize: '13px' }}
        >
          {isLoading ? '...' : 'Details'}
        </button>
      </div>
    </div>
  );
}

export default InvoiceViewer;