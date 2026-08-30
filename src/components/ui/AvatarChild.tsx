/**
 * Amanaura Design System v1.0 — AvatarChild Primitive
 * Deterministic Pastel & Symbol Privacy Engine (Signature 5 & Privacy Rule 9)
 */

import React from 'react';

export interface AvatarChildProps {
  name: string;
  id?: string;
  size?: 'sm' | 'md' | 'lg';
  showSymbol?: boolean;
  className?: string;
}

const pastelPalette = [
  { bg: 'bg-warning-tint text-warning-deep border-warning-line', symbol: '🌟' },
  { bg: 'bg-success-tint text-success-deep border-success-line', symbol: '🍀' },
  { bg: 'bg-info-tint text-info-deep border-info-line', symbol: '⛵' },
  { bg: 'bg-danger-tint text-danger-deep border-danger-line', symbol: '🎈' },
  { bg: 'bg-lppa-tint text-lppa-deep border-lppa-line', symbol: '🚀' },
  { bg: 'bg-surface-subtle text-ink border-line', symbol: '🦁' }
];

const sizeMap = {
  sm: {
    container: 'w-7 h-7 text-xs rounded-lg',
    symbolSize: 'text-[9px] -bottom-1 -right-1'
  },
  md: {
    container: 'w-10 h-10 text-sm rounded-field',
    symbolSize: 'text-[11px] -bottom-1 -right-1'
  },
  lg: {
    container: 'w-12 h-12 text-base rounded-card',
    symbolSize: 'text-xs -bottom-1 -right-1'
  }
};

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getInitials = (name: string): string => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const AvatarChild: React.FC<AvatarChildProps> = ({
  name,
  id,
  size = 'md',
  showSymbol = false,
  className = ''
}) => {
  const seed = id || name || 'default';
  const index = hashString(seed) % pastelPalette.length;
  const theme = pastelPalette[index];
  const sizeConfig = sizeMap[size];
  const initials = getInitials(name);

  return (
    <div className={`relative inline-flex shrink-0 select-none ${className}`}>
      <div
        className={`
          ${sizeConfig.container} ${theme.bg}
          border font-black flex items-center justify-center tracking-tight shadow-hairline
        `.trim().replace(/\s+/g, ' ')}
        title={name}
      >
        {initials}
      </div>

      {showSymbol && (
        <span
          className={`
            absolute ${sizeConfig.symbolSize}
            leading-none filter drop-shadow-hairline
          `.trim().replace(/\s+/g, ' ')}
          aria-hidden="true"
        >
          {theme.symbol}
        </span>
      )}
    </div>
  );
};
