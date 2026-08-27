/**
 * Amanaura Design System v1.0 — Badge Primitive
 * Micro Status Dot Capsule (●) with JetBrains Mono Precision Typography
 */

import React from 'react';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'lppa' | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  dot?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { container: string; dot: string; ping: string }> = {
  success: {
    container: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
    dot: 'bg-emerald-500',
    ping: 'bg-emerald-400'
  },
  warning: {
    container: 'bg-amber-50 text-amber-900 border-amber-200/80',
    dot: 'bg-amber-500',
    ping: 'bg-amber-400'
  },
  danger: {
    container: 'bg-rose-50 text-rose-800 border-rose-200/80',
    dot: 'bg-rose-500',
    ping: 'bg-rose-400'
  },
  info: {
    container: 'bg-sky-50 text-sky-800 border-sky-200/80',
    dot: 'bg-sky-500',
    ping: 'bg-sky-400'
  },
  lppa: {
    container: 'bg-purple-50 text-purple-800 border-purple-200/80',
    dot: 'bg-purple-500',
    ping: 'bg-purple-400'
  },
  neutral: {
    container: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    ping: 'bg-slate-300'
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
  const current = variantStyles[variant];

  return (
    <span
      className={`
        font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full border
        inline-flex items-center gap-1.5 shrink-0 select-none
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
