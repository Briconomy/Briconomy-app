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
  private apiEndpoint: string;

  private constructor() {
    this.apiEndpoint = '/api/bricllm/query';
  }

  static getInstance(): BricllmService {
    if (!BricllmService.instance) {
      BricllmService.instance = new BricllmService();
    }
    return BricllmService.instance;
  }

  async query(params: BricllmQuery): Promise<BricllmResponse | null> {
    try {
      const response = await fetch(this.apiEndpoint, {
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
      const response = await fetch('/api/bricllm/health', {
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
