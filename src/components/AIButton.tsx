import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatbotService } from '../services/chatbot.ts';
import { notificationService } from '../services/notifications.ts';

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

interface AIButtonProps {
  userId: string;
  language?: 'en' | 'zu';
  userRole?: 'tenant' | 'caretaker' | 'manager' | 'admin';
  onEscalate?: () => void;
}

const AIButton: React.FC<AIButtonProps> = ({ userId, language = 'en', userRole = 'tenant', onEscalate }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getQuickReplies = () => {
    if (userRole === 'caretaker') {
      return language === 'en' 
        ? ['View my tasks', 'Check maintenance requests', 'What\'s my schedule?', 'Show work history']
        : ['Bheka imisebenzi yami', 'Bheka izicelo zokulungisa', 'Yini ishedyuli yami?', 'Bonisa umlando womsebenzi'];
    }
    if (userRole === 'manager') {
      return language === 'en' 
        ? ['View properties', 'Check lease status', 'Review payments', 'Maintenance overview']
        : ['Bheka izakhiwo', 'Bheka isimo samaqashi', 'Buyekeza izinkokhelo', 'Ukubuka ukulungisa'];
    }
    if (userRole === 'admin') {
      return language === 'en' 
        ? ['Manage users', 'Check system reports', 'Security settings', 'Send announcement']
        : ['Phatha abasebenzisi', 'Bheka imibiko yesistimu', 'Izilungiselelo zokuphepha', 'Thumela isimemezelo'];
    }
    return language === 'en' 
      ? ['How do I pay my rent?', 'I need to report an issue', 'When is rent due?', 'Contact my manager']
      : ['Ngingakhokha kanjani irenti?', 'Ngidinga ukubika inkinga', 'Irenti lidingeka nini?', 'Xhumana nomphathi wami'];
  };

  const quickReplies = getQuickReplies();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const loadChatHistory = async () => {
    try {
      const history = await chatbotService.getChatHistory(userId);
      setMessages(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
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

  const handleQuickReply = (reply: string) => {
    setInputText(reply);
  };

  const openChat = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      loadChatHistory();
      // Add welcome message
      const getWelcomeMessage = () => {
        if (userRole === 'caretaker') {
          return language === 'en' 
            ? 'Hello! I\'m your AI assistant. I can help you with your tasks, maintenance requests, schedule, and work history. How can I help you today?'
            : 'Sawubona! Ngingumsizi wakho we-AI. Ngingakusiza ngemisebenzi yakho, izicelo zokulungisa, ishedyuli, nomlando womsebenzi. Ngingakusiza kanjani namuhla?';
        }
        if (userRole === 'manager') {
          return language === 'en' 
            ? 'Hello! I\'m your AI assistant. I can help you with property management, lease agreements, rent collection, maintenance oversight, and reporting. How can I help you today?'
            : 'Sawubona! Ngingumsizi wakho we-AI. Ngingakusiza ngokuphatha izakhiwo, izivumelwano zokukodisha, ukuqoqa intsimbi, ukubheka ukulungisa, nemibiko. Ngingakusiza kanjani namuhla?';
        }
        if (userRole === 'admin') {
          return language === 'en' 
            ? 'Hello! I\'m your AI assistant. I can help you with user management, system reports, security settings, operations, and announcements. How can I help you today?'
            : 'Sawubona! Ngingumsizi wakho we-AI. Ngingakusiza ngokuphatha abasebenzisi, imibiko yesistimu, izilungiselelo zokuphepha, ukusebenza, nezimemezelo. Ngingakusiza kanjani namuhla?';
        }
        return language === 'en' 
          ? 'Hello! I\'m your AI assistant. How can I help you today?'
          : 'Sawubona! Ngingumsizi wakho we-AI. Ngingakusiza kanjani namuhla?';
      };

      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        text: getWelcomeMessage(),
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages([welcomeMessage]);
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={openChat}
        className="ai-button"
        title={language === 'en' ? 'Chat with AI Assistant' : 'Xoxa nomsizi we-AI'}
      >
        AI Assistant
      </button>
    );
  }

  return (
    <div className="ai-chatbot-modal">
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
              {message.action && message.sender === 'bot' && (
                <button
                  type="button"
                  onClick={() => navigate(message.action!.route)}
                  className="ai-action-button"
                >
                  {message.action.label}
                </button>
              )}
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
      </div>

      <div className="ai-quick-replies-container">
        <p className="ai-quick-replies-label">
          {language === 'en' ? 'Quick suggestions:' : 'Iziphakamiso ezisheshayo:'}
        </p>
        <div className="ai-quick-replies-buttons">
          {quickReplies.map((reply) => (
            <button
              key={reply}
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

export default AIButton;