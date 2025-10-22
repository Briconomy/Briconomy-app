import { useEffect, useMemo, useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import SearchFilter from '../components/SearchFilter.tsx';
import DataTable from '../components/DataTable.tsx';
import ActionCard from '../components/ActionCard.tsx';
import Icon from '../components/Icon.tsx';
import { invoiceService, Invoice } from '../services/invoices.ts';
import { notificationService } from '../services/notifications.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

function ManagerInvoicesPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const navItems = [
    { path: '/manager', label: t('nav.dashboard'), icon: 'performanceAnalytics' },
    { path: '/manager/properties', label: t('nav.properties'), icon: 'properties' },
    { path: '/manager/leases', label: t('nav.leases'), icon: 'lease' },
    { path: '/manager/payments', label: t('nav.payments'), icon: 'payment' }
  ];

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const filters: Record<string, string> = {};
      if (user?.id) {
        filters.managerId = user.id;
      }
      const data = await invoiceService.listInvoices(filters);
      setInvoices(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user?.id]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (_key: string, value: string) => {
    setStatusFilter(value);
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
      const normalizedSearch = searchTerm.trim().toLowerCase();
      const matchesSearch = !normalizedSearch || [
        invoice.invoiceNumber,
        invoice.tenantName,
        invoice.propertyName,
        invoice.propertyAddress
      ]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(normalizedSearch));
      return matchesStatus && matchesSearch;
    });
  }, [invoices, searchTerm, statusFilter]);

  const totalPending = invoices.filter((invoice) => invoice.status === 'pending').length;
  const totalPaid = invoices.filter((invoice) => invoice.status === 'paid').length;
  const totalOverdue = invoices.filter((invoice) => invoice.status === 'overdue').length;

  const handleGenerateMonthlyInvoices = async () => {
    try {
      setLoading(true);
      const generated = await invoiceService.generateMonthlyInvoicesForAllTenants(user?.id);
      for (const invoice of generated) {
        if (invoice.tenantName && invoice.amount && invoice.dueDate) {
          await notificationService.sendRentReminder(invoice.tenantName, invoice.amount, invoice.dueDate);
        }
      }
      await fetchInvoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessOverdue = async () => {
    try {
      setLoading(true);
      const overdue = await invoiceService.processOverdueInvoices(user?.id);
      const now = new Date();
      for (const invoice of overdue) {
        const dueDate = new Date(invoice.dueDate);
        const diff = Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
        const overdueDays = typeof invoice.overdueDays === 'number' ? invoice.overdueDays : diff;
        await notificationService.sendOverdueAlert(invoice.tenantName, overdueDays, invoice.amount);
      }
      await fetchInvoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process overdue invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (invoice: Invoice) => {
    try {
      setLoading(true);
      const updated = await invoiceService.updateInvoiceStatus(invoice, 'paid');
      if (updated) {
        await notificationService.sendPaymentConfirmation(updated.amount, 'Manual Entry');
      }
      await fetchInvoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark invoice as paid');
    } finally {
      setLoading(false);
    }
  };

  const handleViewPdf = async (invoice: Invoice) => {
    try {
      const download = await invoiceService.downloadInvoicePdf(invoice);
      const url = URL.createObjectURL(download.blob);
      globalThis.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open invoice PDF');
    }
  };

  const handleDownloadMarkdown = async (invoice: Invoice) => {
    try {
      const download = await invoiceService.downloadInvoiceMarkdown(invoice);
      const blob = new Blob([download.content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = download.filename;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download invoice markdown');
    }
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);

  const tableData = useMemo(() => (
    filteredInvoices.map((invoice) => ({
      ...invoice,
      id: invoice.id || invoice._id || invoice.invoiceNumber,
      actions: null
    }))
  ), [filteredInvoices]);

  const tableColumns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice'
    },
    {
      key: 'tenantName',
      label: 'Tenant'
    },
    {
      key: 'propertyName',
      label: 'Property',
      render: (_value: string | undefined, row: Invoice) => row.propertyName || row.propertyAddress || '-'
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (value: number) => formatCurrency(value)
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string) => (
        <span className={`status-badge ${value}`}>
          {value.toUpperCase()}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_value: unknown, row: Invoice) => (
        <div className="table-actions-inline">
          <button type="button" onClick={() => handleViewPdf(row)} disabled={loading}>
            View PDF
          </button>
          <button type="button" onClick={() => handleDownloadMarkdown(row)} disabled={loading}>
            Download Markdown
          </button>
          {row.status !== 'paid' && (
            <button type="button" onClick={() => handleMarkPaid(row)} disabled={loading}>
              Mark Paid
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton showLogout />
      <div className="main-content">
        <div className="page-header">
          <div className="page-title-wrapper">
            <div className="page-title">Invoice Management</div>
          </div>
          <div className="page-subtitle">Generate and track tenant rent invoices</div>
          {error && (
            <div className="offline-indicator">
              <span>{error}</span>
            </div>
          )}
        </div>

        <div className="dashboard-grid">
          <StatCard value={invoices.length.toString()} label="Total" />
          <StatCard value={totalPending.toString()} label="Pending" />
          <StatCard value={totalPaid.toString()} label="Paid" />
          <StatCard value={totalOverdue.toString()} label="Overdue" />
        </div>

        <div className="quick-actions">
          <ActionCard
            onClick={handleGenerateMonthlyInvoices}
            icon={<Icon name="invoice" alt="Generate invoices" />}
            title="Generate Monthly"
            description="Create invoices for active leases"
          />
          <ActionCard
            onClick={handleProcessOverdue}
            icon={<Icon name="alert" alt="Process overdue" />}
            title="Process Overdue"
            description="Update statuses and notify tenants"
          />
          <ActionCard
            onClick={fetchInvoices}
            icon={<Icon name="refresh" alt="Refresh invoices" />}
            title="Refresh"
            description="Load the latest invoice data"
          />
        </div>

        <SearchFilter
          placeholder="Search invoices"
          onSearch={handleSearch}
          filters={[{
            key: 'status',
            value: statusFilter,
            options: [
              { value: 'all', label: 'All Statuses' },
              { value: 'pending', label: 'Pending' },
              { value: 'paid', label: 'Paid' },
              { value: 'overdue', label: 'Overdue' }
            ]
          }]}
          onFilterChange={handleFilterChange}
        />

        <DataTable
          title="Invoices"
          data={tableData}
          columns={tableColumns}
          actions={null}
          onRowClick={undefined}
        />
      </div>

      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default ManagerInvoicesPage;
