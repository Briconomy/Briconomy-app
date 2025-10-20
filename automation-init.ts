import { schedulerService } from './src/services/scheduler.ts';
import { autoInvoiceService } from './src/services/autoInvoice.ts';

export function initializeAutomation(): void {
  console.log('🚀 Initializing automation services...');
  
  try {
    // Initialize auto-invoice service (this adds tasks to scheduler)
    autoInvoiceService.initialize();
    
    // Start the scheduler
    schedulerService.start();
    
    console.log('✅ Automation services initialized successfully');
    console.log('📅 Scheduler is running with the following tasks:');
    
    const tasks = schedulerService.getTasks();
    tasks.forEach(task => {
      const status = task.isActive ? '🟢 ACTIVE' : '🔴 INACTIVE';
      console.log(`  - ${task.name}: ${status}`);
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize automation services:', error);
  }
}

// Graceful shutdown handler
export function shutdownAutomation(): void {
  console.log('🛑 Shutting down automation services...');
  schedulerService.stop();
  console.log('✅ Automation services stopped');
}

// Setup process event handlers for graceful shutdown
if (typeof Deno !== 'undefined') {
  // Deno signal handling
  Deno.addSignalListener('SIGINT', () => {
    console.log('\n🛑 Received SIGINT, shutting down gracefully...');
    shutdownAutomation();
    Deno.exit(0);
  });

  Deno.addSignalListener('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    shutdownAutomation();
    Deno.exit(0);
  });
}