/**
 * Amanaura Design System v1.0 — AutoResizeTextarea Primitive
 * Fluid Observation & Narrative Textarea with Zero Double Scrollbars
 */

import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';

export interface AutoResizeTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minRows?: number;
  maxRows?: number;
}

export const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, AutoResizeTextareaProps>(({
  minRows = 2,
  maxRows = 8,
  className = '',
  value,
  defaultValue,
  onInput,
  ...props
}, ref) => {
  const internalRef = useRef<HTMLTextAreaElement | null>(null);

  useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement);

  const adjustHeight = () => {
    const textarea = internalRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const newHeight = textarea.scrollHeight;
    textarea.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [value, defaultValue]);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    if (onInput) {
      onInput(e);
    }
  };

  return (
    <textarea
      ref={internalRef}
      rows={minRows}
      onInput={handleInput}
      value={value}
      defaultValue={defaultValue}
      className={`
        w-full rounded-card bg-surface-subtle border border-line p-3
        text-xs medium:text-sm text-ink placeholder:text-ink-faint
        focus:outline-none focus:border-line-strong focus:bg-surface
        transition-colors duration-150 resize-none overflow-hidden font-medium
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    />
  );
});

AutoResizeTextarea.displayName = 'AutoResizeTextarea';
