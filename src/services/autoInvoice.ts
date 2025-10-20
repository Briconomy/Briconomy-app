import { invoiceService } from './invoices.ts';
import { notificationService } from './notifications.ts';
import { schedulerService, ScheduledTask } from './scheduler.ts';

export interface AutoInvoiceConfig {
  enabled: boolean;
  generateDay: number; // Day of month (1-31)
  reminderDaysBefore: number[]; // Days before due date to send reminders
  overdueCheckDays: number[]; // Days after due date to check for overdue
  managerEscalationDays: number; // Days after which to escalate to manager
}

export class AutoInvoiceService {
  private static instance: AutoInvoiceService;
  private config: AutoInvoiceConfig = {
    enabled: true,
    generateDay: 1, // Generate on 1st of each month
    reminderDaysBefore: [7, 3, 1], // Remind 7, 3, and 1 days before due
    overdueCheckDays: [1, 3, 7, 14], // Check overdue at these intervals
    managerEscalationDays: 14 // Escalate to manager after 14 days
  };

  static getInstance(): AutoInvoiceService {
    if (!AutoInvoiceService.instance) {
      AutoInvoiceService.instance = new AutoInvoiceService();
    }
    return AutoInvoiceService.instance;
  }

  // Initialize automated invoice generation
  initialize(): void {
    console.log('🤖 Initializing automated invoice service...');
    
    // Schedule monthly invoice generation
    const monthlyInvoiceTask: ScheduledTask = {
      id: 'monthly-invoice-generation',
      name: 'Monthly Invoice Generation',
      schedule: '@monthly',
      isActive: this.config.enabled,
      taskFunction: () => this.generateMonthlyInvoices()
    };

    // Schedule daily overdue check
    const overdueCheckTask: ScheduledTask = {
      id: 'daily-overdue-check',
      name: 'Daily Overdue Payment Check',
      schedule: '@daily',
      isActive: this.config.enabled,
      taskFunction: () => this.checkOverduePayments()
    };

    // Schedule daily reminder check
    const reminderTask: ScheduledTask = {
      id: 'daily-reminder-check',
      name: 'Daily Payment Reminder Check',
      schedule: '@daily',
      isActive: this.config.enabled,
      taskFunction: () => this.sendPaymentReminders()
    };

    // Add tasks to scheduler
    schedulerService.addTask(monthlyInvoiceTask);
    schedulerService.addTask(overdueCheckTask);
    schedulerService.addTask(reminderTask);

    console.log('✅ Automated invoice service initialized');
  }

  // Generate monthly invoices automatically
  private async generateMonthlyInvoices(): Promise<void> {
    try {
      console.log('📄 Starting automated monthly invoice generation...');
      
      // Check if today is the configured generation day
      const today = new Date();
      const currentDay = today.getDate();
      
      if (currentDay !== this.config.generateDay) {
        console.log(`⏭️ Skipping invoice generation - not the configured day (${this.config.generateDay})`);
        return;
      }

      // Generate invoices for all tenants with automatic JSON export
      const generatedInvoices = await invoiceService.generateMonthlyInvoicesWithJSON();
      
      if (generatedInvoices.length === 0) {
        console.log('ℹ️ No invoices generated - no active leases found');
        return;
      }

      // Send notifications to tenants
      for (const invoice of generatedInvoices) {
        try {
          await notificationService.sendRentReminder(
            invoice.tenantName, 
            invoice.amount, 
            invoice.dueDate
          );
        } catch (error) {
          console.error(`Failed to send notification to ${invoice.tenantName}:`, error);
        }
      }

      // Log success
      console.log(`✅ Successfully generated ${generatedInvoices.length} invoices`);
      
      // Send notification to managers
      await this.notifyManagers(`Monthly invoice generation completed. ${generatedInvoices.length} invoices created.`);
      
    } catch (error) {
      console.error('❌ Error in automated invoice generation:', error);
      await this.notifyManagers(`Error in monthly invoice generation: ${error.message}`);
    }
  }

  // Check for overdue payments and send notifications
  private async checkOverduePayments(): Promise<void> {
    try {
      console.log('🔍 Checking for overdue payments...');
      
      // Process overdue invoices
      const overdueInvoices = await invoiceService.processOverdueInvoices();
      
      if (overdueInvoices.length === 0) {
        console.log('✅ No overdue payments found');
        return;
      }

      let escalatedCount = 0;
      
      // Send overdue notifications and check for escalation
      for (const invoice of overdueInvoices) {
        const daysPastDue = Math.floor(
          (new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Send overdue alert to tenant
        await notificationService.sendOverdueAlert(
          invoice.tenantName,
          daysPastDue,
          invoice.amount
        );

        // Check if escalation to manager is needed
        if (daysPastDue >= this.config.managerEscalationDays) {
          await this.escalateToManager(invoice, daysPastDue);
          escalatedCount++;
        }
      }

      console.log(`📨 Processed ${overdueInvoices.length} overdue payments, ${escalatedCount} escalated to managers`);
      
    } catch (error) {
      console.error('❌ Error checking overdue payments:', error);
    }
  }

  // Send payment reminders based on configuration
  private async sendPaymentReminders(): Promise<void> {
    try {
      console.log('📅 Checking for payment reminders...');
      
      // Get pending invoices
      const response = await fetch('/api/invoices?status=pending');
      if (!response.ok) return;
      
      const pendingInvoices = await response.json();
      let remindersSent = 0;

      for (const invoice of pendingInvoices) {
        const dueDate = new Date(invoice.dueDate);
        const today = new Date();
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Check if we should send a reminder today
        if (this.config.reminderDaysBefore.includes(daysUntilDue)) {
          await notificationService.sendRentReminder(
            invoice.tenantName,
            invoice.amount,
            invoice.dueDate
          );
          remindersSent++;
        }
      }

      if (remindersSent > 0) {
        console.log(`📨 Sent ${remindersSent} payment reminders`);
      }
      
    } catch (error) {
      console.error('❌ Error sending payment reminders:', error);
    }
  }

  // Escalate overdue payment to manager
  private async escalateToManager(invoice: { tenantName: string; amount: number; _id?: string }, daysPastDue: number): Promise<void> {
    try {
      const escalationMessage = `ESCALATION: ${invoice.tenantName} payment overdue by ${daysPastDue} days. Amount: R${invoice.amount}. Immediate action required.`;
      
      await notificationService.sendEscalation('Payment Overdue', escalationMessage);
      
      console.log(`⚠️ Escalated to manager: ${invoice.tenantName} - ${daysPastDue} days overdue`);
      
    } catch (error) {
      console.error(`Failed to escalate payment for ${invoice.tenantName}:`, error);
    }
  }

  // Send notification to all managers
  private async notifyManagers(message: string): Promise<void> {
    try {
      // Get all manager users
      const response = await fetch('/api/users?role=manager');
      if (!response.ok) return;
      
      const managers = await response.json();
      
      // Send notification to each manager
      for (const manager of managers) {
        await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: manager._id,
            title: 'Automated Invoice System',
            message: message,
            type: 'system',
            read: false
          })
        });
      }
      
    } catch (error) {
      console.error('Failed to notify managers:', error);
    }
  }

  // Get current configuration
  getConfig(): AutoInvoiceConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(newConfig: Partial<AutoInvoiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update task active status if enabled status changed
    if (newConfig.enabled !== undefined) {
      const tasks = ['monthly-invoice-generation', 'daily-overdue-check', 'daily-reminder-check'];
      tasks.forEach(taskId => {
        const task = schedulerService.getTask(taskId);
        if (task && task.isActive !== newConfig.enabled) {
          schedulerService.toggleTask(taskId);
        }
      });
    }
    
    console.log('⚙️ Auto-invoice configuration updated:', this.config);
  }

  // Manual trigger for testing
  async manualTrigger(taskType: 'invoices' | 'overdue' | 'reminders'): Promise<void> {
    console.log(`🔧 Manual trigger: ${taskType}`);
    
    switch (taskType) {
      case 'invoices':
        await this.generateMonthlyInvoices();
        break;
      case 'overdue':
        await this.checkOverduePayments();
        break;
      case 'reminders':
        await this.sendPaymentReminders();
        break;
    }
  }

  // Get status of automation
  getStatus(): { 
    enabled: boolean; 
    tasks: { id: string; name: string; isActive: boolean; lastRun?: Date }[] 
  } {
    const tasks = schedulerService.getTasks()
      .filter(task => ['monthly-invoice-generation', 'daily-overdue-check', 'daily-reminder-check'].includes(task.id))
      .map(task => ({
        id: task.id,
        name: task.name,
        isActive: task.isActive,
        lastRun: task.lastRun
      }));

    return {
      enabled: this.config.enabled,
      tasks
    };
  }
}

export const autoInvoiceService = AutoInvoiceService.getInstance();