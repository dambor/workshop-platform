export interface CodeSnippet {
  language: string;
  code: string;
  caption?: string;
}

export interface StepContent {
  type: 'text' | 'code' | 'image' | 'warning' | 'tip';
  value: string; // Markdown text, code string, or image URL
  language?: string; // For code blocks
  alt?: string; // For images
}

export interface WorkshopStep {
  id: string;
  title: string;
  section: string; // Grouping identifier
  duration: string; // e.g. "10 min"
  content: StepContent[];
  level?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}