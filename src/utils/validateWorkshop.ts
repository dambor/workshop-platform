import { parseWorkshopMarkdown } from './markdownParser';

export interface ValidationResult {
  errors: string[];
  warnings: string[];
  stepCount: number;
}

/**
 * Checks a workshop markdown string against the rules of this platform's custom
 * parser (src/utils/markdownParser.ts) and house style. These are exactly the
 * gotchas that have caused workshops to render wrong or not load:
 *  - frontmatter shape and apostrophe-stripping on the landing page
 *  - the blank-line-after-frontmatter bug that drops the intro
 *  - `duration:`/`id:` must touch the `##` heading
 *  - `### ` headings each become a separate navigable step
 *  - mermaid breaks on `;` and literal `\n`
 *  - unbalanced code fences
 */
export function validateWorkshop(md: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const lines = md.split('\n');

  // --- Frontmatter ---
  if (lines[0]?.trim() !== '---') {
    errors.push('Missing frontmatter: the file must start with a "---" line.');
  } else {
    let j = 1;
    while (j < lines.length && lines[j].trim() !== '---') j++;
    if (j >= lines.length) {
      errors.push('Frontmatter is not closed with a second "---" line.');
    } else {
      const fm = lines.slice(1, j).join('\n');
      const titleM = fm.match(/title:\s*(.*)/);
      const descM = fm.match(/description:\s*(.*)/);
      if (!titleM || !titleM[1].trim()) errors.push('Frontmatter is missing a "title:".');
      if (!descM || !descM[1].trim()) warnings.push('Frontmatter is missing a "description:".');
      if (titleM && /['’]/.test(titleM[1]))
        warnings.push('Title contains an apostrophe — the landing page strips it (e.g. "Google\'s" → "Googles"). Reword to avoid it.');
      if (descM && /['’]/.test(descM[1]))
        warnings.push('Description contains an apostrophe — it will be stripped on the workshop card. Reword to avoid it.');

      // Blank line(s) between closing --- and the first "# " heading drops the intro.
      let k = j + 1;
      let sawBlank = false;
      while (k < lines.length && lines[k].trim() === '') { sawBlank = true; k++; }
      if (sawBlank && lines[k]?.startsWith('# ')) {
        errors.push('Remove the blank line(s) between the closing "---" and the first "# " heading — otherwise the overview/intro content is dropped.');
      }
    }
  }

  // --- Code fences balanced ---
  const fenceCount = (md.match(/^```/gm) || []).length;
  if (fenceCount % 2 !== 0) errors.push('Unbalanced code fences (odd number of ``` lines).');

  // --- Walk the body, respecting code fences ---
  let inCode = false;
  let mermaid = false;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const t = raw.trim();

    if (t.startsWith('```')) {
      if (!inCode) { inCode = true; mermaid = t.slice(3).trim().startsWith('mermaid'); }
      else { inCode = false; mermaid = false; }
      continue;
    }
    if (inCode) {
      if (mermaid && raw.includes(';'))
        warnings.push(`Mermaid (line ${i + 1}) contains ";" — it breaks sequenceDiagram parsing. Use a comma.`);
      if (mermaid && raw.includes('\\n'))
        warnings.push(`Mermaid (line ${i + 1}) contains "\\n" — use <br/> for line breaks in node labels.`);
      continue;
    }

    if (raw.startsWith('### ')) {
      warnings.push(`Line ${i + 1}: "${t.slice(0, 48)}" — a "### " heading becomes its OWN navigable step. Use a **bold lead-in** instead to keep modules consolidated.`);
    }

    if (raw.startsWith('## ')) {
      const n1 = (lines[i + 1] || '').trim();
      if (!n1.toLowerCase().startsWith('duration:')) {
        errors.push(`Line ${i + 1}: "${t.slice(0, 48)}" must be immediately followed by a "duration:" line (no blank line between).`);
      } else {
        const n2 = (lines[i + 2] || '').trim();
        if (!n2.toLowerCase().startsWith('id:'))
          warnings.push(`Line ${i + 1}: "${t.slice(0, 48)}" should have an "id:" line right after "duration:".`);
      }
    }
  }

  // --- Step count (uses the real parser) ---
  let stepCount = 0;
  try { stepCount = parseWorkshopMarkdown(md).length; } catch { /* ignore */ }
  if (stepCount === 0) errors.push('The parser produced 0 steps — the workshop would render empty.');
  else if (stepCount > 22) warnings.push(`The parser produced ${stepCount} steps — that is very granular; consider merging the smallest ones.`);

  return { errors, warnings, stepCount };
}
