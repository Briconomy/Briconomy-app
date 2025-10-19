import { bricllmService } from './bricllm.ts';

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

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'escalation';
  action?: {
    label: string;
    route: string;
  };
}

export class ChatbotService {
  private static instance: ChatbotService;
  private failedReplies: number = 0;
  private maxFailedReplies: number = 3;

  static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  async processMessage(userMessage: string, language: 'en' | 'zu' = 'en', userRole: 'tenant' | 'caretaker' | 'manager' | 'admin' = 'tenant', route?: string): Promise<ChatMessage> {
    const bricllmResult = await bricllmService.query({
      message: userMessage,
      role: userRole,
      language: language,
      route: route
    });

    if (bricllmResult && bricllmResult.response) {
      this.failedReplies = 0;
      return {
        id: Date.now().toString(),
        text: bricllmResult.response,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
    }

    this.failedReplies++;

    const unavailableResponses = {
      tenant: {
        en: this.failedReplies >= this.maxFailedReplies
          ? "The AI assistant is currently unavailable. Let me connect you with a human agent who can help you."
          : "The AI assistant is currently unavailable. Please try again later or contact your property manager for assistance.",
        zu: this.failedReplies >= this.maxFailedReplies
          ? "Umsizi we-AI awutholakali njengamanje. Ngivumele ngikuxhumanise nomuntu ongakusiza."
          : "Umsizi we-AI awutholakali njengamanje. Sicela uzame futhi kamuva noma uxhumane nomphathi wezakhiwo ukuze akusize."
      },
      caretaker: {
        en: this.failedReplies >= this.maxFailedReplies
          ? "The AI assistant is currently unavailable. Let me connect you with a supervisor."
          : "The AI assistant is currently unavailable. Please try again later or contact your supervisor for assistance.",
        zu: this.failedReplies >= this.maxFailedReplies
          ? "Umsizi we-AI awutholakali njengamanje. Ngivumele ngikuxhumanise nomphathi."
          : "Umsizi we-AI awutholakali njengamanje. Sicela uzame futhi kamuva noma uxhumane nomphathi wakho ukuze akusize."
      },
      manager: {
        en: this.failedReplies >= this.maxFailedReplies
          ? "The AI assistant is currently unavailable. Let me connect you with technical support."
          : "The AI assistant is currently unavailable. Please try again later or contact technical support for assistance.",
        zu: this.failedReplies >= this.maxFailedReplies
          ? "Umsizi we-AI awutholakali njengamanje. Ngivumele ngikuxhumanise nosizo lwezobuchwepheshe."
          : "Umsizi we-AI awutholakali njengamanje. Sicela uzame futhi kamuva noma uxhumane nosizo lwezobuchwepheshe ukuze akusize."
      },
      admin: {
        en: this.failedReplies >= this.maxFailedReplies
          ? "The AI assistant is currently unavailable. Let me escalate this to senior support."
          : "The AI assistant is currently unavailable. Please try again later or contact senior support for assistance.",
        zu: this.failedReplies >= this.maxFailedReplies
          ? "Umsizi we-AI awutholakali njengamanje. Ngivumele ngiphakamise lokhu kosizo oluphezulu."
          : "Umsizi we-AI awutholakali njengamanje. Sicela uzame futhi kamuva noma uxhumane nosizo oluphezulu ukuze akusize."
      }
    };

    return {
      id: Date.now().toString(),
      text: unavailableResponses[userRole][language],
      sender: 'bot',
      timestamp: new Date(),
      type: this.failedReplies >= this.maxFailedReplies ? 'escalation' : 'text'
    };
  }

  shouldEscalate(): boolean {
    return this.failedReplies >= this.maxFailedReplies;
  }

  resetFailedReplies(): void {
    this.failedReplies = 0;
  }

  async saveMessage(message: ChatMessage, userId: string): Promise<void> {
    try {
      const chatData = {
        userId,
        messageId: message.id,
        text: message.text,
        sender: message.sender,
        timestamp: message.timestamp,
        type: message.type || 'text'
      };

      await fetch(`${API_BASE_URL}/api/chat-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatData)
      });
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  }

  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat-messages?userId=${userId}`);
      if (!response.ok) return [];

      const messages = await response.json();
      return messages.map((msg: { messageId: string; text: string; sender: string; timestamp: string; type: string }) => ({
        id: msg.messageId,
        text: msg.text,
        sender: msg.sender as 'user' | 'bot',
        timestamp: new Date(msg.timestamp),
        type: msg.type as 'text' | 'escalation'
      }));
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  async escalateToHuman(userId: string, userMessage: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/chat-escalations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userMessage,
          timestamp: new Date(),
          status: 'pending'
        })
      });
    } catch (error) {
      console.error('Error escalating to human:', error);
    }
  }
}

export const chatbotService = ChatbotService.getInstance();
