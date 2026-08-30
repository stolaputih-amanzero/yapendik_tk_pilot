/**
 * Amanaura Design System v1.0 — Badge Primitive
 * Micro Status Dot Capsule (●) with JetBrains Mono Precision Typography
 */

import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'lppa' | 'brand' | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string; ping: string }> = {
  brand: {
    container: 'bg-brand-tint text-brand-deep border-line-hairline',
    dot: 'bg-brand-primary',
    ping: 'bg-brand-primary/60'
  },
  success: {
    container: 'bg-success-tint text-success-deep border-success-line',
    dot: 'bg-success',
    ping: 'bg-success/60'
  },
  warning: {
    container: 'bg-warning-tint text-warning-deep border-warning-line',
    dot: 'bg-warning',
    ping: 'bg-warning/60'
  },
  danger: {
    container: 'bg-danger-tint text-danger-deep border-danger-line',
    dot: 'bg-danger',
    ping: 'bg-danger/60'
  },
  info: {
    container: 'bg-info-tint text-info-deep border-info-line',
    dot: 'bg-info',
    ping: 'bg-info/60'
  },
  lppa: {
    container: 'bg-lppa-tint text-lppa-deep border-lppa-line',
    dot: 'bg-lppa',
    ping: 'bg-lppa/60'
  },
  neutral: {
    container: 'bg-surface-subtle text-ink-soft border-line',
    dot: 'bg-ink-faint',
    ping: 'bg-line-strong'
  }
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  dot = true,
  pulse = false,
  children,
  className = '',
  ...props
}) => {
  const current = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={`
        font-mono text-[11px] font-bold px-2 py-1 rounded-full border
        inline-flex items-center gap-2 shrink-0 select-none
        ${current.container}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5 items-center justify-center shrink-0">
          {pulse && (
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${current.ping}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${current.dot}`} />
        </span>
      )}
      <span className="truncate">{children}</span>
    </span>
  );
};
