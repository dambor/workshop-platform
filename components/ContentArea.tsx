import React from 'react';
import { StepContent, WorkshopStep } from '../types';

interface ContentAreaProps {
  step: WorkshopStep;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const RenderItem: React.FC<{ item: StepContent }> = ({ item }) => {
  switch (item.type) {
    case 'text':
      // Basic markdown-like rendering for bold and headers
      const htmlContent = item.value
        .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-white mb-6 mt-2">$1</h1>')
        .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold text-white mb-4 mt-8 pb-2 border-b border-white/10">$1</h2>')
        .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium text-langflow-primary mb-3 mt-6">$1</h3>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-langflow-accent font-semibold">$1</strong>')
        .replace(/`([^`]+)`/gim, '<code class="bg-black/30 text-pink-300 px-1.5 py-0.5 rounded text-sm border border-white/10">$1</code>')
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" class="text-blue-400 hover:text-blue-300 underline underline-offset-4">$1</a>')
        .replace(/\n/gim, '<br />');

      return <div className="text-gray-300 leading-relaxed mb-4 text-lg" dangerouslySetInnerHTML={{ __html: htmlContent }} />;

    case 'code':
      // eslint-disable-next-line no-case-declarations
      const [copied, setCopied] = React.useState(false);

      // eslint-disable-next-line no-case-declarations
      const handleCopy = () => {
        navigator.clipboard.writeText(item.value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      };

      return (
        <div className="my-6 relative group">
          <div className="absolute top-0 right-0 flex items-center">
            <div className="px-3 py-1 text-xs font-mono text-gray-500 bg-black/40 rounded-bl border-b border-l border-white/10">
              {item.language}
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1 text-xs font-mono text-gray-400 bg-white/5 hover:bg-white/10 border-b border-l border-white/10 transition-colors flex items-center gap-1 rounded-bl-lg"
              title="Copy code"
            >
              {copied ? (
                <span className="text-green-400 font-bold">Copied!</span>
              ) : (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  Copy
                </span>
              )}
            </button>
          </div>

          <pre className="bg-[#0f0f11] border border-white/10 p-4 rounded-lg overflow-x-auto text-sm font-mono text-gray-200 shadow-inner pt-8">
            <code>{item.value}</code>
          </pre>
        </div>
      );

    case 'image':
      return (
        <div className="my-8 rounded-xl overflow-hidden border border-white/10 shadow-2xl">
          <img src={item.value} alt={item.alt} className="w-full h-auto object-cover" />
          {item.alt && <p className="text-center text-gray-500 text-sm mt-2 italic">{item.alt}</p>}
        </div>
      );

    case 'warning':
      return (
        <div className="my-6 bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r text-yellow-200">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            <div>{item.value}</div>
          </div>
        </div>
      );

    case 'tip':
      return (
        <div className="my-6 bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r text-blue-100">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <div>{item.value}</div>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export const ContentArea: React.FC<ContentAreaProps> = ({ step, onNext, onPrev, isFirst, isLast }) => {
  // Reset scroll on step change
  const scrollRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [step.id]);

  return (
    <div className="flex-1 h-screen overflow-hidden flex flex-col bg-langflow-bg relative">
      {/* Top Header / Breadcrumb */}
      <header className="h-16 border-b border-white/5 flex items-center px-8 bg-langflow-bg/50 backdrop-blur z-10 justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span>Workshop</span>
          <span>/</span>
          <span className="text-white font-medium">{step.title}</span>
        </div>
        <div className="text-xs font-mono px-2 py-1 bg-white/5 rounded border border-white/5 text-gray-400">
          Time: {step.duration}
        </div>
      </header>

      {/* Main Content Scroll Area */}
      <main ref={scrollRef} className="flex-1 overflow-y-auto w-full">
        <div className="max-w-5xl mx-auto p-8 lg:px-24">
          {step.content.map((item, idx) => (
            <RenderItem key={idx} item={item} />
          ))}

          <div className="h-24"></div> {/* Spacer */}
        </div>
      </main>

    </div>
  );
};
