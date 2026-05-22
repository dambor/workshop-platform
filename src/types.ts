export interface CodeSnippet {
  language: string;
  code: string;
  caption?: string;
}

export interface StepContent {
  type: 'text' | 'code' | 'image' | 'warning' | 'tip' | 'mermaid';
  value: string; // Markdown text, code string, or image URL
  language?: string; // For code blocks
  small?: boolean; // For code blocks: use smaller font
  alt?: string; // For images
  width?: string; // For images, e.g. "60%"
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