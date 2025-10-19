// Export Utilities for CSV, PDF, and XLSX generation
import { createSimpleXLSX } from './simple-xlsx.ts';

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

  // Export data to XLSX (Excel format) - Use robust Simple Excel XML format
  async exportToXLSX(data: Record<string, unknown>[], columns: ExportColumn[], filename: string, sheetName = 'Report'): Promise<void> {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    console.log('Starting XLSX export...', { dataCount: data.length, columns: columns.length });

    // Use simple Excel XML format as primary method (more reliable)
    try {
      console.log('Using Simple Excel XML format (most reliable)');
      const simpleColumns = columns.map(col => ({ key: col.key, label: col.label }));
      const blob = createSimpleXLSX(data, simpleColumns, sheetName);
      this.downloadBlob(blob, `${filename}.xlsx`);
      console.log('XLSX export completed successfully using Simple Excel XML');
      return;
    } catch (xmlError) {
      console.error('Simple Excel XML export failed:', xmlError);
    }

    // Fallback: Try the full XLSX library (may have dependency issues)
    try {
      console.log('Trying full XLSX library as fallback...');
      const XLSX = await import('xlsx');
      console.log('XLSX library loaded successfully');
      
      const workbook = XLSX.utils.book_new();
      const worksheetData = data.map(item => {
        const row: Record<string, unknown> = {};
        columns.forEach(col => {
          const value = item[col.key];
          row[col.label] = col.format ? col.format(value) : value;
        });
        return row;
      });

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const colWidths = columns.map(col => ({ wch: Math.max(col.label.length, 15) }));
      worksheet['!cols'] = colWidths;
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      this.downloadBlob(blob, `${filename}.xlsx`);
      console.log('XLSX export completed using full XLSX library');
      return;
    } catch (xlsxError) {
      console.error('Full XLSX library also failed:', xlsxError);
    }

    // Final fallback: Excel-compatible TSV
    console.warn('Using final fallback: Excel-compatible TSV');
    const BOM = '\uFEFF';
    const headers = columns.map(col => col.label).join('\t');
    const rows = data.map(item => {
      return columns.map(col => {
        const value = item[col.key];
        const formattedValue = col.format ? col.format(value) : String(value ?? '');
        return String(formattedValue).replace(/"/g, '""');
      }).join('\t');
    });

    const tsvContent = BOM + [headers, ...rows].join('\r\n');
    const blob = new Blob([tsvContent], { 
      type: 'application/vnd.ms-excel;charset=utf-8' 
    });
    
    this.downloadBlob(blob, `${filename}.xls`);
    console.log('⚠️ Final fallback: Excel-compatible TSV file (.xls)');
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
      font-family: 'JetBrains Mono', monospace;
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
