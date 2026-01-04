'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  MessageSquareIcon, 
  XIcon, 
  SendIcon, 
  BotIcon, 
  UserIcon,
  Loader2Icon,
  MinusIcon,
  Maximize2Icon
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Maaf, saya sedang mengalami kendala teknis. Silakan coba lagi nanti.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Terjadi kesalahan koneksi. Pastikan internet Anda aktif.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-accent text-slate-950 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all z-50 group active:scale-95 ring-4 ring-accent/20"
      >
        <MessageSquareIcon size={28} strokeWidth={2.5} />
        <span className="absolute right-full mr-4 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 shadow-xl pointer-events-none">
          Tanya Illyas AI
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-[400px] max-w-[calc(100vw-3rem)] ${isMinimized ? 'h-auto' : 'h-[600px] max-h-[calc(100vh-8rem)]'} glass-card rounded-[2.5rem] shadow-2xl flex flex-col z-50 overflow-hidden animate-fade-in ring-1 ring-white/10`}>
      {/* Header */}
      <div className="p-6 bg-white/5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center text-accent ring-1 ring-accent/30">
            <BotIcon size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="font-bold text-white tracking-tight">Illyas Finance AI</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all"
          >
            {isMinimized ? <Maximize2Icon size={18} /> : <MinusIcon size={18} />}
          </button>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
          >
            <XIcon size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 && (
              <div className="text-center py-10">
                <div className="inline-flex p-4 bg-white/5 rounded-3xl mb-4 text-gray-500">
                  <BotIcon size={32} />
                </div>
                <h4 className="text-white font-bold mb-2">Halo! Saya Illyas AI</h4>
                <p className="text-gray-500 text-sm max-w-[200px] mx-auto leading-relaxed">
                  Tanyakan apa saja tentang pengelolaan keuangan Anda di sini.
                </p>
              </div>
            )}
            
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    msg.role === 'user' ? 'bg-accent/10 text-accent' : 'bg-white/10 text-white'
                  }`}>
                    {msg.role === 'user' ? <UserIcon size={14} /> : <BotIcon size={14} />}
                  </div>
                  <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-accent text-slate-950 font-medium rounded-tr-none shadow-lg shadow-accent/10' 
                      : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 text-white flex items-center justify-center">
                    <BotIcon size={14} />
                  </div>
                  <div className="bg-white/5 border border-white/10 p-4 rounded-[1.5rem] rounded-tl-none">
                    <Loader2Icon size={18} className="text-accent animate-spin" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 bg-white/5 border-t border-white/10">
            <form onSubmit={handleSend} className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pesan..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-accent text-slate-950 rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg shadow-accent/20"
              >
                <SendIcon size={18} strokeWidth={2.5} />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
