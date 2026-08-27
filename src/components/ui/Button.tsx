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
  primary: 'bg-slate-900 text-white hover:bg-slate-800 font-bold shadow-xs active:bg-slate-950 disabled:bg-slate-800/60',
  secondary: 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 font-semibold active:bg-slate-300 disabled:opacity-50',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium active:bg-slate-200/70 disabled:opacity-50',
  danger: 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-semibold active:bg-rose-200 disabled:opacity-50',
  icon: 'p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 active:bg-slate-200 disabled:opacity-50'
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-xs md:text-sm rounded-xl gap-2 min-h-[38px]',
  lg: 'px-5 py-2.5 text-sm md:text-base rounded-2xl gap-2.5 min-h-[44px]',
  icon: 'p-2 rounded-xl w-9 h-9 flex items-center justify-center shrink-0'
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
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2
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
