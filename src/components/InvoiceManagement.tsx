import React, { useState, useEffect } from 'react';
import { invoiceService, Invoice } from '../services/invoices.ts';
import { notificationService } from '../services/notifications.ts';

interface InvoiceManagementProps {
  onClose: () => void;
}

const InvoiceManagement: React.FC<InvoiceManagementProps> = ({ onClose }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invoices');
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const generateMonthlyInvoices = async () => {
    try {
      setLoading(true);
      const generatedInvoices = await invoiceService.generateMonthlyInvoicesForAllTenants();
      
      // Send notifications to tenants
      for (const invoice of generatedInvoices) {
        await notificationService.sendRentReminder(
          invoice.tenantName, 
          invoice.amount, 
          invoice.dueDate
        );
      }
      
      await fetchInvoices();
      alert(`Generated ${generatedInvoices.length} invoices successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate invoices');
    } finally {
      setLoading(false);
    }
  };

  const processOverdueInvoices = async () => {
    try {
      setLoading(true);
      const overdueInvoices = await invoiceService.processOverdueInvoices();
      
      // Send overdue notifications
      for (const invoice of overdueInvoices) {
        const daysPastDue = Math.floor((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
        await notificationService.sendOverdueAlert(
          invoice.tenantName,
          daysPastDue,
          invoice.amount
        );
      }
      
      await fetchInvoices();
      alert(`Processed ${overdueInvoices.length} overdue invoices`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process overdue invoices');
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (invoiceId: string) => {
    try {
      await invoiceService.updateInvoiceStatus(invoiceId, 'paid');
      await fetchInvoices();
      
      const invoice = invoices.find(inv => inv._id === invoiceId);
      if (invoice) {
        await notificationService.sendPaymentConfirmation(invoice.amount, 'Manual Entry');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update invoice');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
            <button 
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={generateMonthlyInvoices}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Generate Monthly Invoices
          </button>
          
          <button
            onClick={processOverdueInvoices}
            disabled={loading}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Process Overdue Invoices
          </button>
          
          <button
            onClick={fetchInvoices}
            disabled={loading}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Invoice Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Total Invoices</h3>
          <p className="text-3xl font-bold text-blue-600">{invoices.length}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {invoices.filter(inv => inv.status === 'pending').length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Paid</h3>
          <p className="text-3xl font-bold text-green-600">
            {invoices.filter(inv => inv.status === 'paid').length}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700">Overdue</h3>
          <p className="text-3xl font-bold text-red-600">
            {invoices.filter(inv => inv.status === 'overdue').length}
          </p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">All Invoices</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.tenantName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.propertyAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    R{invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {invoice.status === 'pending' && (
                      <button
                        onClick={() => markAsPaid(invoice._id!)}
                        className="text-green-600 hover:text-green-900 mr-3"
                      >
                        Mark Paid
                      </button>
                    )}
                    <button className="text-blue-600 hover:text-blue-900">
                      View PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceManagement;