import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8000/api';

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = { ...defaultOptions, ...options };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export const propertiesApi = {
  getAll: () => apiRequest('/properties'),
  getById: (id: string) => apiRequest(`/properties/${id}`),
  create: (data: any) => apiRequest('/properties', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/properties/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
};

export const unitsApi = {
  getAll: (propertyId?: string) => {
    const endpoint = propertyId ? `/units?propertyId=${propertyId}` : '/units';
    return apiRequest(endpoint);
  },
  create: (data: any) => apiRequest('/units', {
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
  create: (data: any) => apiRequest('/leases', {
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
  create: (data: any) => apiRequest('/payments', {
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
  create: (data: any) => apiRequest('/maintenance', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/maintenance/${id}`, {
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
  create: (data: any) => apiRequest('/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => apiRequest(`/tasks/${id}`, {
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
  create: (data: any) => apiRequest('/reports', {
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
  register: (userData: any) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  logout: () => apiRequest('/auth/logout', {
    method: 'POST',
  }),
};

export const notificationsApi = {
  getAll: (userId: string) => apiRequest(`/notifications/${userId}`),
  create: (data: any) => apiRequest('/notifications', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export function useApi<T>(apiCall: () => Promise<T>, dependencies: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiCall();
        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error, refetch: () => fetchData() };
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