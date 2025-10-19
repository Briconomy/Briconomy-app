export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private permissionStatus: NotificationPermission | null = null;
  private permissionRequest?: Promise<NotificationPermission>;
  private readonly defaultIcon = '/favicon.ico';
  private readonly autoCloseMs = 5000;
  private readonly currencyFormat = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR'
  });
  private readonly loggedWarnings = new Set<string>();

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private isNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  private warnOnce(key: string, message: string, detail?: unknown): void {
    if (this.loggedWarnings.has(key)) {
      return;
    }

    this.loggedWarnings.add(key);

    if (detail !== undefined) {
      console.warn(message, detail);
      return;
    }

    console.warn(message);
  }

  private buildOptions(data: NotificationData): NotificationOptions {
    return {
      body: data.body,
      icon: data.icon ?? this.defaultIcon,
      tag: data.tag,
      data: data.data,
      requireInteraction: data.requireInteraction
    };
  }

  private async displayNotification(data: NotificationData): Promise<void> {
    const options = this.buildOptions(data);

    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(data.title, options);
        return;
      } catch (error) {
        this.warnOnce('service-worker-notification-failure', 'Service worker notification failed', error);
      }
    }

    const notification = new Notification(data.title, options);

    if (options.requireInteraction !== true) {
      setTimeout(() => {
        notification.close();
      }, this.autoCloseMs);
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isNotificationSupported()) {
      this.permissionStatus = 'denied';
      this.warnOnce('notification-unsupported', 'This browser does not support notifications');
      return 'denied';
    }

    if (this.permissionStatus) {
      return this.permissionStatus;
    }

    if (!this.permissionRequest) {
      this.permissionRequest = Notification.requestPermission().then(permission => {
        this.permissionStatus = permission;
        this.permissionRequest = undefined;
        return permission;
      });
    }

    return await this.permissionRequest;
  }

  async showNotification(data: NotificationData): Promise<void> {
    const permission = await this.requestPermission();

    if (permission !== 'granted') {
      this.warnOnce('notification-permission-denied', 'Notification permission not granted');
      return;
    }

    await this.displayNotification(data);
  }

  private formatCurrency(amount: number): string {
    return this.currencyFormat.format(amount);
  }

  // Specific notification types
  async sendRentReminder(tenantName: string, amount: number, dueDate: string): Promise<void> {
    await this.showNotification({
      title: 'Rent Reminder',
      body: `Hi ${tenantName}! Your rent of ${this.formatCurrency(amount)} is due on ${dueDate}`,
      tag: 'rent-reminder',
      data: { type: 'rent-reminder', dueDate, amount }
    });
  }

  async sendMaintenanceUpdate(requestId: string, status: string, message?: string): Promise<void> {
    await this.showNotification({
      title: 'Maintenance Update',
      body: message || `Your maintenance request #${requestId} status: ${status}`,
      tag: `maintenance-${requestId}`,
      data: { type: 'maintenance-update', requestId, status }
    });
  }

  async sendEscalation(type: string, details: string): Promise<void> {
    await this.showNotification({
      title: 'Escalation Alert',
      body: `${type}: ${details}`,
      tag: 'escalation',
      data: { type: 'escalation', escalationType: type, details }
    });
  }

  async sendAnnouncement(title: string, message: string): Promise<void> {
    await this.showNotification({
      title,
      body: message,
      tag: 'announcement',
      data: { type: 'announcement', title, message }
    });
  }

  async sendTaskAssignment(caretakerName: string, taskDescription: string): Promise<void> {
    await this.showNotification({
      title: 'New Task Assigned',
      body: `Hi ${caretakerName}! New task: ${taskDescription}`,
      tag: 'task-assignment',
      data: { type: 'task-assignment', caretakerName, taskDescription }
    });
  }

  async sendPaymentConfirmation(amount: number, method: string): Promise<void> {
    await this.showNotification({
      title: 'Payment Received',
      body: `Payment of ${this.formatCurrency(amount)} via ${method} has been recorded`,
      tag: 'payment-confirmation',
      data: { type: 'payment-confirmation', amount, method }
    });
  }

  async sendOverdueAlert(tenantName: string, daysPastDue: number, amount: number): Promise<void> {
    await this.showNotification({
      title: 'Overdue Payment Alert',
      body: `${tenantName} is ${daysPastDue} days overdue. Amount: ${this.formatCurrency(amount)}`,
      tag: 'overdue-alert',
      data: { type: 'overdue-alert', tenantName, daysPastDue, amount }
    });
  }
}

export const notificationService = NotificationService.getInstance();