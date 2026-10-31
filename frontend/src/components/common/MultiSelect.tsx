import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

export interface MultiSelectOption {
  value: string;
  label: string;
  subtitle?: string;
}

export interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  maxDisplayCount?: number;
  allowCustom?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'Select options...',
  error,
  helperText,
  allowCustom = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleOption = (val: string) => {
    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const removeValue = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== val));
  };

  return (
    <div className="w-full relative" ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
          {label}
        </label>
      )}

      {/* Trigger Box */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`min-h-[42px] w-full cursor-pointer rounded-lg border bg-white px-3 py-1.5 text-sm transition-colors flex items-center justify-between gap-2 ${
          error
            ? 'border-red-400 focus:ring-red-100'
            : isOpen
            ? 'border-teal-600 ring-2 ring-teal-100'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <div className="flex flex-wrap gap-1.5 items-center flex-1">
          {selectedValues.length === 0 ? (
            <span className="text-slate-400 text-sm">{placeholder}</span>
          ) : (
            selectedValues.map((val) => {
              const opt = options.find((o) => o.value === val);
              return (
                <span
                  key={val}
                  className="inline-flex items-center gap-1 rounded bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 text-xs font-medium"
                >
                  <span>{opt?.label || val}</span>
                  <button
                    type="button"
                    onClick={(e) => removeValue(val, e)}
                    className="hover:text-teal-950 p-0.5 rounded focus:outline-none"
                    aria-label={`Remove ${opt?.label || val}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden">
          {/* Search box */}
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search items..."
              className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800 placeholder:text-slate-400"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto p-1 divide-y divide-slate-50">
            {filteredOptions.length === 0 ? (
              <div className="py-4 flex flex-col items-center justify-center text-center text-xs text-slate-400">
                <span>No items match "{searchQuery}"</span>
                {allowCustom && searchQuery.trim() !== '' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(searchQuery.trim());
                      setSearchQuery('');
                    }}
                    className="mt-2 px-3 py-1.5 rounded bg-teal-50 text-teal-700 font-bold hover:bg-teal-100 border border-teal-200 transition-colors"
                  >
                    + Add "{searchQuery.trim()}"
                  </button>
                )}
              </div>
            ) : (
              <>
                {allowCustom && searchQuery.trim() !== '' && !options.some(o => o.label.toLowerCase() === searchQuery.trim().toLowerCase() || o.value.toLowerCase() === searchQuery.trim().toLowerCase()) && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOption(searchQuery.trim());
                      setSearchQuery('');
                    }}
                    className="flex items-center justify-between px-3 py-2 text-xs rounded-md cursor-pointer transition-colors text-teal-700 hover:bg-teal-50 font-bold bg-white border border-teal-100 mb-1"
                  >
                    + Add custom: "{searchQuery.trim()}"
                  </div>
                )}
                {filteredOptions.map((opt) => {
                  const isSelected = selectedValues.includes(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className={`flex items-center justify-between px-3 py-2 text-xs rounded-md cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-teal-50 text-teal-900 font-medium'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-slate-800 font-medium">{opt.label}</div>
                      {opt.subtitle && <div className="text-slate-400 text-[11px]">{opt.subtitle}</div>}
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-teal-700 shrink-0" />}
                  </div>
                );
              })}
              </>
            )}
          </div>
        </div>
      )}

      {error ? (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};
