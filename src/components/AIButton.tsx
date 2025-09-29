import React, { useState } from 'react';
import { chatbotService } from '../services/chatbot.ts';
import { notificationService } from '../services/notifications.ts';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'escalation';
}

interface AIButtonProps {
  userId: string;
  language?: 'en' | 'zu';
  userRole?: 'tenant' | 'caretaker' | 'manager' | 'admin';
  onEscalate?: () => void;
}

const AIButton: React.FC<AIButtonProps> = ({ userId, language = 'en', userRole = 'tenant', onEscalate }) => {
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
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '360px',
          height: '36px'
          
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#1d4ed8';
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#2563eb';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }}
      >
        AI Assistant
      </button>
    );
  }

  return (
    <div 
      style={{ 
        position: 'fixed', 
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '90%',
        maxWidth: '400px',
        height: '500px',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '16px',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            backgroundColor: '#10b981',
            borderRadius: '50%'
          }}></div>
          <span style={{ fontWeight: '600' }}>
            {language === 'en' ? 'AI Assistant' : 'Umsizi we-AI'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          style={{
            color: 'white',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0',
            lineHeight: '1'
          }}
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '8px 12px',
                borderRadius: '12px',
                fontSize: '14px',
                backgroundColor: (() => {
                  if (message.sender === 'user') return '#2563eb';
                  if (message.type === 'escalation') return '#fef3c7';
                  return '#f3f4f6';
                })(),
                color: (() => {
                  if (message.sender === 'user') return 'white';
                  if (message.type === 'escalation') return '#92400e';
                  return '#374151';
                })(),
                border: message.type === 'escalation' ? '1px solid #f59e0b' : 'none'
              }}
            >
              <p style={{ margin: 0 }}>{message.text}</p>
              <p style={{
                fontSize: '11px',
                margin: '4px 0 0 0',
                opacity: 0.7
              }}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              backgroundColor: '#f3f4f6',
              color: '#374151',
              padding: '8px 12px',
              borderRadius: '12px',
              fontSize: '14px'
            }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#9ca3af',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s ease-in-out infinite both'
                }}></div>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#9ca3af',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s ease-in-out 0.16s infinite both'
                }}></div>
                <div style={{
                  width: '8px',
                  height: '8px',
                  backgroundColor: '#9ca3af',
                  borderRadius: '50%',
                  animation: 'bounce 1.4s ease-in-out 0.32s infinite both'
                }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Replies */}
      <div style={{ padding: '0 16px 16px', borderTop: '1px solid #e5e7eb' }}>
        <p style={{ 
          fontSize: '12px', 
          color: '#6b7280', 
          margin: '8px 0 4px 0',
          fontWeight: '500'
        }}>
          {language === 'en' ? 'Quick suggestions:' : 'Iziphakamiso ezisheshayo:'}
        </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
            {quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => handleQuickReply(reply)}
                style={{
                  fontSize: '12px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
              >
                {reply}
              </button>
            ))}
          </div>
        </div>

      {/* Input */}
      <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={language === 'en' ? 'Type your message...' : 'Bhala umlayezo wakho...'}
            style={{
              flex: 1,
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '14px',
              outline: 'none'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            type="button"
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            style={{
              backgroundColor: inputText.trim() && !isLoading ? '#2563eb' : '#9ca3af',
              color: 'white',
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              cursor: inputText.trim() && !isLoading ? 'pointer' : 'not-allowed'
            }}
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