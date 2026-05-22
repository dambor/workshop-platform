import { WorkshopStep, StepContent } from '../types';

export function parseWorkshopMarkdown(markdown: string): WorkshopStep[] {
  const steps: WorkshopStep[] = [];
  const lines = markdown.split('\n');

  let currentSection = 'General';
  let currentStep: Partial<WorkshopStep> | null = null;
  let currentContent: StepContent[] = [];
  let bufferText: string[] = [];

  const flushBuffer = () => {
    if (bufferText.length > 0) {
      const text = bufferText.join('\n').trim();
      if (text) {
        currentContent.push({ type: 'text', value: text });
      }
      bufferText = [];
    }
  };

  const finalizeStep = () => {
    if (currentStep && currentStep.title) {
      flushBuffer();
      steps.push({
        id: currentStep.id || currentStep.title.toLowerCase().replace(/\s+/g, '-'),
        title: currentStep.title,
        section: currentStep.section || currentSection,
        duration: currentStep.duration || '5 min',
        content: [...currentContent],
        level: currentStep.level
      });
    }
    currentStep = null;
    currentContent = [];
    bufferText = [];
  };

  // Initial step setup for content before first H2/H3
  currentStep = {
    title: 'Introduction',
    section: 'General',
    level: 0
  };

  // Check for frontmatter and skip if present
  let startIdx = 0;
  if (lines[0]?.trim() === '---') {
    let j = 1;
    while (j < lines.length && lines[j].trim() !== '---') {
      j++;
    }
    if (j < lines.length) {
      startIdx = j + 1;
    }
  }

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Section Header: # Section Name
    if (line.startsWith('# ')) {
      // If we were in the auto-generated Introduction step and it's empty, just update it
      if (currentStep?.title === 'Introduction' && currentContent.length === 0 && bufferText.length === 0) {
        currentSection = line.substring(2).trim();
        currentStep.section = currentSection;
      } else {
        finalizeStep();
        currentSection = line.substring(2).trim();
        // Start a new Introduction step for the new section if needed, 
        // but usually people want the next ## to start the content.
        // Actually, let's just update the section and keep looking for a step.
      }
    }
    // Step Header: ## Step Title
    else if (line.startsWith('## ')) {
      finalizeStep();
      currentStep = {
        title: line.substring(3).trim(),
        section: currentSection,
        level: 0
      };
    }
    // Sub-Step Header: ### Step Title
    else if (line.startsWith('### ')) {
      finalizeStep();
      currentStep = {
        title: line.substring(4).trim(),
        section: currentSection,
        level: 1
      };
    }

    // Content processing
    else if (currentStep) {
      // Metadata (only at start of step)
      if (currentContent.length === 0 && bufferText.length === 0) {
        const lower = trimmed.toLowerCase();
        if (lower.startsWith('duration:')) {
          currentStep.duration = trimmed.substring(9).trim();
          continue;
        }
        if (lower.startsWith('id:')) {
          currentStep.id = trimmed.substring(3).trim();
          continue;
        }
      }

      // Code Blocks
      if (trimmed.startsWith('```')) {
        flushBuffer();

        // Check for single-line code block: ```content```
        if (trimmed.length > 3 && trimmed.endsWith('```')) {
          const content = trimmed.slice(3, -3).trim();
          currentContent.push({ type: 'code', language: 'text', value: content });
        } else {
          // Multi-line code block
          const rawLang = trimmed.replace(/```/g, '').trim() || 'text';
          const small = rawLang.includes('small');
          const language = rawLang.replace(/\bsmall\b/, '').trim() || 'text';
          let code = '';
          i++; // skip start delimiter
          while (i < lines.length && !lines[i].trim().startsWith('```')) {
            code += lines[i] + '\n';
            i++;
          }
          if (language.startsWith('mermaid')) {
            const widthMatch = language.match(/mermaid\s+(\S+)/);
            const width = widthMatch ? widthMatch[1] : undefined;
            currentContent.push({ type: 'mermaid', value: code.trim(), ...(width && { width }) });
          } else {
            currentContent.push({ type: 'code', language, value: code.trim(), ...(small && { small: true }) });
          }
        }
      }
      // Images: ![alt](url)
      else if (trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)) {
        flushBuffer();
        const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (match) {
          const [altText, width] = match[1].split('|').map(s => s.trim());
          currentContent.push({ type: 'image', alt: altText, value: match[2], ...(width && { width }) });
        }
      }
      // Tips
      else if (trimmed.startsWith('> TIP:')) {
        flushBuffer();
        currentContent.push({ type: 'tip', value: trimmed.replace('> TIP:', '').trim() });
      }
      // Warnings
      else if (trimmed.startsWith('> WARNING:')) {
        flushBuffer();
        currentContent.push({ type: 'warning', value: trimmed.replace('> WARNING:', '').trim() });
      }
      // Normal Text
      else {
        bufferText.push(line);
      }
    }
  }

  // Finalize last step
  finalizeStep();

  return steps;
}