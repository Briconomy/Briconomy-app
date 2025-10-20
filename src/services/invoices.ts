export interface Invoice {
  _id?: string;
  invoiceNumber: string;
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyAddress: string;
  amount: number;
  dueDate: string;
  issueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  description: string;
  month: string;
  year: number;
}

export interface InvoiceTemplate {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  logo?: string;
}

export class InvoiceService {
  private static instance: InvoiceService;

  static getInstance(): InvoiceService {
    if (!InvoiceService.instance) {
      InvoiceService.instance = new InvoiceService();
    }
    return InvoiceService.instance;
  }

  // Generate invoice number: YYYY-MM-DDHHMMSS
  private generateInvoiceNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    
    return `INV-${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  // Generate monthly rent invoice
  async generateMonthlyInvoice(
    tenantId: string,
    tenantName: string,
    propertyId: string,
    propertyAddress: string,
    rentAmount: number,
    month?: string,
    year?: number
  ): Promise<Invoice> {
    const now = new Date();
    const targetMonth = month || now.toLocaleString('default', { month: 'long' });
    const targetYear = year || now.getFullYear();
    
    // Due date is the 1st of next month
    const dueDate = new Date(targetYear, now.getMonth() + 1, 1);
    
    const invoice: Invoice = {
      invoiceNumber: this.generateInvoiceNumber(),
      tenantId,
      tenantName,
      propertyId,
      propertyAddress,
      amount: rentAmount,
      dueDate: dueDate.toISOString().split('T')[0],
      issueDate: now.toISOString().split('T')[0],
      status: 'pending',
      description: `Monthly rent for ${targetMonth} ${targetYear}`,
      month: targetMonth,
      year: targetYear
    };

    // Save to database
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice)
      });

      if (!response.ok) {
        throw new Error('Failed to create invoice');
      }

      const savedInvoice = await response.json();
      return savedInvoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  // Generate invoices for all active leases
  async generateMonthlyInvoicesForAllTenants(): Promise<Invoice[]> {
    try {
      // Get all active leases
      const leasesResponse = await fetch('/api/leases?status=active');
      if (!leasesResponse.ok) {
        throw new Error('Failed to fetch active leases');
      }
      
      const leases = await leasesResponse.json();
      const invoices: Invoice[] = [];

      for (const lease of leases) {
        try {
          const invoice = await this.generateMonthlyInvoice(
            lease.tenantId,
            lease.tenantName,
            lease.propertyId,
            lease.propertyAddress,
            lease.monthlyRent
          );
          invoices.push(invoice);
        } catch (error) {
          console.error(`Failed to generate invoice for tenant ${lease.tenantId}:`, error);
        }
      }

      return invoices;
    } catch (error) {
      console.error('Error generating monthly invoices:', error);
      throw error;
    }
  }

  // Get invoices for a specific tenant
  async getInvoicesForTenant(tenantId: string): Promise<Invoice[]> {
    try {
      const response = await fetch(`/api/invoices?tenantId=${tenantId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch invoices');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tenant invoices:', error);
      throw error;
    }
  }

  // Update invoice status
  async updateInvoiceStatus(invoiceId: string, status: 'pending' | 'paid' | 'overdue'): Promise<void> {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update invoice status');
      }
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  }

  // Check for overdue invoices and update status
  async processOverdueInvoices(): Promise<Invoice[]> {
    try {
      const response = await fetch('/api/invoices?status=pending');
      if (!response.ok) {
        throw new Error('Failed to fetch pending invoices');
      }

      const pendingInvoices = await response.json();
      const now = new Date();
      const overdueInvoices: Invoice[] = [];

      for (const invoice of pendingInvoices) {
        const dueDate = new Date(invoice.dueDate);
        if (dueDate < now) {
          await this.updateInvoiceStatus(invoice._id, 'overdue');
          invoice.status = 'overdue';
          overdueInvoices.push(invoice);
        }
      }

      return overdueInvoices;
    } catch (error) {
      console.error('Error processing overdue invoices:', error);
      throw error;
    }
  }

  // Generate PDF invoice (basic HTML to PDF)
  generateInvoicePDF(invoice: Invoice, template: InvoiceTemplate): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'JetBrains Mono', monospace; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .company-info { margin-bottom: 20px; }
          .invoice-details { margin-bottom: 20px; }
          .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
          .due-date { color: #dc2626; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background-color: #f3f4f6; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${template.companyName}</h1>
          <p>${template.companyAddress}</p>
          <p>Phone: ${template.companyPhone} | Email: ${template.companyEmail}</p>
        </div>
        
        <div class="invoice-details">
          <h2>INVOICE</h2>
          <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
          <p><strong>Issue Date:</strong> ${invoice.issueDate}</p>
          <p><strong>Due Date:</strong> <span class="due-date">${invoice.dueDate}</span></p>
        </div>
        
        <div class="tenant-info">
          <h3>Bill To:</h3>
          <p><strong>${invoice.tenantName}</strong></p>
          <p>${invoice.propertyAddress}</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Period</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${invoice.description}</td>
              <td>${invoice.month} ${invoice.year}</td>
              <td class="amount">R${invoice.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        <div style="margin-top: 30px; text-align: right;">
          <p><strong>Total Amount Due: <span class="amount">R${invoice.amount.toFixed(2)}</span></strong></p>
        </div>
        
        <div style="margin-top: 40px; font-size: 12px; color: #666;">
          <p>Please make payment by the due date to avoid late fees.</p>
          <p>Thank you for your business!</p>
        </div>
      </body>
      </html>
    `;
  }

  // Generate JSON export for invoices
  generateInvoicesJSON(invoices: Invoice[]): string {
    const exportData = {
      export_date: new Date().toISOString(),
      total_invoices: invoices.length,
      summary: {
        total_amount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
        pending_count: invoices.filter(inv => inv.status === 'pending').length,
        paid_count: invoices.filter(inv => inv.status === 'paid').length,
        overdue_count: invoices.filter(inv => inv.status === 'overdue').length
      },
      invoices: invoices.map(invoice => ({
        ...invoice,
        export_timestamp: new Date().toISOString()
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Automatically export invoices to JSON file
  async exportInvoicesToJSON(invoices: Invoice[], filename?: string): Promise<void> {
    try {
      const jsonData = this.generateInvoicesJSON(invoices);
      const defaultFilename = `invoices-${new Date().toISOString().split('T')[0]}.json`;
      
      // In a browser environment, trigger download
      if (typeof window !== 'undefined') {
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || defaultFilename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // In Deno environment, save to file
        await Deno.writeTextFile(filename || defaultFilename, jsonData);
        console.log(`📄 Invoices exported to JSON: ${filename || defaultFilename}`);
      }
    } catch (error) {
      console.error('Error exporting invoices to JSON:', error);
      throw error;
    }
  }

  // Generate monthly invoices and automatically export to JSON
  async generateMonthlyInvoicesWithJSON(): Promise<Invoice[]> {
    try {
      // Generate monthly invoices
      const invoices = await this.generateMonthlyInvoicesForAllTenants();
      
      if (invoices.length > 0) {
        // Automatically export to JSON
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `monthly-invoices-${timestamp}.json`;
        await this.exportInvoicesToJSON(invoices, filename);
        console.log(`🎉 Generated ${invoices.length} invoices and exported to ${filename}`);
      }
      
      return invoices;
    } catch (error) {
      console.error('Error generating monthly invoices with JSON export:', error);
      throw error;
    }
  }
}

export const invoiceService = InvoiceService.getInstance();