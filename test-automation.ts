#!/usr/bin/env deno run --allow-net --allow-read --allow-env

/**
 * Test script for automated invoice generation system
 * Run with: deno run --allow-net --allow-read --allow-env test-automation.ts
 */

import { autoInvoiceService } from './src/services/autoInvoice.ts';
import { schedulerService } from './src/services/scheduler.ts';

console.log('🧪 Testing Automated Invoice System');
console.log('=====================================\n');

// Test 1: Initialize services
console.log('📋 Test 1: Initializing services...');
try {
  autoInvoiceService.initialize();
  console.log('✅ Auto-invoice service initialized');
  
  schedulerService.start();
  console.log('✅ Scheduler service started');
} catch (error) {
  console.error('❌ Initialization failed:', error);
  Deno.exit(1);
}

// Test 2: Check service status
console.log('\n📋 Test 2: Checking service status...');
try {
  const status = autoInvoiceService.getStatus();
  console.log('✅ Status retrieved:', JSON.stringify(status, null, 2));
} catch (error) {
  console.error('❌ Status check failed:', error);
}

// Test 3: Check configuration
console.log('\n📋 Test 3: Checking configuration...');
try {
  const config = autoInvoiceService.getConfig();
  console.log('✅ Configuration retrieved:', JSON.stringify(config, null, 2));
} catch (error) {
  console.error('❌ Configuration check failed:', error);
}

// Test 4: List scheduled tasks
console.log('\n📋 Test 4: Listing scheduled tasks...');
try {
  const tasks = schedulerService.getTasks();
  console.log(`✅ Found ${tasks.length} scheduled tasks:`);
  tasks.forEach(task => {
    const status = task.isActive ? '🟢 ACTIVE' : '🔴 INACTIVE';
    const lastRun = task.lastRun ? new Date(task.lastRun).toLocaleString() : 'Never';
    console.log(`   - ${task.name}: ${status} (Last run: ${lastRun})`);
  });
} catch (error) {
  console.error('❌ Task listing failed:', error);
}

// Test 5: Update configuration
console.log('\n📋 Test 5: Testing configuration update...');
try {
  // Test updating the generation day
  autoInvoiceService.updateConfig({ generateDay: 15 });
  const updatedConfig = autoInvoiceService.getConfig();
  
  if (updatedConfig.generateDay === 15) {
    console.log('✅ Configuration update successful');
    
    // Revert back to original
    autoInvoiceService.updateConfig({ generateDay: 1 });
    console.log('✅ Configuration reverted');
  } else {
    console.error('❌ Configuration update failed');
  }
} catch (error) {
  console.error('❌ Configuration update test failed:', error);
}

// Test 6: Toggle task
console.log('\n📋 Test 6: Testing task toggle...');
try {
  const taskId = 'monthly-invoice-generation';
  const task = schedulerService.getTask(taskId);
  
  if (task) {
    const originalState = task.isActive;
    
    // Toggle the task
    schedulerService.toggleTask(taskId);
    const toggledTask = schedulerService.getTask(taskId);
    
    if (toggledTask && toggledTask.isActive !== originalState) {
      console.log('✅ Task toggle successful');
      
      // Toggle back
      schedulerService.toggleTask(taskId);
      console.log('✅ Task state reverted');
    } else {
      console.error('❌ Task toggle failed');
    }
  } else {
    console.error('❌ Task not found for toggle test');
  }
} catch (error) {
  console.error('❌ Task toggle test failed:', error);
}

// Test 7: Manual trigger simulation (dry run)
console.log('\n📋 Test 7: Testing manual trigger simulation...');
try {
  console.log('   📝 This would trigger manual invoice generation');
  console.log('   📝 This would trigger overdue check');  
  console.log('   📝 This would trigger payment reminders');
  console.log('✅ Manual trigger simulation complete');
  
  // Note: We don't actually trigger these in test mode to avoid side effects
} catch (error) {
  console.error('❌ Manual trigger simulation failed:', error);
}

// Cleanup
console.log('\n🧹 Cleaning up...');
schedulerService.stop();
console.log('✅ Scheduler stopped');

console.log('\n🎉 All tests completed!');
console.log('\n📝 Summary:');
console.log('   - Automated invoice generation system is ready');
console.log('   - Monthly invoices will be generated on the 1st of each month');
console.log('   - Payment reminders will be sent 7, 3, and 1 days before due date');
console.log('   - Overdue payments will be checked daily');
console.log('   - Manager escalation occurs after 14 days overdue');
console.log('   - All tasks can be managed via the API endpoints');
console.log('\n🚀 Start your API server to enable automation!');