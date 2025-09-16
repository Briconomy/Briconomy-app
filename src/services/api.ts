import { useState, useEffect, useCallback } from 'react';

function resolveApiBase(): string {
  try {
    const loc = globalThis.location;
    const protocol = loc.protocol || 'http:';
  const hostname = loc.hostname || 'localhost';
  const port = loc.port || '';
  if (port === '5173') return `${protocol}//${hostname}:8816/api`;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}/api`;
  } catch (_) {
    return 'http://localhost:8816/api';
  }
}

const API_BASE_URL = resolveApiBase();

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };
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
  getAll: () => apiRequest('/properties'),
  getById: (id: string) => apiRequest(`/properties/${id}`),
  create: (data: Record<string, unknown>) => apiRequest('/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Record<string, unknown>) => apiRequest(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

export const unitsApi = {
  getAll: (propertyId?: string) => {
    const endpoint = propertyId ? `/units?propertyId=${propertyId}` : '/units';
    return apiRequest(endpoint);
  },
  create: (data: Record<string, unknown>) => apiRequest('/units', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const leasesApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/leases?${params}` : '/leases';
    return apiRequest(endpoint);
  },
  create: (data: Record<string, unknown>) => apiRequest('/leases', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const paymentsApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/payments?${params}` : '/payments';
    return apiRequest(endpoint);
  },
  create: (data: Record<string, unknown>) => apiRequest('/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateStatus: (id: string, status: string) => apiRequest(`/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  }),
};

export const maintenanceApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/maintenance?${params}` : '/maintenance';
    return apiRequest(endpoint);
  },
  create: (data: Record<string, unknown>) => apiRequest('/maintenance', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Record<string, unknown>) => apiRequest(`/maintenance/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

export const tasksApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/tasks?${params}` : '/tasks';
    return apiRequest(endpoint);
  },
  create: (data: Record<string, unknown>) => apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: Record<string, unknown>) => apiRequest(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

export const reportsApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/reports?${params}` : '/reports';
    return apiRequest(endpoint);
  },
  create: (data: Record<string, unknown>) => apiRequest('/reports', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const dashboardApi = {
  getStats: () => apiRequest('/dashboard/stats'),
};

export const authApi = {
  login: (email: string, password: string) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }),
  register: (userData: Record<string, unknown>) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  logout: () => apiRequest('/auth/logout', {
    method: 'POST',
  }),
};

export const notificationsApi = {
  getAll: (userId: string) => apiRequest(`/notifications/${userId}`),
  create: (data: Record<string, unknown>) => apiRequest('/notifications', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const terminationsApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    const endpoint = params ? `/terminations?${params}` : '/terminations';
    return apiRequest(endpoint);
  },
  getById: (id: string) => apiRequest(`/terminations/${id}`),
  create: (data: Record<string, unknown>) => apiRequest('/terminations', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  approve: (id: string) => apiRequest(`/terminations/${id}/approve`, {
    method: 'PUT',
  }),
  reject: (id: string, reason: string) => apiRequest(`/terminations/${id}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ reason }),
  }),
  update: (id: string, data: Record<string, unknown>) => apiRequest(`/terminations/${id}`, {
    method: 'PUT',
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
