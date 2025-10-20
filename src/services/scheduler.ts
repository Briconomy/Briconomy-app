export interface ScheduledTask {
  id: string;
  name: string;
  schedule: string; // cron-like format
  lastRun?: Date;
  nextRun?: Date;
  isActive: boolean;
  taskFunction: () => Promise<void>;
}

export class SchedulerService {
  private static instance: SchedulerService;
  private tasks: Map<string, ScheduledTask> = new Map();
  private intervalIds: Map<string, number> = new Map();

  static getInstance(): SchedulerService {
    if (!SchedulerService.instance) {
      SchedulerService.instance = new SchedulerService();
    }
    return SchedulerService.instance;
  }

  // Add a scheduled task
  addTask(task: ScheduledTask): void {
    this.tasks.set(task.id, task);
    this.scheduleTask(task);
    console.log(`✅ Scheduled task "${task.name}" added`);
  }

  // Remove a scheduled task
  removeTask(taskId: string): void {
    const intervalId = this.intervalIds.get(taskId);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervalIds.delete(taskId);
    }
    this.tasks.delete(taskId);
    console.log(`🗑️ Task "${taskId}" removed`);
  }

  // Parse cron-like schedule and return milliseconds interval
  private parseSchedule(schedule: string): number {
    const schedules: Record<string, number> = {
      '@monthly': 30 * 24 * 60 * 60 * 1000, // 30 days
      '@weekly': 7 * 24 * 60 * 60 * 1000,   // 7 days
      '@daily': 24 * 60 * 60 * 1000,        // 24 hours
      '@hourly': 60 * 60 * 1000,             // 1 hour
    };

    if (schedules[schedule]) {
      return schedules[schedule];
    }

    // Parse minute-based schedules (e.g., "*/15" for every 15 minutes)
    const minuteMatch = schedule.match(/^\*\/(\d+)$/);
    if (minuteMatch) {
      return parseInt(minuteMatch[1]) * 60 * 1000;
    }

    // Default to daily if unparseable
    console.warn(`⚠️ Unknown schedule format "${schedule}", defaulting to daily`);
    return 24 * 60 * 60 * 1000;
  }

  // Check if it's time to run a monthly task (1st of month)
  private shouldRunMonthlyTask(lastRun?: Date): boolean {
    const now = new Date();
    const currentDay = now.getDate();
    
    // Run on the 1st of the month
    if (currentDay !== 1) return false;
    
    // If never run before, run it
    if (!lastRun) return true;
    
    // Check if we already ran this month
    const lastRunMonth = lastRun.getMonth();
    const currentMonth = now.getMonth();
    const lastRunYear = lastRun.getFullYear();
    const currentYear = now.getFullYear();
    
    return !(lastRunMonth === currentMonth && lastRunYear === currentYear);
  }

  // Schedule a task
  private scheduleTask(task: ScheduledTask): void {
    if (!task.isActive) return;

    const interval = this.parseSchedule(task.schedule);
    
    // For monthly tasks, check every hour if it's time to run
    const checkInterval = task.schedule === '@monthly' ? 60 * 60 * 1000 : interval;
    
    const intervalId = setInterval(async () => {
      try {
        const shouldRun = task.schedule === '@monthly' 
          ? this.shouldRunMonthlyTask(task.lastRun)
          : true; // For other schedules, run based on interval
        
        if (shouldRun) {
          console.log(`🚀 Running scheduled task: ${task.name}`);
          await task.taskFunction();
          
          // Update last run time
          task.lastRun = new Date();
          this.tasks.set(task.id, task);
          
          console.log(`✅ Completed scheduled task: ${task.name}`);
        }
      } catch (error) {
        console.error(`❌ Error in scheduled task "${task.name}":`, error);
      }
    }, checkInterval);
    
    this.intervalIds.set(task.id, intervalId);
  }

  // Start all scheduled tasks
  start(): void {
    console.log('📅 Starting scheduler service...');
    this.tasks.forEach(task => {
      this.scheduleTask(task);
    });
    console.log(`📅 Scheduler started with ${this.tasks.size} tasks`);
  }

  // Stop all scheduled tasks
  stop(): void {
    console.log('🛑 Stopping scheduler service...');
    this.intervalIds.forEach(intervalId => {
      clearInterval(intervalId);
    });
    this.intervalIds.clear();
    console.log('🛑 All scheduled tasks stopped');
  }

  // Get all tasks
  getTasks(): ScheduledTask[] {
    return Array.from(this.tasks.values());
  }

  // Get task by id
  getTask(id: string): ScheduledTask | undefined {
    return this.tasks.get(id);
  }

  // Update task status
  toggleTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    
    task.isActive = !task.isActive;
    
    if (task.isActive) {
      this.scheduleTask(task);
      console.log(`▶️ Task "${task.name}" activated`);
    } else {
      const intervalId = this.intervalIds.get(taskId);
      if (intervalId) {
        clearInterval(intervalId);
        this.intervalIds.delete(taskId);
      }
      console.log(`⏸️ Task "${task.name}" deactivated`);
    }
    
    return true;
  }
}

export const schedulerService = SchedulerService.getInstance();