import React, { useState, useEffect, useRef } from 'react';
import { chatbotService } from '../services/chatbot.ts';
import { notificationService } from '../services/notifications.ts';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'escalation';
}

interface ChatbotProps {
  userId: string;
  language?: 'en' | 'zu';
  userRole?: 'tenant' | 'caretaker' | 'manager' | 'admin';
  onEscalate?: () => void;
}

const AIChatbot: React.FC<ChatbotProps> = ({ userId, language = 'en', userRole = 'tenant', onEscalate }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
      // Add welcome message
      const getWelcomeMessage = () => {
        if (userRole === 'caretaker') {
          return language === 'en' 
            ? "Hi! I'm your AI assistant. I can help you with your tasks, maintenance requests, schedule, and work history. How can I help you today?"
            : "Sawubona! Ngiyisisebenzi sakho se-AI. Ngingakusiza ngemisebenzi yakho, izicelo zokulungisa, ishedyuli, nomlando womsebenzi. Ngingakusiza kanjani namuhla?";
        }
        return language === 'en' 
          ? "Hi! I'm your AI assistant. I can help you with rent payments, maintenance requests, lease information, and general questions. How can I help you today?"
          : "Sawubona! Ngiyisisebenzi sakho se-AI. Ngingakusiza ngokukhokha intsimbi, izicelo zokulungisa, imininingwane ye-lease, nemibuzo ejwayelekile. Ngingakusiza kanjani namuhla?";
      };

      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: getWelcomeMessage(),
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => prev.length === 0 ? [welcomeMessage] : prev);
    }
  }, [isOpen, userId, language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const history = await chatbotService.getChatHistory(userId);
      if (history.length > 0) {
        setMessages(history);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    await chatbotService.saveMessage(userMessage, userId);

    const botResponse = await chatbotService.processMessage(inputText, language, userRole);

    setTimeout(async () => {
      setMessages(prev => [...prev, botResponse]);
      await chatbotService.saveMessage(botResponse, userId);

      if (botResponse.type === 'escalation') {
        await chatbotService.escalateToHuman(userId, inputText);
        if (onEscalate) {
          onEscalate();
        }
        await notificationService.sendEscalation(
          'Chat Support Request',
          `User needs human assistance with: "${inputText}"`
        );
      }

      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getQuickReplies = () => {
    if (userRole === 'caretaker') {
      return language === 'en' 
        ? ['View my tasks', 'Check maintenance requests', 'What\'s my schedule?', 'Show work history']
        : ['Bheka imisebenzi yami', 'Bheka izicelo zokulungisa', 'Yini ishedyuli yami?', 'Bonisa umlando womsebenzi'];
    }
    return language === 'en' 
      ? ['Check rent status', 'Report maintenance issue', 'View lease details', 'Contact manager']
      : ['Bheka isimo sentsimbi', 'Bika inkinga yokulungisa', 'Bheka imininingwane ye-lease', 'Xhumana ne-manager'];
  };

  const quickReplies = getQuickReplies();

  const handleQuickReply = (reply: string) => {
    setInputText(reply);
  };

  if (!isOpen) {
    return (
      <div className="ai-floating-button-container">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="ai-floating-button"
          title="Chat with AI Assistant"
        >
          <svg className="w-6 h-6" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="ai-floating-chatbot-modal">
      <div className="ai-chatbot-header">
        <div className="ai-chatbot-header-content">
          <div className="ai-status-indicator"></div>
          <span className="ai-chatbot-title">
            {language === 'en' ? 'AI Assistant' : 'Umsizi we-AI'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="ai-close-button"
        >
          ✕
        </button>
      </div>

      <div className="ai-messages-container">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`ai-message ${message.sender}`}
          >
            <div className={`ai-message-bubble ${message.sender} ${message.type === 'escalation' ? 'escalation' : ''}`}>
              <p className="ai-message-text">{message.text}</p>
              <p className="ai-message-time">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="ai-loading-indicator">
            <div className="ai-loading-bubble">
              <div className="ai-loading-dots">
                <div className="ai-loading-dot"></div>
                <div className="ai-loading-dot"></div>
                <div className="ai-loading-dot"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="ai-quick-replies-container">
        <div className="ai-quick-replies-buttons">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleQuickReply(reply)}
              className="ai-quick-reply-button"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      <div className="ai-input-container">
        <div className="ai-input-wrapper">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={language === 'en' ? 'Type your message...' : 'Bhala umlayezo wakho...'}
            className="ai-input"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="ai-send-button"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;