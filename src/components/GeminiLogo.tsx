import React from 'react';

interface GeminiLogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

/**
 * Gemini-style 4-point sparkle mark with the signature blue→purple→coral gradient.
 */
export const GeminiLogo: React.FC<GeminiLogoProps> = ({ size = 28, className = '', animated = false }) => {
  const gradientId = React.useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${animated ? 'animate-sparkle' : ''} ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4796E3" />
          <stop offset="35%" stopColor="#6B7BF1" />
          <stop offset="65%" stopColor="#B16EE7" />
          <stop offset="100%" stopColor="#F58F60" />
        </linearGradient>
      </defs>
      <path
        d="M12 1.5C12.4 6.6 17.4 11.6 22.5 12c-5.1.4-10.1 5.4-10.5 10.5-.4-5.1-5.4-10.1-10.5-10.5C6.6 11.6 11.6 6.6 12 1.5z"
        fill={`url(#${gradientId})`}
      />
    </svg>
  );
};

interface GeminiWordmarkProps {
  className?: string;
  subtitle?: string;
  compact?: boolean;
}

export const GeminiWordmark: React.FC<GeminiWordmarkProps> = ({ className = '', subtitle, compact = false }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <GeminiLogo size={compact ? 24 : 30} animated />
    <div className="flex flex-col leading-none">
      <span className={`font-display font-semibold tracking-tight gemini-gradient-text ${compact ? 'text-base' : 'text-lg'}`}>
        Gemini Workshops
      </span>
      {subtitle && (
        <span className="text-[11px] uppercase tracking-[0.18em] text-fg-subtle mt-1">
          {subtitle}
        </span>
      )}
    </div>
  </div>
);
