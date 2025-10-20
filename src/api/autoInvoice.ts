import { autoInvoiceService } from '../services/autoInvoice.ts';
import { schedulerService } from '../services/scheduler.ts';

// API endpoints for automated invoice management
export const autoInvoiceRoutes = {
  
  // Get automation status
  getStatus(_request: Request): Response {
    try {
      const status = autoInvoiceService.getStatus();
      const config = autoInvoiceService.getConfig();
      
      return new Response(JSON.stringify({
        success: true,
        data: {
          status,
          config
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  // Update automation configuration
  async updateConfig(request: Request): Promise<Response> {
    try {
      const body = await request.json();
      
      // Validate config
      if (typeof body.enabled !== 'undefined' && typeof body.enabled !== 'boolean') {
        throw new Error('enabled must be a boolean');
      }
      
      if (typeof body.generateDay !== 'undefined' && (body.generateDay < 1 || body.generateDay > 31)) {
        throw new Error('generateDay must be between 1 and 31');
      }

      autoInvoiceService.updateConfig(body);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Configuration updated successfully',
        data: autoInvoiceService.getConfig()
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  // Manual trigger for testing
  async manualTrigger(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const taskType = url.searchParams.get('type') as 'invoices' | 'overdue' | 'reminders';
      
      if (!taskType || !['invoices', 'overdue', 'reminders'].includes(taskType)) {
        throw new Error('Invalid task type. Must be: invoices, overdue, or reminders');
      }

      await autoInvoiceService.manualTrigger(taskType);
      
      return new Response(JSON.stringify({
        success: true,
        message: `${taskType} task triggered successfully`
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  // Toggle specific task
  toggleTask(request: Request): Response {
    try {
      const url = new URL(request.url);
      const taskId = url.searchParams.get('taskId');
      
      if (!taskId) {
        throw new Error('taskId parameter is required');
      }

      const success = schedulerService.toggleTask(taskId);
      
      if (!success) {
        throw new Error('Task not found');
      }
      
      return new Response(JSON.stringify({
        success: true,
        message: `Task ${taskId} toggled successfully`,
        data: schedulerService.getTask(taskId)
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  },

  // Get all scheduled tasks
  getTasks(_request: Request): Response {
    try {
      const tasks = schedulerService.getTasks();
      
      return new Response(JSON.stringify({
        success: true,
        data: tasks
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
};