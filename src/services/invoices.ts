export interface Invoice {
  id?: string;
  _id?: string;
  invoiceNumber: string;
  tenantId?: string;
  tenantName: string;
  propertyId?: string;
  propertyName?: string;
  propertyAddress?: string;
  managerId?: string;
  leaseId?: string;
  amount: number;
  dueDate: string;
  issueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  description?: string;
  month: string;
  year: number;
  artifactUrls?: {
    pdf: string;
    markdown: string;
  };
  overdueDays?: number;
}

interface InvoiceDownload {
  blob: Blob;
  filename: string;
}

interface InvoiceMarkdownDownload {
  content: string;
  filename: string;
}

export class InvoiceService {
  private static instance: InvoiceService;

  static getInstance(): InvoiceService {
    if (!InvoiceService.instance) {
      InvoiceService.instance = new InvoiceService();
    }
    return InvoiceService.instance;
  }

  private resolveInvoiceId(invoice: Invoice | string): string {
    if (typeof invoice === 'string') {
      return invoice;
    }
    return invoice.id || invoice.invoiceNumber;
  }

  private buildQuery(params: Record<string, string | undefined>): string {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        searchParams.append(key, value);
      }
    }
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  private extractFilename(header: string | null): string {
    if (!header) {
      return 'invoice';
    }
    const match = /filename="?([^";]+)"?/i.exec(header);
    if (match && match[1]) {
      return match[1];
    }
    return 'invoice';
  }

  async listInvoices(params: Record<string, string> = {}): Promise<Invoice[]> {
    const response = await fetch(`/api/invoices${this.buildQuery(params)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch invoices');
    }
    return response.json();
  }

  getInvoicesForTenant(tenantId: string): Promise<Invoice[]> {
    return this.listInvoices({ tenantId });
  }

  async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    const response = await fetch(`/api/invoices/${invoiceId}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error('Failed to fetch invoice');
    }
    return response.json();
  }

  async generateMonthlyInvoicesForAllTenants(managerId?: string): Promise<Invoice[]> {
    const response = await fetch('/api/invoices/generate-monthly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(managerId ? { managerId } : {})
    });
    if (!response.ok) {
      throw new Error('Failed to generate invoices');
    }
    return response.json();
  }

  async updateInvoiceStatus(invoice: Invoice | string, status: 'pending' | 'paid' | 'overdue'): Promise<Invoice | null> {
    const invoiceId = this.resolveInvoiceId(invoice);
    const response = await fetch(`/api/invoices/${invoiceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!response.ok) {
      throw new Error('Failed to update invoice status');
    }
    return response.json();
  }

  async processOverdueInvoices(managerId?: string): Promise<Invoice[]> {
    const response = await fetch('/api/invoices/process-overdue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(managerId ? { managerId } : {})
    });
    if (!response.ok) {
      throw new Error('Failed to process overdue invoices');
    }
    return response.json();
  }

  async downloadInvoicePdf(invoice: Invoice | string): Promise<InvoiceDownload> {
    const invoiceId = this.resolveInvoiceId(invoice);
    const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
    if (!response.ok) {
      throw new Error('Failed to download invoice PDF');
    }
    const blob = await response.blob();
    const filename = this.extractFilename(response.headers.get('content-disposition'));
    return { blob, filename };
  }

  async downloadInvoiceMarkdown(invoice: Invoice | string): Promise<InvoiceMarkdownDownload> {
    const invoiceId = this.resolveInvoiceId(invoice);
    const response = await fetch(`/api/invoices/${invoiceId}/markdown`);
    if (!response.ok) {
      throw new Error('Failed to download invoice markdown');
    }
    const content = await response.text();
    const filename = this.extractFilename(response.headers.get('content-disposition'));
    return { content, filename };
  }
}

export const invoiceService = InvoiceService.getInstance();