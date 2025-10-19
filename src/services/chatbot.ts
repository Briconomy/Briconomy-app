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

interface FAQItem {
  keywords: string[];
  response: string;
  category: 'rent' | 'maintenance' | 'lease' | 'general' | 'tasks' | 'schedule';
  language: 'en' | 'zu';
  userRole: 'tenant' | 'caretaker' | 'manager' | 'admin' | 'all';
  action?: {
    label: string;
    route: string;
  };
}

export class ChatbotService {
  private static instance: ChatbotService;
  private failedReplies: number = 0;
  private maxFailedReplies: number = 3;
  private useBricllm: boolean = true;

  static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  private faqs: FAQItem[] = [
    // English FAQs for Tenants
    {
      keywords: ['rent', 'payment', 'pay', 'due', 'when', 'how much', 'cost', 'money', 'bill'],
      response: 'Your monthly rent is due on the 1st of each month. You can check your exact amount and due date in the Payments section.',
      category: 'rent',
      language: 'en',
      userRole: 'tenant',
      action: {
        label: 'Go to Payments',
        route: '/tenant/payments'
      }
    },
    {
      keywords: ['late', 'overdue', 'penalty', 'fee', 'missed', 'behind'],
      response: 'Late payment fees may apply if rent is not paid within 7 days of the due date. Please contact your property manager for specific late fee information.',
      category: 'rent',
      language: 'en',
      userRole: 'tenant'
    },
    {
      keywords: ['maintenance', 'repair', 'broken', 'issue', 'problem', 'fix', 'not working', 'damaged'],
      response: 'You can report maintenance issues through the Maintenance Requests page. Include photos and describe the problem in detail for faster resolution.',
      category: 'maintenance',
      language: 'en',
      userRole: 'tenant',
      action: {
        label: 'Report Issue',
        route: '/tenant/requests'
      }
    },
    {
      keywords: ['lease', 'contract', 'agreement', 'end', 'renewal', 'extend', 'terminate'],
      response: 'You can view your lease agreement in the Lease Management section. For renewal questions, contact your property manager 60 days before expiry.',
      category: 'lease',
      language: 'en',
      userRole: 'tenant'
    },
    {
      keywords: ['contact', 'manager', 'help', 'support', 'assistance', 'question'],
      response: 'You can contact your property manager through the Communication page or call the property management office during business hours.',
      category: 'general',
      language: 'en',
      userRole: 'tenant',
      action: {
        label: 'Send Message',
        route: '/tenant/messages'
      }
    },
    {
      keywords: ['emergency', 'urgent', 'water', 'electricity', 'gas', 'leak', 'fire'],
      response: 'For emergencies like water leaks, electrical issues, or gas problems, call the emergency hotline immediately and also log the issue in Maintenance Requests.',
      category: 'maintenance',
      language: 'en',
      userRole: 'all'
    },
    {
      keywords: ['how', 'what', 'where', 'guide', 'tutorial', 'instructions'],
      response: 'I can help you with rent payments, maintenance requests, lease information, and contacting your property manager. What would you like to know?',
      category: 'general',
      language: 'en',
      userRole: 'tenant'
    },

    // English FAQs for Caretakers
    {
      keywords: ['task', 'tasks', 'assignment', 'work', 'job', 'schedule', 'duties'],
      response: 'You can view your assigned tasks on the Tasks page. Check your schedule and mark tasks as completed when finished.',
      category: 'tasks',
      language: 'en',
      userRole: 'caretaker',
      action: {
        label: 'View Tasks',
        route: '/caretaker/tasks'
      }
    },
    {
      keywords: ['maintenance', 'repair', 'broken', 'issue', 'problem', 'fix', 'not working', 'damaged'],
      response: 'You can view and manage maintenance requests on the Maintenance page. Update the status and add notes when working on repairs.',
      category: 'maintenance',
      language: 'en',
      userRole: 'caretaker'
    },
    {
      keywords: ['schedule', 'calendar', 'appointments', 'when', 'time', 'availability'],
      response: 'Check your schedule on the Schedule page to see upcoming tasks and maintenance appointments.',
      category: 'schedule',
      language: 'en',
      userRole: 'caretaker'
    },
    {
      keywords: ['history', 'completed', 'finished', 'done', 'past', 'previous'],
      response: 'You can view your completed tasks and maintenance history on the History page to track your work progress.',
      category: 'general',
      language: 'en',
      userRole: 'caretaker'
    },
    {
      keywords: ['profile', 'information', 'details', 'account', 'settings'],
      response: 'View and update your profile information on the Profile page, including your skills and contact details.',
      category: 'general',
      language: 'en',
      userRole: 'caretaker'
    },
    {
      keywords: ['how', 'what', 'where', 'guide', 'tutorial', 'instructions'],
      response: 'I can help you with managing your tasks, maintenance requests, schedule, and viewing your work history. What would you like to know?',
      category: 'general',
      language: 'en',
      userRole: 'caretaker'
    },
    {
      keywords: ['report', 'reports', 'performance', 'statistics', 'stats'],
      response: 'You can view your performance reports and work statistics to track your productivity and completed tasks.',
      category: 'general',
      language: 'en',
      userRole: 'caretaker'
    },

    // Zulu FAQs for Tenants
    {
      keywords: ['intsimbi', 'ukukhokha', 'nini', 'malini'],
      response: 'Intsimbi yakho yenyanga kumele ikhokhelwe ngomhla we-1 wenyanga ngayinye. Ungabheka imali yakho nesikhathi sokukhokha kuleli khona Payments.',
      category: 'rent',
      language: 'zu',
      userRole: 'tenant'
    },
    {
      keywords: ['ukusebenza', 'ukulungisa', 'ephukile', 'inkinga'],
      response: 'Ungabika izinkinga zokulungisa nge-Maintenance Requests page. Faka izithombe nochaze inkinga ngokuphelele ukuze zilungiswe ngokushesha.',
      category: 'maintenance',
      language: 'zu',
      userRole: 'tenant'
    },
    {
      keywords: ['ukuphila', 'isivumelwano', 'ukuphela', 'ukuvuselela'],
      response: 'Ungabona isivumelwano sakho se-lease ku-Lease Management section. Emibuzo yokuvuselela, xhumana ne-property manager ezinsukwini ezingu-60 ngaphambi kokuphela.',
      category: 'lease',
      language: 'zu',
      userRole: 'tenant'
    },
    {
      keywords: ['usizo', 'uxhumana', 'isidingo'],
      response: 'Ungaxhumana ne-property manager yakho nge-Communication page noma ushaye nge-business hours.',
      category: 'general',
      language: 'zu',
      userRole: 'tenant'
    },

    // English FAQs for Managers
    {
      keywords: ['property', 'properties', 'building', 'buildings', 'manage', 'add', 'view'],
      response: 'You can manage your properties on the Properties page. Add new properties, view details, and manage units and tenants.',
      category: 'general',
      language: 'en',
      userRole: 'manager'
    },
    {
      keywords: ['lease', 'leases', 'contract', 'agreement', 'tenant', 'rental'],
      response: 'Manage lease agreements on the Leases page. Create new leases, track renewals, and handle lease documentation.',
      category: 'lease',
      language: 'en',
      userRole: 'manager'
    },
    {
      keywords: ['payment', 'payments', 'rent', 'money', 'collection', 'invoice'],
      response: 'Track rent payments and manage invoices on the Payments page. Monitor payment status and handle tenant payment methods.',
      category: 'rent',
      language: 'en',
      userRole: 'manager'
    },
    {
      keywords: ['maintenance', 'repair', 'request', 'issue', 'work order'],
      response: 'Review and assign maintenance requests to caretakers. Monitor repair progress and manage work orders.',
      category: 'maintenance',
      language: 'en',
      userRole: 'manager'
    },
    {
      keywords: ['report', 'reports', 'analytics', 'statistics', 'performance'],
      response: 'Generate property performance reports, financial summaries, and tenant analytics to track your portfolio.',
      category: 'general',
      language: 'en',
      userRole: 'manager'
    },
    {
      keywords: ['how', 'what', 'where', 'guide', 'tutorial', 'instructions'],
      response: 'I can help you with property management, lease agreements, rent collection, maintenance oversight, and reporting. What would you like to know?',
      category: 'general',
      language: 'en',
      userRole: 'manager'
    },

    // English FAQs for Admins
    {
      keywords: ['user', 'users', 'account', 'accounts', 'manage', 'add', 'remove', 'create'],
      response: 'You can manage user accounts on the Users page. Add new users, modify permissions, or deactivate accounts as needed.',
      category: 'general',
      language: 'en',
      userRole: 'admin'
    },
    {
      keywords: ['security', 'permissions', 'access', 'login', 'password', 'authentication'],
      response: 'Monitor security settings and user access on the Security page. Review login attempts, manage permissions, and configure security policies.',
      category: 'general',
      language: 'en',
      userRole: 'admin'
    },
    {
      keywords: ['report', 'reports', 'analytics', 'statistics', 'data', 'metrics'],
      response: 'Generate and view system reports on the Reports page. Access user activity, financial reports, and system performance metrics.',
      category: 'general',
      language: 'en',
      userRole: 'admin'
    },
    {
      keywords: ['system', 'operations', 'maintenance', 'backup', 'database', 'server'],
      response: 'Manage system operations and maintenance tasks on the Operations page. Monitor system health, perform backups, and handle database maintenance.',
      category: 'general',
      language: 'en',
      userRole: 'admin'
    },
    {
      keywords: ['announcement', 'announcements', 'notify', 'notification', 'broadcast', 'message'],
      response: 'Send system-wide announcements and notifications to all users through the announcement system on your dashboard.',
      category: 'general',
      language: 'en',
      userRole: 'admin'
    },
    {
      keywords: ['how', 'what', 'where', 'guide', 'tutorial', 'instructions'],
      response: 'I can help you with user management, security settings, system reports, operations, and sending announcements. What would you like to know?',
      category: 'general',
      language: 'en',
      userRole: 'admin'
    },

    // Zulu FAQs for Caretakers
    {
      keywords: ['umsebenzi', 'imisebenzi', 'ukuphathwa', 'ishedyuli'],
      response: 'Ungabona imisebenzi yakho ekunikeziwe ekhoneni leMisebenzi. Bheka ishedyuli yakho futhi uphawule imisebenzi njengoba iphothiwe.',
      category: 'tasks',
      language: 'zu',
      userRole: 'caretaker'
    },
    {
      keywords: ['ukulungisa', 'ukusebenza', 'ephukile', 'inkinga'],
      response: 'Ungabona futhi uphathe izicelo zokulungisa ekhoneni lokuLungisa. Buyekeza isimo futhi wengeze amanothi uma usebenza ekulungiseni.',
      category: 'maintenance',
      language: 'zu',
      userRole: 'caretaker'
    },
    {
      keywords: ['ishedyuli', 'ikhalenda', 'ukubonana', 'nini', 'isikhathi'],
      response: 'Bheka ishedyuli yakho ekhoneni leShedyuli ukubona imisebenzi ezayo neziqeshana zokulungisa.',
      category: 'schedule',
      language: 'zu',
      userRole: 'caretaker'
    },

    // Zulu FAQs for Admins
    {
      keywords: ['umsebenzisi', 'abasebenzisi', 'i-akhawunti', 'ama-akhawunti', 'ukuphatha'],
      response: 'Ungaphatha ama-akhawunti abasebenzisi ekhoneni laBasebenzisi. Wengeze abasebenzisi abasha, shintsha izimvume, noma uvale ama-akhawunti njengoba kudingeka.',
      category: 'general',
      language: 'zu',
      userRole: 'admin'
    },
    {
      keywords: ['ukuphepha', 'izimvume', 'ukufinyelela', 'ukungena', 'iphasiwedi'],
      response: 'Qaphela izilungiselelo zokuphepha nokufinyelela kwabasebenzisi ekhoneni lokuPhepha. Buyekeza imizamo yokungena, uphatha izimvume, futhi ulungiselele izinqubomgomo zokuphepha.',
      category: 'general',
      language: 'zu',
      userRole: 'admin'
    },
    {
      keywords: ['umbiko', 'imibiko', 'ukuhlaziya', 'izibalo', 'idatha'],
      response: 'Khiqiza futhi ubuke imibiko yesistimu ekhoneni leMibiko. Finyelela ukusebenza kwabasebenzisi, imibiko yezimali, nezibalo zokusebenza kwesistimu.',
      category: 'general',
      language: 'zu',
      userRole: 'admin'
    }
  ];

  findResponse(userMessage: string, language: 'en' | 'zu' = 'en', userRole: 'tenant' | 'caretaker' | 'manager' | 'admin' = 'tenant'): { response: string; action?: { label: string; route: string } } | null {
    const normalizedMessage = userMessage.toLowerCase();
    
    // First try exact keyword matching
    for (const faq of this.faqs) {
      if (faq.language !== language) continue;
      if (faq.userRole !== userRole && faq.userRole !== 'all') continue;
      
      const keywordMatch = faq.keywords.some(keyword => 
        normalizedMessage.includes(keyword.toLowerCase())
      );
      
      if (keywordMatch) {
        this.failedReplies = 0;
        return { response: faq.response, action: faq.action };
      }
    }

    let bestMatch: { faq: FAQItem; score: number } | null = null;
    const threshold = 0.3;

    for (const faq of this.faqs) {
      if (faq.language !== language) continue;
      if (faq.userRole !== userRole && faq.userRole !== 'all') continue;

      for (const keyword of faq.keywords) {
        const similarity = this.calculateSimilarity(normalizedMessage, keyword.toLowerCase());

        if (similarity >= threshold && (!bestMatch || similarity > bestMatch.score)) {
          bestMatch = { faq, score: similarity };
        }
      }
    }

    if (bestMatch) {
      this.failedReplies = 0;
      return { response: bestMatch.faq.response, action: bestMatch.faq.action };
    }

    this.failedReplies++;
    return null;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    // Simple word-based similarity calculation
    const words1 = str1.split(/\s+/).filter(word => word.length > 2);
    const words2 = str2.split(/\s+/).filter(word => word.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    let matches = 0;
    
    for (const word1 of words1) {
      for (const word2 of words2) {
        // Check for exact matches
        if (word1 === word2) {
          matches += 1;
          continue;
        }
        
        // Check for partial matches (substring)
        if (word1.includes(word2) || word2.includes(word1)) {
          matches += 0.7;
          continue;
        }
        
        // Check for similar words using Levenshtein distance
        const distance = this.levenshteinDistance(word1, word2);
        const maxLength = Math.max(word1.length, word2.length);
        const similarity = 1 - (distance / maxLength);
        
        if (similarity > 0.6) {
          matches += similarity * 0.5;
        }
      }
    }
    
    return matches / Math.max(words1.length, words2.length);
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  async processMessage(userMessage: string, language: 'en' | 'zu' = 'en', userRole: 'tenant' | 'caretaker' | 'manager' | 'admin' = 'tenant', route?: string): Promise<ChatMessage> {
    let responseText: string | null = null;
    let action: { label: string; route: string } | undefined = undefined;

    if (this.useBricllm) {
      const bricllmResult = await bricllmService.query({
        message: userMessage,
        role: userRole,
        language: language,
        route: route
      });

      if (bricllmResult && bricllmResult.response) {
        responseText = bricllmResult.response;
        this.failedReplies = 0;
      } else {
        const faqResult = this.findResponse(userMessage, language, userRole);
        if (faqResult) {
          responseText = faqResult.response;
          action = faqResult.action;
        }
      }
    } else {
      const faqResult = this.findResponse(userMessage, language, userRole);
      if (faqResult) {
        responseText = faqResult.response;
        action = faqResult.action;
      }
    }

    if (responseText) {
      return {
        id: Date.now().toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text',
        action: action
      };
    }
    
    // Role-specific default responses for unmatched queries
    const defaultResponses = {
      tenant: {
        en: this.failedReplies >= this.maxFailedReplies 
          ? "I'm having trouble understanding your request. Let me connect you with a human agent who can better assist you."
          : "I don't understand that question. Could you try rephrasing it? You can ask about rent payments, maintenance issues, lease information, or general support.",
        zu: this.failedReplies >= this.maxFailedReplies
          ? "Ngiyathola inkinga ekuzweni isicelo sakho. Ngivumele ngikuxhumanise nomuntu ongakusiza kangcono."
          : "Angiqondi lowo mbuzo. Ungazama ukuwushisa kabusha? Ungabuza ngokukhokha intsimbi, izinkinga zokulungisa, imininingwane ye-lease, noma usizo."
      },
      caretaker: {
        en: this.failedReplies >= this.maxFailedReplies 
          ? "I'm having trouble understanding your request. Let me connect you with a supervisor who can better assist you."
          : "I don't understand that question. Could you try rephrasing it? You can ask about your tasks, maintenance requests, schedule, or work history.",
        zu: this.failedReplies >= this.maxFailedReplies
          ? "Ngiyathola inkinga ekuzweni isicelo sakho. Ngivumele ngikuxhumanise nomphathi ongakusiza kangcono."
          : "Angiqondi lowo mbuzo. Ungazama ukuwushisa kabusha? Ungabuza ngemisebenzi yakho, izicelo zokulungisa, ishedyuli, noma umlando womsebenzi."
      },
      manager: {
        en: this.failedReplies >= this.maxFailedReplies 
          ? "I'm having trouble understanding your request. Let me connect you with technical support."
          : "I don't understand that question. Could you try rephrasing it? You can ask about property management, leases, payments, or reports.",
        zu: this.failedReplies >= this.maxFailedReplies
          ? "Ngiyathola inkinga ekuzweni isicelo sakho. Ngivumele ngikuxhumanise nosizo lwezobuchwepheshe."
          : "Angiqondi lowo mbuzo. Ungazama ukuwushisa kabusha? Ungabuza ngokuphatha izakhiwo, amaqashi, izinkokhelo, noma imibiko."
      },
      admin: {
        en: this.failedReplies >= this.maxFailedReplies 
          ? "I'm having trouble understanding your request. Let me escalate this to senior support."
          : "I don't understand that question. Could you try rephrasing it? You can ask about system administration, user management, security, or reports.",
        zu: this.failedReplies >= this.maxFailedReplies
          ? "Ngiyathola inkinga ekuzweni isicelo sakho. Ngivumele ngiphakamise lokhu kosizo oluphezulu."
          : "Angiqondi lowo mbuzo. Ungazama ukuwushisa kabusha? Ungabuza ngokuphatha uhlelo, ukuphatha abasebenzisi, ukuphepha, noma imibiko."
      }
    };
    
    return {
      id: Date.now().toString(),
      text: defaultResponses[userRole][language],
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

  // Chat session management
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