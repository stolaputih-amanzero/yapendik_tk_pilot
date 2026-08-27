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
    return <IconComp className="w-3.5 h-3.5 shrink-0" />;
  };

  return (
    <div
      role="tablist"
      className={`
        bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/60
        overflow-x-auto no-scrollbar select-none
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
              flex-1 flex items-center justify-center gap-1.5 rounded-lg font-semibold
              transition-all duration-150 cursor-pointer active:scale-[0.98] whitespace-nowrap
              ${isSm ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs md:text-sm'}
              ${
                isActive
                  ? 'bg-white text-slate-900 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }
            `.trim().replace(/\s+/g, ' ')}
          >
            {renderIcon(option.icon)}
            <span>{option.label}</span>
            {option.badge !== undefined && (
              <span
                className={`
                  px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold
                  ${isActive ? 'bg-slate-100 text-slate-800' : 'bg-slate-200/80 text-slate-600'}
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
