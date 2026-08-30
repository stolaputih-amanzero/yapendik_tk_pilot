/**
 * Amanaura Design System v1.0 — SegmentedControl Primitive
 * 1-Tap Pill Toggle for 2–4 Options (The Threshold Rule <= 4)
 */

import React from 'react';

export interface SegmentedControlOption {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  badge?: string | number;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  size = 'md',
  className = ''
}) => {
  const isSm = size === 'sm';

  const renderIcon = (icon?: React.ComponentType<{ className?: string }> | React.ReactNode) => {
    if (!icon) return null;
    if (React.isValidElement(icon)) {
      return <span className="shrink-0">{icon}</span>;
    }
    const IconComp = icon as React.ElementType;
    return <IconComp className="w-4 h-4 shrink-0" />;
  };

  return (
    <div
      role="tablist"
      className={`
        bg-surface-subtle p-1 rounded-xl flex items-center border border-line-hairline divide-x divide-line-hairline
        overflow-x-auto no-scrollbar select-none w-full expanded:w-fit
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {options.map((option) => {
        const isActive = option.id === value;

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={`
              flex-1 min-w-0 flex items-center justify-center gap-1.5 medium:gap-2 rounded-lg font-semibold
              transition-all duration-150 cursor-pointer active:scale-[0.98]
              ${isSm ? 'px-2 medium:px-3 py-1 text-[11px] medium:text-xs' : 'px-3 medium:px-4 py-2 text-xs medium:text-sm'}
              ${
                isActive
                  ? 'bg-surface text-ink font-bold shadow-hairline border-b-2 border-b-brand-primary'
                  : 'text-ink-soft border border-transparent hover-only:text-ink hover-only:bg-surface/50'
              }
            `.trim().replace(/\s+/g, ' ')}
          >
            {renderIcon(option.icon)}
            <span className="truncate">{option.label}</span>
            {option.badge !== undefined && (
              <span
                className={`
                  px-1 py-0 rounded-full text-[10px] font-mono font-bold
                  ${isActive ? 'bg-surface-subtle text-ink' : 'bg-line-soft text-ink-soft'}
                `.trim()}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
