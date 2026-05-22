import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Send, Sparkles, X } from 'lucide-react';
import { sendMessageToAssistant } from '../services/gemini';
import { ChatMessage } from '../types';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const CHAT_ENABLED = Boolean(import.meta.env.VITE_GEMINI_API_KEY);

export const ChatWidget: React.FC = () => {
  if (!CHAT_ENABLED) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! Ask me anything about this workshop and I will help you get unstuck.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    const history = messages.map(m => ({ role: m.role, text: m.text }));
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await sendMessageToAssistant(userMsg.text, history);
      const modelMsg: ChatMessage = { role: 'model', text: responseText, timestamp: Date.now() };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      const errorMsg: ChatMessage = { role: 'model', text: "Sorry, I encountered an error connecting to the assistant.", timestamp: Date.now() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">

      {/* Chat Window */}
      <div
        className={`pointer-events-auto bg-surface-1 border border-border-default rounded-3xl shadow-[var(--shadow-elevated)] mb-4 w-80 md:w-96 flex flex-col transition-all duration-300 origin-bottom-right overflow-hidden ${
          isOpen ? 'scale-100 opacity-100 h-[520px]' : 'scale-75 opacity-0 h-0 w-0'
        }`}
      >
        {/* Header */}
        <div className="relative px-4 py-3.5 border-b border-border-subtle bg-surface flex justify-between items-center">
          <div className="absolute inset-x-0 top-0 h-[3px] gemini-gradient" />
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full gemini-gradient flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-fg">AI Instructor</span>
              <span className="text-[10px] text-fg-subtle flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-gemini-indigo)] animate-pulse" />
                Online
              </span>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-fg-muted hover:text-fg p-1 rounded-md hover:bg-surface-2 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'gemini-gradient text-white rounded-br-md shadow-md'
                    : 'bg-surface-1 text-fg border border-border-subtle rounded-bl-md'
                }`}
              >
                {msg.role === 'user' ? (
                  msg.text
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                      a: ({ node, ...props }) => <a className="text-[var(--color-gemini-indigo)] hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                      code: ({ style, children, className, ...props }) => {
                        const isInline = !className;
                        return (
                          <code
                            className={`${className || ''} ${isInline ? 'bg-surface-2 text-[var(--color-gemini-purple)] px-1 py-0.5 rounded' : 'block bg-surface-2 p-2 rounded-lg overflow-x-auto text-xs my-2 font-mono'}`}
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface-1 rounded-2xl rounded-bl-md px-4 py-3 border border-border-subtle flex gap-1">
                <div className="w-1.5 h-1.5 bg-[var(--color-gemini-purple)] rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-[var(--color-gemini-indigo)] rounded-full animate-bounce delay-75"></div>
                <div className="w-1.5 h-1.5 bg-[var(--color-gemini-coral)] rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-border-subtle bg-surface-1">
          <div className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask for help…"
              className="w-full bg-surface text-fg rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-gemini-indigo)]/50 border border-border-default placeholder:text-fg-subtle"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full gemini-gradient text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close AI instructor' : 'Open AI instructor'}
        className={`pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-[0_8px_30px_-6px_rgba(177,110,231,0.5)] ${
          isOpen ? 'bg-surface-2 text-fg border border-border-default' : 'gemini-gradient text-white'
        }`}
      >
        {isOpen ? (
          <ChevronDown className="w-5 h-5" />
        ) : (
          <Sparkles className="w-6 h-6" />
        )}
      </button>
    </div>
  );
};
