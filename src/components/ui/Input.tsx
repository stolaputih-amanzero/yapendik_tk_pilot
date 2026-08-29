import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  hint,
  error,
  leftIcon,
  rightElement,
  className = '',
  containerClassName = '',
  id,
  disabled,
  ...props
}, ref) => {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={`space-y-1.5 min-w-0 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-xs font-semibold text-ink-soft select-none truncate"
        >
          {label}
        </label>
      )}

      <div 
        className={`
          flex items-center gap-2 px-3 py-2
          bg-surface-subtle border border-line rounded-field
          text-xs medium:text-sm text-ink placeholder:text-ink-faint
          focus-within:bg-surface focus-within:border-line-strong
          focus-within:shadow-hairline transition-all
          ${disabled ? 'opacity-60 cursor-not-allowed bg-surface-subtle/50' : ''}
          ${error ? 'border-danger-line focus-within:border-danger' : ''}
        `.trim().replace(/\s+/g, ' ')}
      >
        {leftIcon && (
          <span className="text-ink-faint shrink-0 flex items-center">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`
            w-full bg-transparent text-ink placeholder:text-ink-faint
            outline-none border-none p-0 text-xs medium:text-sm
            disabled:cursor-not-allowed
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          {...props}
        />

        {rightElement && (
          <span className="shrink-0 flex items-center">
            {rightElement}
          </span>
        )}
      </div>

      {hint && !error && (
        <p className="text-[11px] text-ink-faint">{hint}</p>
      )}

      {error && (
        <p className="text-[11px] text-danger font-medium">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
