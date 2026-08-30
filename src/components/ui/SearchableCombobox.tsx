import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';
import { AdaptiveDialog } from './AdaptiveDialog';

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
}

export interface SearchableComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const SearchableCombobox: React.FC<SearchableComboboxProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Pilih atau cari...',
  searchPlaceholder = 'Cari pilihan...',
  label,
  hint,
  error,
  disabled = false,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isExpandedScreen, setIsExpandedScreen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkScreen = () => {
      setIsExpandedScreen(window.innerWidth >= 840);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    if (!isOpen) {
      setQuery('');
    }
  }, [isOpen]);

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

  const filteredOptions = useMemo(() => {
    if (!query.trim()) return options;
    const lower = query.toLowerCase();
    return options.filter(o => 
      o.label.toLowerCase().includes(lower) || 
      (o.sublabel && o.sublabel.toLowerCase().includes(lower))
    );
  }, [options, query]);

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
          className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-surface border border-line rounded-field shadow-floating p-2 max-h-72 flex flex-col"
        >
          <div className="relative mb-2 shrink-0">
            <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-surface-subtle border border-line rounded-lg pl-8 pr-7 py-1 text-xs text-ink placeholder:text-ink-faint outline-none focus:border-line-strong transition-colors"
            />
            {query && (
              <button 
                type="button" 
                onClick={() => setQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-faint hover-only:text-ink"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 space-y-0.5 max-h-52">
            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-xs text-ink-faint">
                Tidak ada hasil ditemukan
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`
                      w-full flex items-center justify-between px-2 py-1 rounded-lg text-xs medium:text-sm text-left transition-colors cursor-pointer
                      ${isSelected ? 'bg-surface-subtle font-semibold text-ink' : 'text-ink-soft hover-only:bg-surface-subtle hover-only:text-ink'}
                    `}
                  >
                    <div className="min-w-0 flex-1 truncate pr-2">
                      <div className="truncate">{option.label}</div>
                      {option.sublabel && (
                        <div className="text-[10px] text-ink-faint truncate">{option.sublabel}</div>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="w-4 h-4 text-brand-primary shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet (< 840px) */}
      {!isExpandedScreen && (
        <AdaptiveDialog
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title={label || 'Pilih'}
        >
          <div className="space-y-3 py-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-surface-subtle border border-line rounded-field pl-9 pr-8 py-2 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-line-strong transition-colors"
              />
              {query && (
                <button 
                  type="button" 
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover-only:text-ink"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="max-h-[50vh] overflow-y-auto space-y-1">
              {filteredOptions.length === 0 ? (
                <div className="py-8 text-center text-xs text-ink-faint">
                  Tidak ada hasil yang sesuai
                </div>
              ) : (
                filteredOptions.map((option) => {
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
                        <Check className="w-4 h-4 text-brand-primary shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </AdaptiveDialog>
      )}
    </div>
  );
};
