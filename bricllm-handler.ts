interface BricllmQuery {
  message: string;
  role: 'tenant' | 'caretaker' | 'manager' | 'admin';
  language: 'en' | 'zu';
  route?: string;
}

interface BricllmResponse {
  response: string;
  confidence?: number;
  responseTime?: number;
  language?: string;
  role?: string;
}

class BricllmHandler {
  private bricllmPath: string;
  private isAvailable: boolean = false;
  private hasWarned: boolean = false;

  constructor() {
    const platform = Deno.build.os;
    this.bricllmPath = platform === 'windows'
      ? './bricllm/bricllm.exe'
      : './bricllm/bricllm';
    this.checkAvailability();
  }

  private async checkAvailability(): Promise<void> {
    try {
      const fileInfo = await Deno.stat(this.bricllmPath);
      this.isAvailable = fileInfo.isFile;
      if (this.isAvailable) {
        console.log('[Bricllm] AI model loaded successfully');
      }
    } catch {
      this.isAvailable = false;
      if (!this.hasWarned) {
        console.warn('[Bricllm] AI model not installed. Using FAQ fallback. Run: deno task update-llm');
        this.hasWarned = true;
      }
    }
  }

  async query(params: BricllmQuery): Promise<BricllmResponse | null> {
    if (!this.isAvailable) {
      await this.checkAvailability();
      if (!this.isAvailable) {
        return null;
      }
    }

    try {
      const args = [
        '--single-query', params.message,
        '--role', params.role,
        '--lang', params.language,
        '-j'
      ];

      if (params.route) {
        args.push('--route', params.route);
      }

      const command = new Deno.Command(this.bricllmPath, {
        args,
        stdout: 'piped',
        stderr: 'piped',
      });

      const process = command.spawn();
      const { code, stdout, stderr } = await process.output();

      if (code !== 0) {
        const errorText = new TextDecoder().decode(stderr);
        console.error('[Bricllm] Process error:', errorText);
        return null;
      }

      const outputText = new TextDecoder().decode(stdout);

      let jsonResponse;
      try {
        jsonResponse = JSON.parse(outputText);
      } catch (parseError) {
        console.error('[Bricllm] JSON parse error:', parseError);
        console.error('[Bricllm] Raw output:', outputText);

        const jsonMatch = outputText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            jsonResponse = JSON.parse(jsonMatch[0]);
          } catch {
            return null;
          }
        } else {
          return null;
        }
      }

      return {
        response: jsonResponse.response || '',
        confidence: jsonResponse.confidence,
        responseTime: jsonResponse.responseTime,
        language: jsonResponse.language || params.language,
        role: jsonResponse.role || params.role
      };
    } catch (error) {
      console.error('[Bricllm] Query failed:', error);
      return null;
    }
  }

  async healthCheck(): Promise<boolean> {
    await this.checkAvailability();
    return this.isAvailable;
  }
}

export const bricllmHandler = new BricllmHandler();
