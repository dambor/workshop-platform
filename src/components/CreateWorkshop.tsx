import React, { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Sparkles, Loader2, Download, Save, RefreshCw,
  AlertTriangle, CheckCircle2, XCircle, Github,
} from 'lucide-react';
import { GeminiLogo } from './GeminiLogo';
import { ThemeToggle } from './ThemeToggle';
import { parseRepoUrl, fetchRepoContext, generateWorkshop, hasApiKey } from '../services/workshopGenerator';
import { validateWorkshop } from '../utils/validateWorkshop';
import { saveGeneratedWorkshop, slugify } from '../services/generatedWorkshops';

type Phase = 'form' | 'working' | 'result' | 'error';

function extractMeta(md: string): { title: string; description: string } {
  const m = md.match(/^---\s*\n([\s\S]*?)\n---/);
  let title = '';
  let description = '';
  if (m) {
    const t = m[1].match(/title:\s*(.*)/);
    const d = m[1].match(/description:\s*(.*)/);
    if (t) title = t[1].replace(/["']/g, '').trim();
    if (d) description = d[1].replace(/["']/g, '').trim();
  }
  return { title, description };
}

const CreateWorkshop: React.FC = () => {
  const navigate = useNavigate();
  const [repoUrl, setRepoUrl] = useState('');
  const [angle, setAngle] = useState('');
  const [audience, setAudience] = useState('');
  const [phase, setPhase] = useState<Phase>('form');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [markdown, setMarkdown] = useState('');
  const repoCtxRef = useRef<string>('');

  const validation = useMemo(() => (markdown ? validateWorkshop(markdown) : null), [markdown]);
  const meta = useMemo(() => extractMeta(markdown), [markdown]);

  const run = async (reuseContext: boolean) => {
    setError('');
    const ref = parseRepoUrl(repoUrl);
    if (!ref) {
      setError('Enter a valid GitHub repo URL (e.g. https://github.com/owner/repo) or owner/repo.');
      setPhase('error');
      return;
    }
    if (!hasApiKey) {
      setError('VITE_GEMINI_API_KEY is not set, so generation is unavailable. Add it to your .env file and restart the dev server.');
      setPhase('error');
      return;
    }
    setPhase('working');
    try {
      let ctx = reuseContext ? repoCtxRef.current : '';
      if (!ctx) {
        const rc = await fetchRepoContext(ref, m => setStatus(m));
        if (rc.files.length === 0) throw new Error('No readable source files were found in that repo or path.');
        ctx = rc.contextString;
        repoCtxRef.current = ctx;
      }
      setStatus('Generating the workshop with Gemini (grounded in the repo — this can take a minute)…');
      const md = await generateWorkshop({ repoContext: ctx, angle, audience });
      if (!md) throw new Error('The model returned no content. Try again or refine the angle.');
      setMarkdown(md);
      setPhase('result');
    } catch (e: any) {
      setError(e?.message || String(e));
      setPhase('error');
    }
  };

  const save = () => {
    const title = meta.title || 'Generated Workshop';
    const id = `gen-${slugify(title)}`;
    saveGeneratedWorkshop({ id, title, description: meta.description, content: markdown, createdAt: Date.now() });
    navigate(`/${id}`);
  };

  const download = () => {
    const name = slugify(meta.title || 'workshop');
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="min-h-screen bg-surface text-fg font-sans">
      {/* Top bar */}
      <div className="max-w-4xl mx-auto px-6 pt-8 lg:px-10 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-fg-muted hover:text-fg transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to workshops
        </button>
        <div className="flex items-center gap-3">
          <GeminiLogo size={24} animated />
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-10 py-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl gemini-gradient flex items-center justify-center shadow-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">Create a workshop</h1>
        </div>
        <p className="text-fg-muted mb-10">
          Point at a GitHub repo and Gemini drafts a comprehensive, hands-on workshop — grounded in the real code and structured for this platform.
        </p>

        {!hasApiKey && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
            <span><code>VITE_GEMINI_API_KEY</code> is not set. Add it to your <code>.env</code> and restart the dev server to enable generation.</span>
          </div>
        )}

        {/* FORM */}
        {(phase === 'form' || phase === 'error') && (
          <div className="space-y-5">
            <label className="block">
              <span className="text-sm font-medium text-fg flex items-center gap-2 mb-2"><Github className="w-4 h-4" /> GitHub repository</span>
              <input
                type="text"
                value={repoUrl}
                onChange={e => setRepoUrl(e.target.value)}
                placeholder="https://github.com/google/adk-samples  ·  or  owner/repo"
                className="w-full bg-surface-1 border border-border-default text-fg placeholder:text-fg-subtle px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-gemini-indigo)]/60"
              />
              <span className="text-xs text-fg-subtle mt-1.5 block">Public repos. You can point at a subfolder via a /tree/branch/path URL.</span>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-fg mb-2 block">Focus / angle <span className="text-fg-subtle font-normal">(optional)</span></span>
              <input
                type="text"
                value={angle}
                onChange={e => setAngle(e.target.value)}
                placeholder="e.g. the multi-agent orchestration, or the data pipeline"
                className="w-full bg-surface-1 border border-border-default text-fg placeholder:text-fg-subtle px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-gemini-indigo)]/60"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-fg mb-2 block">Target audience <span className="text-fg-subtle font-normal">(optional)</span></span>
              <input
                type="text"
                value={audience}
                onChange={e => setAudience(e.target.value)}
                placeholder="e.g. backend engineers new to LLM agents"
                className="w-full bg-surface-1 border border-border-default text-fg placeholder:text-fg-subtle px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-gemini-indigo)]/60"
              />
            </label>

            {phase === 'error' && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm">
                <XCircle className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={() => run(false)}
              disabled={!repoUrl.trim()}
              className="inline-flex items-center gap-2 px-6 py-3 gemini-gradient text-white rounded-full font-medium hover:scale-[1.02] active:scale-95 transition-transform disabled:opacity-40 disabled:hover:scale-100"
            >
              <Sparkles className="w-4 h-4" /> Generate workshop
            </button>
          </div>
        )}

        {/* WORKING */}
        {phase === 'working' && (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-gemini-purple)]" />
            <p className="text-fg-muted max-w-md">{status}</p>
          </div>
        )}

        {/* RESULT */}
        {phase === 'result' && validation && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border-default bg-surface-1 p-5">
              <div className="text-xs uppercase tracking-wide text-fg-subtle mb-1">Generated workshop</div>
              <div className="font-display text-xl font-semibold">{meta.title || 'Untitled workshop'}</div>
              {meta.description && <p className="text-sm text-fg-muted mt-1">{meta.description}</p>}
            </div>

            {/* Validation */}
            <div className="rounded-2xl border border-border-default bg-surface-1 p-5 space-y-2 text-sm">
              {validation.errors.length === 0 && validation.warnings.length === 0 ? (
                <div className="flex items-center gap-2 text-emerald-500"><CheckCircle2 className="w-4 h-4" /> Looks good — {validation.stepCount} steps, no issues found.</div>
              ) : (
                <>
                  <div className="text-fg-muted font-medium">Validation ({validation.stepCount} steps)</div>
                  {validation.errors.map((e, i) => (
                    <div key={`e${i}`} className="flex items-start gap-2 text-red-500"><XCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{e}</span></div>
                  ))}
                  {validation.warnings.map((w, i) => (
                    <div key={`w${i}`} className="flex items-start gap-2 text-amber-500"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /><span>{w}</span></div>
                  ))}
                </>
              )}
            </div>

            {/* Editable markdown */}
            <div>
              <div className="text-sm font-medium text-fg mb-2">Markdown <span className="text-fg-subtle font-normal">(editable — validation updates live)</span></div>
              <textarea
                value={markdown}
                onChange={e => setMarkdown(e.target.value)}
                spellCheck={false}
                className="w-full h-96 bg-surface-2 border border-border-default rounded-2xl p-4 font-mono text-xs text-fg leading-relaxed focus:outline-none focus:ring-2 focus:ring-[var(--color-gemini-indigo)]/60"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={save} className="inline-flex items-center gap-2 px-5 py-2.5 gemini-gradient text-white rounded-full font-medium hover:scale-[1.02] active:scale-95 transition-transform">
                <Save className="w-4 h-4" /> Save & open
              </button>
              <button onClick={download} className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-2 border border-border-default rounded-full font-medium text-fg-muted hover:text-fg transition-colors">
                <Download className="w-4 h-4" /> Download .md
              </button>
              <button onClick={() => run(true)} className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-2 border border-border-default rounded-full font-medium text-fg-muted hover:text-fg transition-colors">
                <RefreshCw className="w-4 h-4" /> Regenerate
              </button>
              <button onClick={() => setPhase('form')} className="px-5 py-2.5 text-fg-subtle hover:text-fg transition-colors text-sm">Start over</button>
            </div>
            <p className="text-xs text-fg-subtle">
              <strong>Save &amp; open</strong> stores it in your browser and opens it in the viewer. To host it permanently, <strong>Download .md</strong> and drop the file into <code>public/workshops/</code>, then commit.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateWorkshop;
