import { useState, useEffect, useCallback } from 'react';

function resolveApiBase(): string {
  try {
    const loc = globalThis.location;
    const protocol = loc.protocol || 'http:';
  const hostname = loc.hostname || 'localhost';
  const port = loc.port || '';
  if (port === '5173' || port === '1173') return `${protocol}//${hostname}:8816`;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  } catch (_) {
    return 'http://localhost:8816';
  }
}

const API_BASE_URL = resolveApiBase();

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  (config as unknown as { signal?: AbortSignal }).signal = controller.signal;

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export const propertiesApi = {
  getAll: (filters: Record<string, unknown> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const url = params.toString() ? `/api/properties?${params.toString()}` : '/api/properties';
    return apiRequest(url);
  },
  getById: (id: string) => apiRequest(`/api/properties/${id}`),
  create: (data: Record<string, unknown>) => apiRequest('/api/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Record<string, unknown>) => apiRequest(`/api/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

export const unitsApi = {
  getAll: (propertyId?: string) => {
    const endpoint = propertyId ? `/api/units?propertyId=${propertyId}` : '/api/units';
    return apiRequest(endpoint);
  },
  getById: (id: string) => apiRequest(`/api/units/${id}`),
  getAvailable: (propertyId: string) => apiRequest(`/api/units/available/${propertyId}`),
  create: (data: Record<string, unknown>) => apiRequest('/api/units', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const usersApi = {
  getById: (id: string) => apiRequest(`/api/users/${id}`),
};

export const leasesApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/api/leases?${params}` : '/api/leases';
    return apiRequest(endpoint);
  },
  getMyLease: (tenantId: string) => apiRequest(`/api/leases?tenantId=${tenantId}`).then((leases: unknown) => {
    const leaseArray = Array.isArray(leases) ? leases : [];
    const activeLease = leaseArray.find((l: Record<string, unknown>) => l.status === 'active');
    return activeLease || null;
  }),
  create: (data: Record<string, unknown>) => apiRequest('/api/leases', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  downloadDocument: async (leaseId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/leases/${leaseId}/document`);
    if (!response.ok) {
      throw new Error(`Failed to download lease document: ${response.status}`);
    }
    const blob = await response.blob();
  const url = globalThis.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lease-${leaseId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    globalThis.URL.revokeObjectURL(url);
  },
};

export const renewalsApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/api/renewals?${params}` : '/api/renewals';
    return apiRequest(endpoint);
  },
  create: (data: Record<string, unknown>) => apiRequest('/api/renewals', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Record<string, unknown>) => apiRequest(`/api/renewals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  sendOffer: (id: string) => apiRequest(`/api/renewals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({
      status: 'offer_sent',
      renewalOfferSent: true,
      tenantResponse: 'pending',
      offerSentDate: new Date().toISOString()
    }),
  }),
};

export const documentsApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/api/documents?${params}` : '/api/documents';
    return apiRequest(endpoint);
  },
  upload: (data: Record<string, unknown>) => apiRequest('/api/documents', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/api/documents/${id}`, {
    method: 'DELETE',
  }),
  getById: (id: string) => apiRequest(`/api/documents/${id}`),
  uploadPaymentProof: (
    paymentId: string,
    fileName: string,
    fileData: string,
    mimeType: string,
    userId: string,
    invoiceId: string
  ) => apiRequest('/api/documents', {
    method: 'POST',
    body: JSON.stringify({
      type: 'payment_proof',
      paymentId,
      invoiceId,
      userId,
      content: fileData,
      metadata: {
        fileName,
        mimeType,
        uploadedAt: new Date().toISOString(),
      },
    }),
  }),
};

export const invoicesApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/api/invoices?${params}` : '/api/invoices';
    return apiRequest(endpoint);
  },
  getById: (id: string) => apiRequest(`/api/invoices/${id}`),
  create: (data: Record<string, unknown>) => apiRequest('/api/invoices', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Record<string, unknown>) => apiRequest(`/api/invoices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/api/invoices/${id}`, {
    method: 'DELETE',
  }),
  download: async (id: string, format: 'pdf' | 'markdown') => {
    const url = `${API_BASE_URL}/api/invoices/${id}/${format}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download invoice: ${response.status}`);
      }
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
      const filename = filenameMatch ? filenameMatch[1] : `invoice-${id}.${format === 'pdf' ? 'pdf' : 'md'}`;

      const downloadUrl = globalThis.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      globalThis.URL.revokeObjectURL(downloadUrl);

      return { success: true };
    } catch (error) {
      console.error('Invoice download failed:', error);
      throw error;
    }
  },
  generateMonthly: () => apiRequest('/api/invoices/generate-monthly', {
    method: 'POST',
  }),
  processOverdue: () => apiRequest('/api/invoices/process-overdue', {
    method: 'POST',
  }),
};

export const paymentsApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/api/payments?${params}` : '/api/payments';
    return apiRequest(endpoint);
  },
  create: (data: Record<string, unknown>) => apiRequest('/api/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStatus: (id: string, status: string) => apiRequest(`/api/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
  approve: (id: string, managerId: string, notes?: string) => apiRequest(`/api/payments/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ managerId, notes }),
  }),
  reject: (id: string, managerId: string, notes?: string) => apiRequest(`/api/payments/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ managerId, notes }),
  }),
};

export const maintenanceApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/api/maintenance?${params}` : '/api/maintenance';
    return apiRequest(endpoint);
  },
  create: (data: Record<string, unknown>) => apiRequest('/api/maintenance', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Record<string, unknown>) => apiRequest(`/api/maintenance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => apiRequest(`/api/maintenance/${id}`, {
    method: 'DELETE',
  }),
};

export const tasksApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/api/tasks?${params}` : '/api/tasks';
    return apiRequest(endpoint);
  },
  create: (data: Record<string, unknown>) => apiRequest('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Record<string, unknown>) => apiRequest(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

export const reportsApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/api/reports?${params}` : '/api/reports';
    return apiRequest(endpoint);
  },
  create: (data: Record<string, unknown>) => apiRequest('/api/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const dashboardApi = {
  getStats: (filters: Record<string, unknown> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    const url = params.toString() ? `/api/dashboard/stats?${params.toString()}` : '/api/dashboard/stats';
    return apiRequest(url);
  },
};

export const adminApi = {
  getSystemStats: () => apiRequest('/admin/system-stats'),
  getUserStats: () => apiRequest('/admin/user-stats'),
  getSecurityStats: () => apiRequest('/admin/security-stats'),
  getFinancialStats: () => apiRequest('/admin/financial-stats'),
  getUserActivities: () => apiRequest('/admin/user-activities'),
  getSecurityConfig: () => apiRequest('/admin/security-config'),
  getSecurityAlerts: () => apiRequest('/admin/security-alerts'),
  getSecuritySettings: () => apiRequest('/admin/security-settings'),
  getAvailableReports: () => apiRequest('/admin/available-reports'),
  getReportActivities: () => apiRequest('/admin/report-activities'),
  getDatabaseHealth: () => apiRequest('/admin/database-health'),
  getApiEndpoints: () => apiRequest('/admin/api-endpoints'),
  getSystemAlerts: () => apiRequest('/admin/system-alerts'),
  createUser: (userData: Record<string, unknown>) => apiRequest('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  updateSecuritySetting: (id: string | null, settingName: string, value: string) => apiRequest('/admin/security-settings', {
    method: 'PUT',
    body: JSON.stringify({ id, setting: settingName, value }),
  }),
  updateAuthMethod: (method: string, enabled: boolean) => apiRequest('/admin/auth-methods', {
    method: 'PUT',
    body: JSON.stringify({ method, enabled }),
  }),
  clearSecurityAlert: (alertId: string) => apiRequest(`/admin/security-alerts/${alertId}`, {
    method: 'DELETE',
  }),
  triggerSystemAction: (action: string, parameters?: Record<string, unknown>) => apiRequest('/admin/system-actions', {
    method: 'POST',
    body: JSON.stringify({ action, parameters }),
  }),
  generateReport: (reportType: string, filters: Record<string, unknown>) => apiRequest('/admin/generate-report', {
    method: 'POST',
    body: JSON.stringify({ reportType, filters }),
  }),
  exportReport: (reportId: string, format: string) => apiRequest(`/admin/export-report/${reportId}/${format}`, {
    method: 'GET',
  }),
  getAuditLogs: (filters?: Record<string, unknown>) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const url = params.toString() ? `/admin/audit-logs?${params.toString()}` : '/admin/audit-logs';
    return apiRequest(url);
  },
  createAuditLog: (logData: Record<string, unknown>) => apiRequest('/admin/audit-logs', {
    method: 'POST',
    body: JSON.stringify(logData),
  }),
  getPendingUsers: () => apiRequest('/api/admin/pending-users'),
  approvePendingUser: (userId: string) => apiRequest(`/api/admin/pending-users/${userId}/approve`, {
    method: 'POST',
  }),
  declinePendingUser: (userId: string) => apiRequest(`/api/admin/pending-users/${userId}/decline`, {
    method: 'POST',
  }),
};

export const managerApi = {
  getPendingApplications: (managerId: string) => apiRequest('/api/manager/applications', {
    headers: { 'x-manager-id': managerId },
  }),
  approveApplication: (userId: string, managerId: string) => apiRequest(`/api/manager/applications/${userId}/approve`, {
    method: 'POST',
    headers: { 'x-manager-id': managerId },
  }),
  rejectApplication: (userId: string, managerId: string, reason?: string) => apiRequest(`/api/manager/applications/${userId}/reject`, {
    method: 'POST',
    headers: { 'x-manager-id': managerId },
    body: JSON.stringify({ reason }),
  }),
};

export const tenantsApi = {
  getContext: (tenantId: string) => apiRequest(`/api/tenants/${tenantId}/context`),
};

export const authApi = {
  login: (email: string, password: string) => apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (userData: Record<string, unknown>) => apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  registerPendingTenant: (userData: Record<string, unknown>) => apiRequest('/api/auth/register-pending', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  logout: () => apiRequest('/api/auth/logout', {
    method: 'POST',
  }),
};

export const notificationsApi = {
  getAll: (userId: string) => apiRequest(`/api/notifications/${userId}`),
  create: (data: Record<string, unknown>) => apiRequest('/api/notifications', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export function useApi<T>(apiCall: () => Promise<T>, dependencies: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-ZA');
}

export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('en-ZA');
}

export async function withErrorHandling<T>(
  apiCall: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await apiCall();
    return { data, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : errorMessage;
    return { data: null, error: message };
  }
}
