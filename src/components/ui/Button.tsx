/**
 * Amanaura Design System v1.0 — Button Primitive
 * Standardized Tactile Action Trigger with Hardware Debounce & Zero Width Jiggle
 */

import React, { forwardRef, useRef } from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  debounceMs?: number;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-brand hover-only:opacity-90 font-bold shadow-hairline active:opacity-95 disabled:opacity-50',
  secondary: 'bg-surface-subtle text-ink hover-only:bg-surface-subtle/80 border border-line font-semibold active:bg-surface-subtle/90 disabled:opacity-50',
  ghost: 'bg-transparent text-ink-soft hover-only:bg-surface-subtle hover-only:text-ink font-medium active:bg-surface-subtle/80 disabled:opacity-50',
  danger: 'bg-danger-tint text-danger-deep hover-only:bg-danger-tint/80 border border-danger-line font-semibold active:bg-danger-tint/90 disabled:opacity-50',
  icon: 'p-2 rounded-field text-ink-soft hover-only:bg-surface-subtle hover-only:text-ink active:bg-surface-subtle/80 disabled:opacity-50'
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1 text-xs rounded-field gap-2',
  md: 'px-4 py-2 text-xs medium:text-sm rounded-field gap-2 min-h-[38px]',
  lg: 'px-5 py-2 text-sm medium:text-base rounded-field gap-2 min-h-[44px]',
  icon: 'p-2 rounded-field w-9 h-9 flex items-center justify-center shrink-0'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  debounceMs = 300,
  children,
  className = '',
  disabled,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const lastClickRef = useRef<number>(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const now = Date.now();
    if (now - lastClickRef.current < debounceMs) {
      e.preventDefault();
      return;
    }
    lastClickRef.current = now;
    if (onClick) {
      onClick(e);
    }
  };

  const isIconButton = variant === 'icon' || size === 'icon';

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={`
        inline-flex items-center justify-center select-none
        transition-all duration-150 active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass/30 focus-visible:ring-offset-2
        cursor-pointer disabled:cursor-not-allowed disabled:active:scale-100
        ${variantStyles[variant]}
        ${isIconButton ? sizeStyles.icon : sizeStyles[size]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin shrink-0 text-current" />
      ) : (
        <>
          {leftIcon && <span className="shrink-0 inline-flex items-center">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0 inline-flex items-center">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';
