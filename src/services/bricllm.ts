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

interface BricllmResponse {
  response: string;
  confidence?: number;
  responseTime?: number;
  language?: string;
  role?: string;
}

interface BricllmQuery {
  message: string;
  role: 'tenant' | 'caretaker' | 'manager' | 'admin';
  language: 'en' | 'zu';
  route?: string;
}

export class BricllmService {
  private static instance: BricllmService;

  private constructor() {
  }

  static getInstance(): BricllmService {
    if (!BricllmService.instance) {
      BricllmService.instance = new BricllmService();
    }
    return BricllmService.instance;
  }

  async query(params: BricllmQuery): Promise<BricllmResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bricllm/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        console.error('Bricllm API request failed:', response.status);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Bricllm query error:', error);
      return null;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bricllm/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const bricllmService = BricllmService.getInstance();
