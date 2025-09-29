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

    // Save user message
    await chatbotService.saveMessage(userMessage, userId);

    // Process with chatbot
    const botResponse = chatbotService.processMessage(inputText, language, userRole);
    
    // Add bot response after short delay
    setTimeout(async () => {
      setMessages(prev => [...prev, botResponse]);
      await chatbotService.saveMessage(botResponse, userId);
      
      // Handle escalation
      if (botResponse.type === 'escalation') {
        await chatbotService.escalateToHuman(userId, inputText);
        if (onEscalate) {
          onEscalate();
        }
        // Send notification to managers
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
      <div 
        className="fixed bottom-4 right-4 z-50"
        style={{ 
          position: 'fixed', 
          bottom: '16px', 
          right: '16px', 
          zIndex: 9999 
        }}
      >
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors pulse"
          title="Chat with AI Assistant"
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '16px',
            borderRadius: '50%',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div 
      className="fixed bottom-4 right-4 w-80 h-96 bg-white border border-gray-300 rounded-lg shadow-xl z-50 flex flex-col"
      style={{ 
        position: 'fixed', 
        bottom: '16px', 
        right: '16px', 
        zIndex: 9999,
        minWidth: '320px',
        minHeight: '384px'
      }}
    >
      {/* Header */}
      <div className="bg-blue-600 text-white p-3 rounded-t-lg flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span className="font-semibold">
            {language === 'en' ? 'AI Assistant' : 'Umsizi we-AI'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.type === 'escalation'
                  ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p>{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-3 py-2 border-t border-gray-200">
        <div className="flex flex-wrap gap-1">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleQuickReply(reply)}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={language === 'en' ? 'Type your message...' : 'Bhala umlayezo wakho...'}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;