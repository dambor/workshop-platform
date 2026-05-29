import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
export const hasApiKey = !!apiKey;

// gemini-3.5-flash is the model proven to work in this app (the chat uses it).
// Swap to a Pro id here if your API key has access to one.
const GEN_MODEL = 'gemini-3.5-flash';

// ---------------------------------------------------------------------------
// Repo fetching (GitHub API + raw, both CORS-enabled, no auth needed for public repos)
// ---------------------------------------------------------------------------

export interface RepoRef {
  owner: string;
  repo: string;
  branch?: string;
  subPath?: string;
}

export function parseRepoUrl(input: string): RepoRef | null {
  const s = input.trim();
  const short = s.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (short) return { owner: short[1], repo: short[2].replace(/\.git$/, '') };
  try {
    const u = new URL(s);
    if (!/(^|\.)github\.com$/.test(u.hostname)) return null;
    const parts = u.pathname.replace(/^\/+|\/+$/g, '').split('/');
    if (parts.length < 2) return null;
    const ref: RepoRef = { owner: parts[0], repo: parts[1].replace(/\.git$/, '') };
    if ((parts[2] === 'tree' || parts[2] === 'blob') && parts[3]) {
      ref.branch = parts[3];
      ref.subPath = parts.slice(4).join('/') || undefined;
    }
    return ref;
  } catch {
    return null;
  }
}

interface TreeItem { path: string; type: string; size?: number; }

const SKIP_DIRS = /(^|\/)(node_modules|dist|build|out|vendor|\.git|\.next|\.venv|venv|env|__pycache__|target|\.idea|\.vscode|coverage|\.turbo|\.cache|site-packages)(\/|$)/;
const SKIP_FILE = /\.(lock|map|png|jpe?g|gif|svg|ico|pdf|zip|gz|tar|tgz|woff2?|ttf|eot|mp3|mp4|mov|webm|webp|wasm|bin|so|dylib|dll|class|jar|parquet|ipynb)$|(^|\/)(package-lock\.json|yarn\.lock|pnpm-lock\.yaml|uv\.lock|poetry\.lock|Cargo\.lock|Gemfile\.lock)$/i;
const CONFIG_RE = /(^|\/)(package\.json|pyproject\.toml|requirements\.txt|setup\.py|setup\.cfg|go\.mod|Cargo\.toml|pom\.xml|build\.gradle|Dockerfile|docker-compose\.ya?ml|\.env\.example|Makefile|tsconfig\.json)$/i;
const SRC_RE = /\.(py|ts|tsx|js|jsx|mjs|go|rs|java|rb|kt|c|cc|cpp|h|hpp|cs|php|swift|scala|sh|sql|ya?ml|toml|md|txt)$/i;

function rankPath(p: string): number {
  if (/(^|\/)README/i.test(p)) return 0;
  if (CONFIG_RE.test(p)) return 1;
  if (/(^|\/)(docs?|examples?|samples?|tutorials?)\//i.test(p)) return 2;
  if (SRC_RE.test(p)) return 3;
  return 5;
}

async function gh(url: string): Promise<any> {
  const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
  if (res.status === 403)
    throw new Error('GitHub API rate limit hit (60 requests/hour for anonymous use). Wait a bit and retry.');
  if (!res.ok) throw new Error(`GitHub API returned ${res.status} for ${url}`);
  return res.json();
}

export interface RepoContext {
  ref: { owner: string; repo: string; branch: string };
  fileTree: string[];
  files: { path: string; content: string }[];
  contextString: string;
}

export async function fetchRepoContext(
  ref: RepoRef,
  onProgress?: (msg: string) => void,
  budgetBytes = 120_000,
  maxFiles = 28,
): Promise<RepoContext> {
  onProgress?.('Resolving repository…');
  let branch = ref.branch;
  if (!branch) {
    const meta = await gh(`https://api.github.com/repos/${ref.owner}/${ref.repo}`);
    branch = meta.default_branch || 'main';
  }

  onProgress?.(`Reading file tree (${branch})…`);
  const tree = await gh(
    `https://api.github.com/repos/${ref.owner}/${ref.repo}/git/trees/${branch}?recursive=1`,
  );

  let items: TreeItem[] = (tree.tree || []).filter((t: any) => t.type === 'blob');
  if (ref.subPath) items = items.filter(t => t.path.startsWith(ref.subPath!));
  items = items.filter(t => !SKIP_DIRS.test(t.path) && !SKIP_FILE.test(t.path));
  items.sort(
    (a, b) =>
      rankPath(a.path) - rankPath(b.path) ||
      a.path.split('/').length - b.path.split('/').length ||
      (a.size || 0) - (b.size || 0),
  );

  const fileTree = items.map(i => i.path);
  const files: { path: string; content: string }[] = [];
  let used = 0;

  for (const it of items) {
    if (files.length >= maxFiles || used >= budgetBytes) break;
    if ((it.size || 0) > 60_000 && rankPath(it.path) > 1) continue;
    onProgress?.(`Fetching ${it.path}…`);
    try {
      const raw = await fetch(
        `https://raw.githubusercontent.com/${ref.owner}/${ref.repo}/${branch}/${it.path}`,
      );
      if (!raw.ok) continue;
      let text = await raw.text();
      const cap = rankPath(it.path) <= 1 ? 16_000 : 8_000;
      if (text.length > cap) text = text.slice(0, cap) + `\n… [truncated ${text.length - cap} chars]`;
      files.push({ path: it.path, content: text });
      used += text.length;
    } catch {
      /* skip unreadable file */
    }
  }

  const contextString = buildContextString(ref, branch, fileTree, files);
  return { ref: { owner: ref.owner, repo: ref.repo, branch }, fileTree, files, contextString };
}

function buildContextString(
  ref: RepoRef,
  branch: string,
  fileTree: string[],
  files: { path: string; content: string }[],
): string {
  const treePreview = fileTree.slice(0, 250).join('\n');
  const fileBlocks = files.map(f => `\n----- FILE: ${f.path} -----\n${f.content}`).join('\n');
  return `REPOSITORY: ${ref.owner}/${ref.repo} (branch: ${branch})\n\nFILE TREE (filtered):\n${treePreview}\n\nKEY FILE CONTENTS:${fileBlocks}`;
}

// ---------------------------------------------------------------------------
// Generation
// ---------------------------------------------------------------------------

// The system instruction encodes everything this platform's parser and house style
// require, plus a hard "ground in the real repo, don't fabricate" rule. Keeping it
// here means every generated workshop is structurally correct by construction.
export const AUTHORING_SPEC = `You are an expert technical curriculum author. You produce hands-on, comprehensive coding workshops as a SINGLE Markdown file for the "Gemini Workshops" platform. The platform uses a CUSTOM Markdown parser, so you MUST follow these rules exactly or the workshop will render incorrectly or fail to load.

# ACCURACY (most important)
- Ground EVERYTHING in the actual repository content provided by the user. Use the real module/file names, real function and class names, real APIs, real commands, and the real architecture visible in the files.
- NEVER invent APIs, flags, headers, env vars, or commands. If something is not in the repo and you are unsure, use the Google Search tool to verify it against official docs before writing it. Prefer omitting a detail over guessing.
- If the domain warrants it (finance, medical, security), include a short, clearly-labelled educational disclaimer.

# STRUCTURE (custom parser rules — follow exactly)
1. Start the file with YAML frontmatter, then the body. Example:
   ---
   title: "A Clear, Specific Workshop Title"
   description: One or two sentences describing what the learner builds and the tools used.
   ---
2. Do NOT put a blank line between the closing "---" and the first "# " heading. (A blank line there causes the overview to be dropped.)
3. In the frontmatter title and description, do NOT use apostrophes or quotes inside the text — the landing page strips them (so "Google's" becomes "Googles"). Reword instead (e.g. "the Google ADK"). A colon in a quoted title is fine.
4. Headings define navigation:
   - "# Section Name" starts a SECTION (a group). Use one per major part: an overview section, "# Setup", "# Module 1: ...", "# Module 2: ...", "# Next Steps".
   - "## Step Title" starts a navigable STEP. Immediately on the NEXT line put "duration: NN min" and the line after that "id: kebab-case-id". NO blank line between the "## " heading and the "duration:" line.
   - Do NOT use "### " headings. Each "### " becomes its own separate navigable step and fragments the workshop. For sub-sections inside a step, use a **bold lead-in.** on its own line instead.
5. SIZE STEPS BY CONTENT (adaptive — do NOT force one step per module). Each "## " step should be a focused, comfortable unit of roughly one to three screens of reading/work. Never cram a whole module into one giant step, and never fragment every sentence into its own step. Guideline:
   - A short or simple module → a single "## " step.
   - A meatier module → split it into a concept "## " step and a hands-on "## " build step.
   - A large module → a concept step plus 2–3 build steps, each its own "## ".
   Use "**bold lead-ins.**" for finer sub-sections WITHIN a step (e.g. "**1 · do this**"). Let the total step count follow the repo's size (typically ~6–16).
6. The overview goes directly under the first "# " heading as plain prose (it becomes the intro step); do not give it a "## ".

# CONTENT BLOCKS
- Code: fenced blocks with a language, e.g. \`\`\`python … \`\`\`. For long code, use \`\`\`python small. Keep every fence balanced (open and close).
- Diagrams: \`\`\`mermaid … \`\`\`. In mermaid labels use <br/> for line breaks (never a literal backslash-n). NEVER use a semicolon ";" inside mermaid node labels or sequenceDiagram messages — it breaks the parser; use a comma.
- Callouts: only "> TIP:" and "> WARNING:" get special styling. Put each on a single line.
- Tables: standard GitHub-flavoured Markdown tables are supported.

# STYLE
- Friendly, precise, and practical. Every step should teach something concrete and be runnable.
- Include a real setup section (prerequisites, install, auth/keys), then build up module by module, then a "run it / verify" step, then a short "next steps" section.
- Prefer the latest, most capable tooling shown in the repo.

# OUTPUT
- Output ONLY the workshop Markdown, beginning with the "---" frontmatter. No preamble, no explanation, and do NOT wrap the whole thing in a code fence.`;

export async function generateWorkshop(opts: {
  repoContext: string;
  angle?: string;
  audience?: string;
  model?: string;
}): Promise<string> {
  if (!ai) throw new Error('VITE_GEMINI_API_KEY is not set, so the generator cannot call Gemini.');

  const userPrompt = `Create a comprehensive, hands-on workshop based on the repository below.${
    opts.angle ? `\n\nFocus / angle: ${opts.angle}` : ''
  }${opts.audience ? `\nTarget audience: ${opts.audience}` : ''}

Ground everything in the actual repository content. Use the real file and module names, the real APIs, and the real architecture you can see. If you must reference an external product or API whose details are not in the repo, verify it with web search rather than guessing.

${opts.repoContext}`;

  const config = {
    systemInstruction: AUTHORING_SPEC,
    tools: [{ googleSearch: {} }],
    temperature: 0.4,
  };
  const model = opts.model || GEN_MODEL;

  let res;
  try {
    res = await ai.models.generateContent({ model, contents: userPrompt, config });
  } catch (e: any) {
    // If the configured model isn't available on this key, fall back to the known-good one.
    const msg = String(e?.message || e);
    if (model !== 'gemini-3.5-flash' && /not found|NOT_FOUND|404|not supported/i.test(msg)) {
      res = await ai.models.generateContent({ model: 'gemini-3.5-flash', contents: userPrompt, config });
    } else {
      throw e;
    }
  }

  return stripWrappingFence((res.text || '').trim());
}

function stripWrappingFence(s: string): string {
  const m = s.match(/^```(?:markdown|md)?\s*\n([\s\S]*?)\n```$/);
  return (m ? m[1] : s).trim();
}
