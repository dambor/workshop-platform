import React from 'react';
import mermaid from 'mermaid';
import { StepContent, WorkshopStep } from '../types';

mermaid.initialize({
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    background: 'transparent',
    primaryColor: '#3f3f46',
    primaryTextColor: '#f4f4f5',
    primaryBorderColor: '#71717a',
    lineColor: '#a1a1aa',
    secondaryColor: '#27272a',
    tertiaryColor: '#27272a',
    edgeLabelBackground: '#27272a',
    clusterBkg: '#18181b',
    clusterBorder: '#52525b',
    titleColor: '#f4f4f5',
    nodeTextColor: '#f4f4f5',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  },
});

// --- individual renderers, each with hooks at the top level ---

const inline = (text: string) =>
  text
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="text-langflow-accent font-semibold">$1</strong>')
    .replace(/`([^`]+)`/gim, '<code class="bg-black/30 text-pink-300 px-1.5 py-0.5 rounded text-sm border border-white/10">$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" class="text-blue-400 hover:text-blue-300 underline underline-offset-4">$1</a>');

const parseRow = (row: string) => row.split('|').slice(1, -1).map((c) => c.trim());
const isSeparator = (line: string) => /^\|[\s\-:|]+\|$/.test(line.trim());

const TextBlock: React.FC<{ value: string }> = ({ value }) => {
  const lines = value.split('\n');
  const parts: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    // Table: current line has pipes and next line is a separator row
    if (trimmed.startsWith('|') && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const headers = parseRow(tableLines[0]);
      const rows = tableLines.slice(2).map(parseRow);

      let t = `<div class="my-6 overflow-x-auto rounded-lg border border-white/10">`;
      t += `<table class="w-full text-sm border-collapse">`;
      t += `<thead><tr>`;
      headers.forEach((h) => {
        t += `<th class="px-4 py-3 text-left text-white font-semibold bg-white/5 border-b border-white/10 whitespace-nowrap">${inline(h)}</th>`;
      });
      t += `</tr></thead><tbody>`;
      rows.forEach((row, ri) => {
        t += `<tr class="${ri % 2 === 1 ? 'bg-white/[0.02]' : ''}">`;
        row.forEach((cell) => {
          t += `<td class="px-4 py-2.5 text-gray-300 border-t border-white/5">${inline(cell)}</td>`;
        });
        t += `</tr>`;
      });
      t += `</tbody></table></div>`;
      parts.push(t);
      continue;
    }

    // Headings
    const h1 = trimmed.match(/^# (.+)$/);
    const h2 = trimmed.match(/^## (.+)$/);
    const h3 = trimmed.match(/^### (.+)$/);
    if (h1) {
      parts.push(`<h1 class="text-3xl font-bold text-white mb-6 mt-2">${inline(h1[1])}</h1>`);
    } else if (h2) {
      parts.push(`<h2 class="text-2xl font-semibold text-white mb-4 mt-8 pb-2 border-b border-white/10">${inline(h2[1])}</h2>`);
    } else if (h3) {
      parts.push(`<h3 class="text-xl font-medium text-langflow-primary mb-3 mt-6">${inline(h3[1])}</h3>`);
    } else if (trimmed === '') {
      parts.push('<br />');
    } else {
      parts.push(inline(trimmed) + '<br />');
    }
    i++;
  }

  return (
    <div
      className="text-gray-300 leading-relaxed mb-4 text-lg"
      dangerouslySetInnerHTML={{ __html: parts.join('') }}
    />
  );
};

const CodeBlock: React.FC<{ value: string; language?: string; small?: boolean }> = ({ value, language, small }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 relative group">
      <div className="absolute top-0 right-0 flex items-center">
        <div className="px-3 py-1 text-xs font-mono text-gray-500 bg-black/40 rounded-bl border-b border-l border-white/10">
          {language}
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
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </span>
          )}
        </button>
      </div>
      <pre className={`bg-[#0f0f11] border border-white/10 p-4 rounded-lg overflow-x-auto font-mono text-gray-200 shadow-inner pt-8 ${small ? 'text-xs' : 'text-sm'}`}>
        <code>{value}</code>
      </pre>
    </div>
  );
};

const ImageBlock: React.FC<{ value: string; alt?: string; width?: string }> = ({ value, alt, width }) => (
  <div className="my-8 flex flex-col items-center">
    <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl" style={{ width: width ?? '100%' }}>
      <img src={value} alt={alt} className="w-full h-auto object-cover" />
    </div>
    {alt && <p className="text-center text-gray-500 text-sm mt-2 italic">{alt}</p>}
  </div>
);

const WarningBlock: React.FC<{ value: string }> = ({ value }) => (
  <div className="my-6 bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r text-yellow-200">
    <div className="flex items-start gap-3">
      <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <div>{value}</div>
    </div>
  </div>
);

const TipBlock: React.FC<{ value: string }> = ({ value }) => (
  <div className="my-6 bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r text-blue-100">
    <div className="flex items-start gap-3">
      <svg className="w-6 h-6 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div>{value}</div>
    </div>
  </div>
);

const MermaidDiagram: React.FC<{ chart: string; width?: string }> = ({ chart, width }) => {
  const [svgHtml, setSvgHtml] = React.useState('');
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;
    let cancelled = false;
    setError(false);

    mermaid.render(id, chart)
      .then(({ svg }) => {
        if (cancelled) return;

        const temp = document.createElement('div');
        temp.innerHTML = svg;
        const svgEl = temp.querySelector('svg');
        if (svgEl) {
          svgEl.setAttribute('width', '100%');
          svgEl.removeAttribute('height');
          // Override the background rect via the embedded <style> block
          const styleEl = svgEl.querySelector('style');
          if (styleEl) styleEl.textContent += '\n.background { fill: transparent !important; }';
          const bgEl = svgEl.querySelector('.background');
          if (bgEl) (bgEl as SVGElement).style.fill = 'transparent';
        }

        setSvgHtml(temp.innerHTML);
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('Mermaid render error:', err);
          setError(true);
        }
      });

    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return (
      <pre className="my-8 p-4 bg-red-900/20 border border-red-500/30 rounded text-red-300 text-xs overflow-x-auto">
        {chart}
      </pre>
    );
  }

  if (!svgHtml) {
    return <div className="my-8 h-40 animate-pulse bg-white/5 rounded-lg" />;
  }

  return (
    <div className="my-8 overflow-x-auto flex justify-center">
      <div
        style={{ width: width ?? '100%' }}
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />
    </div>
  );
};

// --- dispatcher ---

const RenderItem: React.FC<{ item: StepContent }> = ({ item }) => {
  switch (item.type) {
    case 'text':    return <TextBlock value={item.value} />;
    case 'code':    return <CodeBlock value={item.value} language={item.language} small={item.small} />;
    case 'image':   return <ImageBlock value={item.value} alt={item.alt} width={item.width} />;
    case 'warning': return <WarningBlock value={item.value} />;
    case 'tip':     return <TipBlock value={item.value} />;
    case 'mermaid': return <MermaidDiagram chart={item.value} width={item.width} />;
    default:        return null;
  }
};

// --- page ---

interface ContentAreaProps {
  step: WorkshopStep;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

export const ContentArea: React.FC<ContentAreaProps> = ({ step, onNext, onPrev, isFirst, isLast }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [step.id]);

  return (
    <div className="flex-1 h-screen overflow-hidden flex flex-col bg-langflow-bg relative">
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

      <main ref={scrollRef} className="flex-1 overflow-y-auto w-full">
        <div className="max-w-5xl mx-auto p-8 lg:px-24">
          {step.content.map((item, idx) => (
            <RenderItem key={idx} item={item} />
          ))}
          <div className="h-24" />
        </div>
      </main>
    </div>
  );
};
