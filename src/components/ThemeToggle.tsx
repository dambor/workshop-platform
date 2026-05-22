import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../theme/ThemeContext';

interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '' }) => {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-border-default bg-surface-1 text-fg-muted hover:text-fg hover:border-border-strong transition-all hover:scale-105 active:scale-95 ${className}`}
    >
      <Sun className={`w-4 h-4 absolute transition-all ${isDark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`} />
      <Moon className={`w-4 h-4 absolute transition-all ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`} />
    </button>
  );
};
