// Generated workshops are stored in localStorage because the app is a static SPA
// with no backend. They render in the real viewer and show on the landing page; the
// "Download .md" action lets you commit one into public/workshops/ to host it permanently.

export interface GeneratedWorkshop {
  id: string;          // always prefixed "gen-" to avoid clashing with file-based workshops
  title: string;
  description: string;
  content: string;     // full workshop markdown
  createdAt: number;
}

const KEY = 'generated-workshops';

export function listGeneratedWorkshops(): GeneratedWorkshop[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getGeneratedWorkshop(id: string): GeneratedWorkshop | null {
  return listGeneratedWorkshops().find(w => w.id === id) ?? null;
}

export function saveGeneratedWorkshop(w: GeneratedWorkshop): void {
  const rest = listGeneratedWorkshops().filter(x => x.id !== w.id);
  localStorage.setItem(KEY, JSON.stringify([w, ...rest]));
}

export function removeGeneratedWorkshop(id: string): void {
  localStorage.setItem(KEY, JSON.stringify(listGeneratedWorkshops().filter(w => w.id !== id)));
}

export function slugify(s: string): string {
  return (
    s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'workshop'
  );
}
