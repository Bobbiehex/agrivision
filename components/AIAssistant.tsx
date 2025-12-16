
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Loader2, Trash2 } from 'lucide-react';
import { createChatSession, sendChatMessage } from '../services/geminiService';
import { ChatMessage } from '../types';
import { dbService } from '../services/db';
import { useLanguage } from '../context/LanguageContext';

export const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const { language } = useLanguage();

  // Initialize session on language change
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const sess = await createChatSession(language);
        if (mounted) chatSessionRef.current = sess;
      } catch (e) {
        console.warn('Failed to initialize chat session', e);
      }
    })();
    return () => { mounted = false; };
  }, [language]);

  // Load history from DB
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await dbService.getChatHistory();
        if (history.length > 0) {
          setMessages(history);
        } else {
          // Default welcome message if empty
          const welcomeMsg: ChatMessage = {
            id: '1',
            role: 'model',
            text: 'Hello! I am AgriBot. How can I assist you with your farm today? I can help with fertilizer schedules, disease treatment, or market insights.',
            timestamp: new Date()
          };
          setMessages([welcomeMsg]);
          await dbService.saveChatMessage(welcomeMsg);
        }
      } catch (e) {
        console.error("Failed to load chat history", e);
      } finally {
        setIsInitializing(false);
      }
    };
    loadHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isInitializing]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    
    // Save to DB
    await dbService.saveChatMessage(userMsg);

    try {
        if (!chatSessionRef.current) {
          chatSessionRef.current = await createChatSession(language);
        }
        const responseText = await sendChatMessage(chatSessionRef.current, userMsg.text);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      
      // Save to DB
      await dbService.saveChatMessage(botMsg);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-between items-center">
        <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Bot className="text-emerald-600" />
                AI Agricultural Advisor
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Powered by Gemini 2.5 Flash • History Saved</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-slate-800">
        {isInitializing ? (
           <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin text-slate-400" />
           </div>
        ) : (
            <>
                {messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div className={`
                    max-w-[80%] rounded-2xl p-4 shadow-sm
                    ${msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-none' 
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-none'}
                    `}>
                    <div className="flex items-center gap-2 mb-1 opacity-75 text-xs">
                        {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                        <span>{msg.role === 'user' ? 'You' : 'AgriBot'}</span>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed text-sm">
                        {msg.text}
                    </div>
                    </div>
                </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 text-slate-500 dark:text-slate-300 text-sm">
                            <Loader2 size={16} className="animate-spin" />
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </>
        )}
      </div>

      <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about pest control, irrigation scheduling..."
            className="flex-1 border border-slate-200 dark:border-slate-600 rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            disabled={isLoading}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-3 rounded-full disabled:opacity-50 transition-colors shadow-lg shadow-emerald-600/20"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
