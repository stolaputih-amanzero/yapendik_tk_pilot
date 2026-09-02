import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';

export interface RosterSearchBarProps {
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const RosterSearchBar: React.FC<RosterSearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Cari nama, NIS, atau panggilan…',
  className = '',
}) => {
  const [localValue, setLocalValue] = useState<string>(value);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onChange(val);
    }, 150);
  };

  const handleClear = () => {
    setLocalValue('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onChange('');
  };

  return (
    <div
      className={`
        relative flex items-center w-full min-w-0
        bg-surface border border-line rounded-xl px-3 py-1
        focus-within:border-accent-valor focus-within:shadow-hairline
        transition-all ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      <Search className="w-4 h-4 text-ink-faint shrink-0 ml-1" />
      <input
        type="text"
        value={localValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        aria-label="Cari siswa"
        className="w-full min-w-0 bg-transparent px-2 py-2 text-xs medium:text-sm text-ink placeholder:text-ink-faint outline-none border-none font-sans"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Hapus pencarian"
          className="min-h-[48px] min-w-[48px] p-2 text-ink-faint hover-only:text-ink flex items-center justify-center cursor-pointer transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
