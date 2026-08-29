import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { AdaptiveDialog } from './AdaptiveDialog';

export interface SelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface SelectSheetProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const SelectSheet: React.FC<SelectSheetProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Pilih salah satu...',
  label,
  hint,
  error,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpandedScreen, setIsExpandedScreen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkScreen = () => {
      setIsExpandedScreen(window.innerWidth >= 840);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Close popover when clicking outside on expanded screens
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen && 
        isExpandedScreen &&
        popoverRef.current && 
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current && 
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, isExpandedScreen]);

  const selectedOption = options.find(o => o.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`space-y-1.5 min-w-0 relative ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-ink-soft select-none truncate">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-2 px-3 py-2
          bg-surface-subtle border border-line rounded-field
          text-xs medium:text-sm text-left transition-all cursor-pointer
          ${disabled ? 'opacity-60 cursor-not-allowed bg-surface-subtle/50' : 'hover-only:bg-surface focus-visible:shadow-luminescent'}
          ${isOpen ? 'border-line-strong bg-surface shadow-hairline' : ''}
          ${error ? 'border-danger-line' : ''}
        `.trim().replace(/\s+/g, ' ')}
      >
        <span className={`truncate ${selectedOption ? 'text-ink font-medium' : 'text-ink-faint'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-ink-faint transition-transform shrink-0 ${isOpen ? 'rotate-180 text-ink' : ''}`} />
      </button>

      {hint && !error && (
        <p className="text-[11px] text-ink-faint">{hint}</p>
      )}

      {error && (
        <p className="text-[11px] text-danger font-medium">{error}</p>
      )}

      {/* Desktop Popover (>= 840px) */}
      {isOpen && isExpandedScreen && (
        <div 
          ref={popoverRef}
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-surface border border-line rounded-field shadow-floating p-2 max-h-60 overflow-y-auto"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs medium:text-sm text-left transition-colors cursor-pointer
                  ${isSelected ? 'bg-surface-subtle font-semibold text-ink' : 'text-ink-soft hover-only:bg-surface-subtle hover-only:text-ink'}
                `}
              >
                <div className="min-w-0 flex-1 truncate pr-2">
                  <div className="truncate">{option.label}</div>
                  {option.sublabel && (
                    <div className="text-[11px] text-ink-faint truncate">{option.sublabel}</div>
                  )}
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 text-brass shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Mobile / Tablet Bottom Sheet (< 840px) */}
      {!isExpandedScreen && (
        <AdaptiveDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={label || 'Pilihan'}
        >
          <div className="space-y-1 py-1 max-h-[60vh] overflow-y-auto">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-field text-sm text-left transition-colors cursor-pointer
                    ${isSelected ? 'bg-surface-subtle font-semibold text-ink border border-line-strong' : 'text-ink-soft hover-only:bg-surface-subtle border border-transparent'}
                  `}
                >
                  <div className="min-w-0 flex-1 truncate pr-3">
                    <div className="truncate font-medium text-ink">{option.label}</div>
                    {option.sublabel && (
                      <div className="text-xs text-ink-soft mt-0.5 truncate">{option.sublabel}</div>
                    )}
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-brass shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </AdaptiveDialog>
      )}
    </div>
  );
};
