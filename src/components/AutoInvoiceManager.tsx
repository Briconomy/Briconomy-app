import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext.tsx';

interface AutoInvoiceStatus {
  enabled: boolean;
  tasks: {
    id: string;
    name: string;
    isActive: boolean;
    lastRun?: string;
  }[];
}

interface AutoInvoiceConfig {
  enabled: boolean;
  generateDay: number;
  reminderDaysBefore: number[];
  overdueCheckDays: number[];
  managerEscalationDays: number;
}

interface AutoInvoiceManagerProps {
  onClose: () => void;
}

const AutoInvoiceManager: React.FC<AutoInvoiceManagerProps> = ({ onClose }) => {
  const { t: _t } = useLanguage();
  const [status, setStatus] = useState<AutoInvoiceStatus | null>(null);
  const [config, setConfig] = useState<AutoInvoiceConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/auto-invoice/status');
      if (!response.ok) throw new Error('Failed to fetch status');
      
      const data = await response.json();
      setStatus(data.data.status);
      setConfig(data.data.config);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (updates: Partial<AutoInvoiceConfig>) => {
    try {
      setLoading(true);
      const response = await fetch('/api/auto-invoice/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (!response.ok) throw new Error('Failed to update configuration');
      
      const data = await response.json();
      setConfig(data.data);
      setSuccess('Configuration updated successfully');
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update configuration');
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (taskId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/auto-invoice/toggle?taskId=${taskId}`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to toggle task');
      
      setSuccess('Task toggled successfully');
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle task');
    } finally {
      setLoading(false);
    }
  };

  const manualTrigger = async (taskType: 'invoices' | 'overdue' | 'reminders') => {
    try {
      setLoading(true);
      const response = await fetch(`/api/auto-invoice/trigger?type=${taskType}`, {
        method: 'POST'
      });
      
      if (!response.ok) throw new Error('Failed to trigger task');
      
      setSuccess(`${taskType} task triggered successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trigger task');
    } finally {
      setLoading(false);
    }
  };

  const formatTaskName = (id: string): string => {
    const names: Record<string, string> = {
      'monthly-invoice-generation': 'Monthly Invoice Generation',
      'daily-overdue-check': 'Overdue Payment Check',
      'daily-reminder-check': 'Payment Reminder Check'
    };
    return names[id] || id;
  };

  const getStatusColor = (isActive: boolean): string => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  if (loading && !status) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="loading-spinner mb-4"></div>
            <p>Loading automation settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Automated Invoice Management</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* System Status */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">System Status</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">Automation System</span>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    config?.enabled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {config?.enabled ? 'ENABLED' : 'DISABLED'}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateConfig({ enabled: !config?.enabled })}
                    disabled={loading}
                    className={`px-4 py-2 rounded text-white font-medium ${
                      config?.enabled 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-green-600 hover:bg-green-700'
                    } disabled:opacity-50`}
                  >
                    {config?.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>

              {status && (
                <div className="space-y-3">
                  {status.tasks.map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-white rounded border">
                      <div>
                        <div className="font-medium">{formatTaskName(task.id)}</div>
                        {task.lastRun && (
                          <div className="text-sm text-gray-500">
                            Last run: {new Date(task.lastRun).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.isActive)}`}>
                          {task.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          disabled={loading}
                          className="px-3 py-1 rounded text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                          Toggle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Configuration */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Generation Day (1-31)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={config?.generateDay || 1}
                  onChange={(e) => updateConfig({ generateDay: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Day of the month to generate invoices</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manager Escalation (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={config?.managerEscalationDays || 14}
                  onChange={(e) => updateConfig({ managerEscalationDays: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Days overdue before escalating to manager</p>
              </div>
            </div>
          </div>

          {/* Manual Actions */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">Manual Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => manualTrigger('invoices')}
                disabled={loading}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                📄 Generate Invoices + JSON
              </button>
              <button
                type="button"
                onClick={() => manualTrigger('overdue')}
                disabled={loading}
                className="px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
              >
                Check Overdue Now
              </button>
              <button
                type="button"
                onClick={() => manualTrigger('reminders')}
                disabled={loading}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                Send Reminders Now
              </button>
            </div>
          </div>

          {/* Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">How it Works</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Monthly Invoice Generation:</strong> Automatically creates invoices on the {config?.generateDay || 1}st of each month</li>
              <li>• <strong>Payment Reminders:</strong> Sends reminders to tenants 7, 3, and 1 days before due date</li>
              <li>• <strong>Overdue Checking:</strong> Daily checks for overdue payments and sends notifications</li>
              <li>• <strong>Manager Escalation:</strong> Alerts managers when payments are {config?.managerEscalationDays || 14}+ days overdue</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoInvoiceManager;