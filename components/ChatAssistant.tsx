
import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToHolmes } from '../services/geminiService';
import { Message } from '../types';
import { Button } from './Button';

interface ChatAssistantProps {
  hint?: string | null; // Text to automatically inject from the game logic
  context?: string; // Hidden context about current step
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ hint, context }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "你好，小偵探。我是夏洛克·福爾摩斯。準備好用科學的力量來解開這個謎題了嗎？" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle external hints/context updates
  useEffect(() => {
    if (hint) {
      setMessages(prev => [...prev, { role: 'model', text: hint }]);
    }
  }, [hint]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const fullPrompt = context ? `[當前遊戲階段: ${context}] ${input}` : input;

      const stream = await sendMessageToHolmes(fullPrompt);
      
      let fullResponse = "";
      setMessages(prev => [...prev, { role: 'model', text: "" }]); 

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newHistory = [...prev];
          newHistory[newHistory.length - 1].text = fullResponse;
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Holmes is silent:", error);
      setMessages(prev => [...prev, { role: 'model', text: "抱歉，華生。剛才我的思維進入了記憶宮殿。你能再說一遍嗎？" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-slate-700 shadow-2xl w-full md:w-96 fixed right-0 top-0 bottom-0 z-50 md:relative md:z-auto font-serif">
      {/* Header */}
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex items-center gap-3 shadow-lg">
        <div className="w-12 h-12 rounded-full bg-amber-900 flex items-center justify-center text-amber-100 font-serif text-xl border-2 border-amber-600 shadow-amber-500/20 shadow-inner">
          <img src="https://api.iconify.design/noto:detective.svg" className="w-8 h-8 opacity-80" alt="Holmes" />
        </div>
        <div>
          <h2 className="font-bold text-amber-100 text-lg">AI 福爾摩斯</h2>
          <p className="text-xs text-amber-500/80 uppercase tracking-widest">首席科學顧問</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed shadow-lg ${
              msg.role === 'user' 
                ? 'bg-blue-700 text-white rounded-br-none' 
                : 'bg-slate-800 border border-slate-600 text-amber-50 rounded-bl-none'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="bg-slate-800 p-3 rounded-xl rounded-bl-none border border-slate-600">
               <div className="flex gap-1">
                 <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce"></div>
                 <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-100"></div>
                 <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce delay-200"></div>
               </div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-800 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-slate-900 border border-slate-600 text-amber-50 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 placeholder-slate-600 text-sm"
            placeholder="詢問福爾摩斯..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            className="!px-3 !py-2 !bg-amber-700 hover:!bg-amber-600 text-white shadow-lg"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
};
