/**
 * Amanaura Design System v1.0 — ListItem Primitive
 * Universal Edge-to-Edge Data Row for Mobile & Desktop
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface ListItemProps {
  avatar?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
  showChevron?: boolean;
  className?: string;
}

export const ListItem: React.FC<ListItemProps> = ({
  avatar,
  title,
  subtitle,
  badge,
  action,
  onClick,
  showChevron = false,
  className = ''
}) => {
  const isInteractive = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
      className={`
        w-full border-b border-line-soft py-3 px-4 medium:px-5
        flex items-center justify-between gap-3 min-w-0
        transition-colors duration-150
        ${isInteractive ? 'cursor-pointer hover-only:bg-surface-subtle active:bg-line-soft' : ''}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      {/* Left Section: Avatar & Main Text */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {avatar && <div className="shrink-0">{avatar}</div>}
        <div className="min-w-0 flex-1 space-y-0.5">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-bold text-ink text-sm truncate">
              {title}
            </span>
            {badge && <span className="shrink-0">{badge}</span>}
          </div>
          {subtitle && (
            <div className="text-xs text-ink-soft truncate font-medium">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Action or Chevron */}
      {(action || showChevron) && (
        <div className="shrink-0 flex items-center gap-2">
          {action}
          {showChevron && <ChevronRight className="w-4 h-4 text-ink-faint" />}
        </div>
      )}
    </div>
  );
};
