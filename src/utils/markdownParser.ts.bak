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
        content: [...currentContent]
      });
    }
    currentStep = null;
    currentContent = [];
    bufferText = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Section Header: # Section Name
    if (line.startsWith('# ')) {
      finalizeStep();
      currentSection = line.substring(2).trim();
    }
    // Step Header: ## Step Title
    else if (line.startsWith('## ')) {
      finalizeStep();
      currentStep = {
        title: line.substring(3).trim(),
        section: currentSection
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
          const language = trimmed.replace(/```/g, '').trim() || 'text';
          let code = '';
          i++; // skip start delimiter
          while (i < lines.length && !lines[i].trim().startsWith('```')) {
            code += lines[i] + '\n';
            i++;
          }
          currentContent.push({ type: 'code', language, value: code.trim() });
        }
      }
      // Images: ![alt](url)
      else if (trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)) {
        flushBuffer();
        const match = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (match) {
          currentContent.push({ type: 'image', alt: match[1], value: match[2] });
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