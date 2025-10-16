// Export Utilities for CSV and PDF generation

export interface ExportColumn {
  key: string;
  label: string;
  format?: (value: unknown) => string;
}

export class ExportService {
  private static instance: ExportService;

  static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  // Export data to CSV
  exportToCSV(data: Record<string, unknown>[], columns: ExportColumn[], filename: string): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Create CSV header
    const headers = columns.map(col => col.label).join(',');
    
    // Create CSV rows
    const rows = data.map(item => {
      return columns.map(col => {
        const value = item[col.key];
        const formattedValue = col.format ? col.format(value) : String(value ?? '');
        // Escape commas and quotes
        return `"${String(formattedValue).replace(/"/g, '""')}"`;
      }).join(',');
    });

    // Combine header and rows
    const csv = [headers, ...rows].join('\n');

    // Create and download blob
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    this.downloadBlob(blob, `${filename}.csv`);
  }

  // Export data to PDF (Simple text-based PDF)
  exportToPDF(data: Record<string, unknown>[], columns: ExportColumn[], title: string, filename: string): void {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    // Create a simple HTML table for PDF
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: white;
    }
    h1 {
      color: #162F1B;
      border-bottom: 2px solid #162F1B;
      padding-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th {
      background: #162F1B;
      color: white;
      padding: 12px;
      text-align: left;
      border: 1px solid #ddd;
    }
    td {
      padding: 10px;
      border: 1px solid #ddd;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>Generated on ${new Date().toLocaleString()}</p>
  <table>
    <thead>
      <tr>
        ${columns.map(col => `<th>${col.label}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      ${data.map(item => `
        <tr>
          ${columns.map(col => {
            const value = item[col.key];
            const formattedValue = col.format ? col.format(value) : String(value ?? '');
            return `<td>${this.escapeHtml(formattedValue)}</td>`;
          }).join('')}
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="footer">
    <p>© ${new Date().getFullYear()} Briconomy - Property Management System</p>
  </div>
</body>
</html>
    `;

    // Create blob and download
    const blob = new Blob([html], { type: 'text/html' });
    this.downloadBlob(blob, `${filename}.html`);
    
    // Open in new window for printing to PDF
    const printWindow = globalThis.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  }

  // Export table data (generic)
  exportTable(tableId: string, filename: string, format: 'csv' | 'pdf' = 'csv'): void {
    const table = document.getElementById(tableId) as HTMLTableElement;
    if (!table) {
      console.error(`Table with id "${tableId}" not found`);
      return;
    }

    const headers: string[] = [];
    const rows: string[][] = [];

    // Get headers
    const headerCells = table.querySelectorAll('thead th');
    headerCells.forEach(cell => {
      headers.push(cell.textContent?.trim() || '');
    });

    // Get rows
    const bodyRows = table.querySelectorAll('tbody tr');
    bodyRows.forEach(row => {
      const rowData: string[] = [];
      const cells = row.querySelectorAll('td');
      cells.forEach(cell => {
        rowData.push(cell.textContent?.trim() || '');
      });
      rows.push(rowData);
    });

    if (format === 'csv') {
      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      this.downloadBlob(blob, `${filename}.csv`);
    } else {
      // Simple PDF export
      const data = rows.map(row => {
        const obj: Record<string, unknown> = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });

      const columns: ExportColumn[] = headers.map(header => ({
        key: header,
        label: header
      }));

      this.exportToPDF(data, columns, filename, filename);
    }
  }

  // Download blob helper
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Escape HTML helper
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Format helpers
  static formatters = {
    date: (value: unknown): string => {
      if (!value) return '';
      try {
        return new Date(value as string).toLocaleDateString();
      } catch {
        return String(value);
      }
    },
    currency: (value: unknown): string => {
      if (value === null || value === undefined) return 'R0.00';
      return `R${Number(value).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    },
    status: (value: unknown): string => {
      return String(value || '').toUpperCase();
    },
    boolean: (value: unknown): string => {
      return value ? 'Yes' : 'No';
    }
  };
}

// Export singleton instance
export const exportService = ExportService.getInstance();
