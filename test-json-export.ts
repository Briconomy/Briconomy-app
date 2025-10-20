// Simple demo of the new JSON export functionality
import { InvoiceService, Invoice } from './src/services/invoices.ts';

// Mock invoice data for demonstration
const sampleInvoices: Invoice[] = [
  {
    _id: "sample1",
    invoiceNumber: "INV-20251020123001",
    tenantId: "tenant1",
    tenantName: "John Doe",
    propertyId: "prop1",
    propertyAddress: "123 Main St, Apt 1",
    amount: 1500,
    dueDate: "2025-11-01",
    issueDate: "2025-10-20",
    status: "pending",
    description: "Monthly rent for November 2025",
    month: "November",
    year: 2025
  },
  {
    _id: "sample2",
    invoiceNumber: "INV-20251020123002",
    tenantId: "tenant2",
    tenantName: "Jane Smith",
    propertyId: "prop2",
    propertyAddress: "456 Oak Ave, Unit 2B",
    amount: 1200,
    dueDate: "2025-11-01",
    issueDate: "2025-10-20",
    status: "paid",
    description: "Monthly rent for November 2025",
    month: "November",
    year: 2025
  },
  {
    _id: "sample3",
    invoiceNumber: "INV-20251020123003",
    tenantId: "tenant3",
    tenantName: "Mike Johnson",
    propertyId: "prop3",
    propertyAddress: "789 Pine St, Suite 3C",
    amount: 1800,
    dueDate: "2025-10-15",
    issueDate: "2025-09-20",
    status: "overdue",
    description: "Monthly rent for October 2025",
    month: "October",
    year: 2025
  }
];

console.log("🚀 Testing JSON Export Functionality");
console.log("=====================================");

const invoiceService = InvoiceService.getInstance();

// Generate JSON export
const jsonExport = invoiceService.generateInvoicesJSON(sampleInvoices);

console.log("\n📄 Generated JSON Export:");
console.log(jsonExport);

// Save to file (for server environment)
await invoiceService.exportInvoicesToJSON(sampleInvoices, 'scripts/demo-invoices.json');

console.log("\n✅ JSON export functionality working!");
console.log("📁 File saved as: scripts/demo-invoices.json");