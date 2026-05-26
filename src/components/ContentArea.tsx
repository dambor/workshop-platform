import React from 'react';
import mermaid from 'mermaid';
import { Check, Copy, Info, AlertTriangle } from 'lucide-react';
import { StepContent, WorkshopStep } from '../types';
import { useTheme } from '../theme/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

// --- inline markdown helpers ---

const inline = (text: string) =>
  text
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-fg">$1</strong>')
    .replace(/`([^`]+)`/gim, '<code class="bg-surface-2 text-[var(--color-gemini-purple)] dark:text-[var(--color-gemini-pink)] px-1.5 py-0.5 rounded-md text-[0.9em] font-mono border border-border-subtle">$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" class="text-[var(--color-gemini-indigo)] hover:underline underline-offset-4">$1</a>');

const parseRow = (row: string) => row.split('|').slice(1, -1).map((c) => c.trim());
const isSeparator = (line: string) => /^\|[\s\-:|]+\|$/.test(line.trim());

const TextBlock: React.FC<{ value: string }> = ({ value }) => {
  const lines = value.split('\n');
  const parts: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (trimmed.startsWith('|') && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        tableLines.push(lines[i].trim());
        i++;
      }
      const headers = parseRow(tableLines[0]);
      const rows = tableLines.slice(2).map(parseRow);

      let t = `<div class="my-6 overflow-x-auto rounded-2xl border border-border-default">`;
      t += `<table class="w-full text-sm border-collapse">`;
      t += `<thead><tr>`;
      headers.forEach((h) => {
        t += `<th class="px-4 py-3 text-left text-fg font-semibold bg-surface-2 border-b border-border-default whitespace-nowrap">${inline(h)}</th>`;
      });
      t += `</tr></thead><tbody>`;
      rows.forEach((row, ri) => {
        t += `<tr class="${ri % 2 === 1 ? 'bg-surface-1' : ''}">`;
        row.forEach((cell) => {
          t += `<td class="px-4 py-2.5 text-fg-muted border-t border-border-subtle">${inline(cell)}</td>`;
        });
        t += `</tr>`;
      });
      t += `</tbody></table></div>`;
      parts.push(t);
      continue;
    }

    const h1 = trimmed.match(/^# (.+)$/);
    const h2 = trimmed.match(/^## (.+)$/);
    const h3 = trimmed.match(/^### (.+)$/);
    if (h1) {
      parts.push(`<h1 class="font-display text-4xl font-semibold tracking-tight text-fg mb-6 mt-2">${inline(h1[1])}</h1>`);
    } else if (h2) {
      parts.push(`<h2 class="font-display text-2xl font-semibold tracking-tight text-fg mb-4 mt-10 pb-3 border-b border-border-subtle">${inline(h2[1])}</h2>`);
    } else if (h3) {
      parts.push(`<h3 class="font-display text-xl font-medium tracking-tight gemini-gradient-text mb-3 mt-6">${inline(h3[1])}</h3>`);
    } else if (trimmed === '') {
      parts.push('<br />');
    } else {
      parts.push(inline(trimmed) + '<br />');
    }
    i++;
  }

  return (
    <div
      className="text-fg-muted leading-relaxed mb-4 text-[17px]"
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
    <div className="my-6 relative group rounded-2xl overflow-hidden border border-border-default bg-surface-2">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle bg-surface-1">
        <span className="text-xs font-mono text-fg-subtle">{language || 'plain'}</span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-fg-muted hover:text-fg transition-colors px-2 py-1 rounded-md hover:bg-surface-2"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[var(--color-gemini-indigo)]" />
              <span className="text-[var(--color-gemini-indigo)]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className={`p-4 overflow-x-auto font-mono text-fg ${small ? 'text-xs' : 'text-sm'} leading-relaxed`}>
        <code>{value}</code>
      </pre>
    </div>
  );
};

const ImageBlock: React.FC<{ value: string; alt?: string; width?: string }> = ({ value, alt, width }) => (
  <div className="my-8 flex flex-col items-center">
    <div className="rounded-2xl overflow-hidden border border-border-default shadow-[var(--shadow-elevated)]" style={{ width: width ?? '100%' }}>
      <img src={value} alt={alt} className="w-full h-auto object-cover" />
    </div>
    {alt && <p className="text-center text-fg-subtle text-sm mt-3 italic">{alt}</p>}
  </div>
);

const WarningBlock: React.FC<{ value: string }> = ({ value }) => (
  <div className="my-6 rounded-2xl border border-[var(--color-gemini-coral)]/30 bg-[var(--color-gemini-coral)]/8 p-5">
    <div className="flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-[var(--color-gemini-coral)]" />
      <div className="text-fg leading-relaxed text-[15px]">{value}</div>
    </div>
  </div>
);

const TipBlock: React.FC<{ value: string }> = ({ value }) => (
  <div className="my-6 rounded-2xl border border-[var(--color-gemini-indigo)]/30 bg-[var(--color-gemini-indigo)]/8 p-5">
    <div className="flex items-start gap-3">
      <Info className="w-5 h-5 shrink-0 mt-0.5 text-[var(--color-gemini-indigo)]" />
      <div className="text-fg leading-relaxed text-[15px]">{value}</div>
    </div>
  </div>
);

const MermaidDiagram: React.FC<{ chart: string; width?: string }> = ({ chart, width }) => {
  const { theme } = useTheme();
  const [svgHtml, setSvgHtml] = React.useState('');
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const isDark = theme === 'dark';
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        background: 'transparent',
        primaryColor: isDark ? '#1c1c28' : '#f1f3f7',
        primaryTextColor: isDark ? '#f4f4f7' : '#1f1f23',
        primaryBorderColor: '#b16ee7',
        lineColor: isDark ? '#a8a8b8' : '#5f6368',
        secondaryColor: isDark ? '#272736' : '#e8ebf2',
        tertiaryColor: isDark ? '#13131c' : '#f8f9fb',
        edgeLabelBackground: isDark ? '#1c1c28' : '#ffffff',
        clusterBkg: isDark ? '#13131c' : '#f8f9fb',
        clusterBorder: isDark ? '#3a3a4a' : '#d8dbe2',
        titleColor: isDark ? '#f4f4f7' : '#1f1f23',
        nodeTextColor: isDark ? '#f4f4f7' : '#1f1f23',
        fontFamily: 'Google Sans, Inter, ui-sans-serif, system-ui, sans-serif',
      },
    });

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
  }, [chart, theme]);

  if (error) {
    return (
      <pre className="my-8 p-4 bg-[var(--color-gemini-coral)]/10 border border-[var(--color-gemini-coral)]/30 rounded-2xl text-[var(--color-gemini-coral)] text-xs overflow-x-auto">
        {chart}
      </pre>
    );
  }

  if (!svgHtml) {
    return <div className="my-8 h-40 animate-pulse bg-surface-2 rounded-2xl" />;
  }

  return (
    <div className="my-8 overflow-x-auto flex justify-center p-6 rounded-2xl border border-border-subtle bg-surface-1">
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

export const ContentArea: React.FC<ContentAreaProps> = ({ step }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [step?.id]);

  // Defensive guard: never crash if an out-of-range/undefined step is passed in.
  if (!step) return null;

  return (
    <div className="flex-1 h-screen overflow-hidden flex flex-col bg-surface relative">
      <header className="h-16 border-b border-border-subtle flex items-center px-8 bg-surface/70 backdrop-blur-xl z-10 justify-between">
        <div className="flex items-center gap-2 text-sm text-fg-muted min-w-0">
          <span>Workshop</span>
          <span className="text-fg-subtle">/</span>
          <span className="text-fg font-medium truncate">{step.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-medium px-3 py-1.5 bg-surface-1 rounded-full border border-border-subtle text-fg-muted">
            {step.duration}
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto w-full">
        <div className="max-w-4xl mx-auto px-8 py-12 lg:px-16">
          {step.content.map((item, idx) => (
            <RenderItem key={idx} item={item} />
          ))}
          <div className="h-24" />
        </div>
      </main>
    </div>
  );
};
