interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'escalation';
}

interface FAQItem {
  keywords: string[];
  response: string;
  category: 'rent' | 'maintenance' | 'lease' | 'general';
  language: 'en' | 'zu';
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

  private faqs: FAQItem[] = [
    // English FAQs
    {
      keywords: ['rent', 'payment', 'pay', 'due', 'when', 'how much', 'cost', 'money', 'bill'],
      response: 'Your monthly rent is due on the 1st of each month. You can check your exact amount and due date in the Payments section of your dashboard.',
      category: 'rent',
      language: 'en'
    },
    {
      keywords: ['late', 'overdue', 'penalty', 'fee', 'missed', 'behind'],
      response: 'Late payment fees may apply if rent is not paid within 7 days of the due date. Please contact your property manager for specific late fee information.',
      category: 'rent',
      language: 'en'
    },
    {
      keywords: ['maintenance', 'repair', 'broken', 'issue', 'problem', 'fix', 'not working', 'damaged'],
      response: 'You can report maintenance issues through the Maintenance Requests page. Include photos and describe the problem in detail for faster resolution.',
      category: 'maintenance',
      language: 'en'
    },
    {
      keywords: ['lease', 'contract', 'agreement', 'end', 'renewal', 'extend', 'terminate'],
      response: 'You can view your lease agreement in the Lease Management section. For renewal questions, contact your property manager 60 days before expiry.',
      category: 'lease',
      language: 'en'
    },
    {
      keywords: ['contact', 'manager', 'help', 'support', 'assistance', 'question'],
      response: 'You can contact your property manager through the Communication page or call the property management office during business hours.',
      category: 'general',
      language: 'en'
    },
    {
      keywords: ['emergency', 'urgent', 'water', 'electricity', 'gas', 'leak', 'fire'],
      response: 'For emergencies like water leaks, electrical issues, or gas problems, call the emergency hotline immediately and also log the issue in Maintenance Requests.',
      category: 'maintenance',
      language: 'en'
    },
    {
      keywords: ['how', 'what', 'where', 'guide', 'tutorial', 'instructions'],
      response: 'I can help you with rent payments, maintenance requests, lease information, and contacting your property manager. What would you like to know?',
      category: 'general',
      language: 'en'
    },

    // Zulu FAQs (Basic translations)
    {
      keywords: ['intsimbi', 'ukukhokha', 'nini', 'malini'],
      response: 'Intsimbi yakho yenyanga kumele ikhokhelwe ngomhla we-1 wenyanga ngayinye. Ungabheka imali yakho nesikhathi sokukhokha kuleli khona Payments.',
      category: 'rent',
      language: 'zu'
    },
    {
      keywords: ['ukusebenza', 'ukulungisa', 'ephukile', 'inkinga'],
      response: 'Ungabika izinkinga zokulungisa nge-Maintenance Requests page. Faka izithombe nochaze inkinga ngokuphelele ukuze zilungiswe ngokushesha.',
      category: 'maintenance',
      language: 'zu'
    },
    {
      keywords: ['ukuphila', 'isivumelwano', 'ukuphela', 'ukuvuselela'],
      response: 'Ungabona isivumelwano sakho se-lease ku-Lease Management section. Emibuzo yokuvuselela, xhumana ne-property manager ezinsukwini ezingu-60 ngaphambi kokuphela.',
      category: 'lease',
      language: 'zu'
    },
    {
      keywords: ['usizo', 'uxhumana', 'isidingo'],
      response: 'Ungaxhumana ne-property manager yakho nge-Communication page noma ushaye nge-business hours.',
      category: 'general',
      language: 'zu'
    }
  ];

  findResponse(userMessage: string, language: 'en' | 'zu' = 'en'): string | null {
    const normalizedMessage = userMessage.toLowerCase();
    
    // First try exact keyword matching
    for (const faq of this.faqs) {
      if (faq.language !== language) continue;
      
      const keywordMatch = faq.keywords.some(keyword => 
        normalizedMessage.includes(keyword.toLowerCase())
      );
      
      if (keywordMatch) {
        this.failedReplies = 0; // Reset failed replies on successful match
        return faq.response;
      }
    }
    
    // If no exact match, try fuzzy matching with similarity scoring
    let bestMatch: { faq: FAQItem; score: number } | null = null;
    const threshold = 0.3; // Minimum similarity threshold
    
    for (const faq of this.faqs) {
      if (faq.language !== language) continue;
      
      for (const keyword of faq.keywords) {
        const similarity = this.calculateSimilarity(normalizedMessage, keyword.toLowerCase());
        
        if (similarity >= threshold && (!bestMatch || similarity > bestMatch.score)) {
          bestMatch = { faq, score: similarity };
        }
      }
    }
    
    if (bestMatch) {
      this.failedReplies = 0; // Reset failed replies on successful match
      return bestMatch.faq.response;
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

  processMessage(userMessage: string, language: 'en' | 'zu' = 'en'): ChatMessage {
    const response = this.findResponse(userMessage, language);
    
    if (response) {
      return {
        id: Date.now().toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
    }
    
    // Default responses for unmatched queries
    const defaultResponses = {
      en: this.failedReplies >= this.maxFailedReplies 
        ? "I'm having trouble understanding your request. Let me connect you with a human agent who can better assist you."
        : "I don't understand that question. Could you try rephrasing it? You can ask about rent payments, maintenance issues, lease information, or general support.",
      zu: this.failedReplies >= this.maxFailedReplies
        ? "Ngiyathola inkinga ekuzweni isicelo sakho. Ngivumele ngikuxhumanise nomuntu ongakusiza kangcono."
        : "Angiqondi lowo mbuzo. Ungazama ukuwushisa kabusha? Ungabuza ngokukhokha intsimbi, izinkinga zokulungisa, imininingwane ye-lease, noma usizo."
    };
    
    return {
      id: Date.now().toString(),
      text: defaultResponses[language],
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

      await fetch('/api/chat-messages', {
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
      const response = await fetch(`/api/chat-messages?userId=${userId}`);
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
      await fetch('/api/chat-escalations', {
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