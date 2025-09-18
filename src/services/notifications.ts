export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
}

export class NotificationService {
  private static instance: NotificationService;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  async showNotification(data: NotificationData): Promise<void> {
    const permission = await this.requestPermission();
    
    if (permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const notification = new Notification(data.title, {
      body: data.body,
      icon: data.icon || '/favicon.ico',
      tag: data.tag,
      data: data.data,
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  // Specific notification types
  async sendRentReminder(tenantName: string, amount: number, dueDate: string): Promise<void> {
    await this.showNotification({
      title: '💰 Rent Reminder',
      body: `Hi ${tenantName}! Your rent of R${amount} is due on ${dueDate}`,
      tag: 'rent-reminder',
      data: { type: 'rent-reminder', dueDate, amount }
    });
  }

  async sendMaintenanceUpdate(requestId: string, status: string, message?: string): Promise<void> {
    await this.showNotification({
      title: '🔧 Maintenance Update',
      body: message || `Your maintenance request #${requestId} status: ${status}`,
      tag: `maintenance-${requestId}`,
      data: { type: 'maintenance-update', requestId, status }
    });
  }

  async sendEscalation(type: string, details: string): Promise<void> {
    await this.showNotification({
      title: '⚠️ Escalation Alert',
      body: `${type}: ${details}`,
      tag: 'escalation',
      data: { type: 'escalation', escalationType: type, details }
    });
  }

  async sendAnnouncement(title: string, message: string): Promise<void> {
    await this.showNotification({
      title: `📢 ${title}`,
      body: message,
      tag: 'announcement',
      data: { type: 'announcement', title, message }
    });
  }

  async sendTaskAssignment(caretakerName: string, taskDescription: string): Promise<void> {
    await this.showNotification({
      title: '📋 New Task Assigned',
      body: `Hi ${caretakerName}! New task: ${taskDescription}`,
      tag: 'task-assignment',
      data: { type: 'task-assignment', caretakerName, taskDescription }
    });
  }

  async sendPaymentConfirmation(amount: number, method: string): Promise<void> {
    await this.showNotification({
      title: '✅ Payment Received',
      body: `Payment of R${amount} via ${method} has been recorded`,
      tag: 'payment-confirmation',
      data: { type: 'payment-confirmation', amount, method }
    });
  }

  async sendOverdueAlert(tenantName: string, daysPastDue: number, amount: number): Promise<void> {
    await this.showNotification({
      title: '🚨 Overdue Payment Alert',
      body: `${tenantName} is ${daysPastDue} days overdue. Amount: R${amount}`,
      tag: 'overdue-alert',
      data: { type: 'overdue-alert', tenantName, daysPastDue, amount }
    });
  }
}

export const notificationService = NotificationService.getInstance();