import React from 'react';

export type ProgressBarVariant = 'primary' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'lppa';

export interface ProgressBarProps {
  value: number; // 0 to 100
  variant?: ProgressBarVariant;
  className?: string;
  trackClassName?: string;
  showLabel?: boolean;
}

const variantFillMap: Record<ProgressBarVariant, string> = {
  primary: 'bg-brand-primary',
  brand: 'bg-brand-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  lppa: 'bg-lppa'
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  variant = 'primary',
  className = '',
  trackClassName = '',
  showLabel = false
}) => {
  const clampedValue = Math.min(100, Math.max(0, isNaN(value) ? 0 : value));
  const fillClass = variantFillMap[variant] || 'bg-brand-primary';

  return (
    <div className={`space-y-1 w-full min-w-0 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-[11px] font-mono text-ink-soft whitespace-nowrap">
          <span>Progres</span>
          <span>{Math.round(clampedValue)}%</span>
        </div>
      )}
      <div 
        role="progressbar" 
        aria-valuenow={clampedValue} 
        aria-valuemin={0} 
        aria-valuemax={100}
        className={`h-1.5 w-full rounded-pill bg-surface-subtle border border-line-soft overflow-hidden ${trackClassName}`}
      >
        <div
          style={{ width: `${clampedValue}%` }}
          className={`h-full rounded-pill transition-[width] duration-300 ease-out ${fillClass}`}
        />
      </div>
    </div>
  );
};
