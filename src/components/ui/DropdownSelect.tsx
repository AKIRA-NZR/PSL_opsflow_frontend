import React, { useEffect, useRef, useState } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface DropdownSelectProps<T extends string = string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  align?: 'left' | 'right';
}

/**
 * Custom Soft Dark Mode Dropdown Select replacing native browser <select> elements.
 * Supports rich icons, descriptions, keyboard Escape, and outside-click dismissal.
 */
export function DropdownSelect<T extends string = string>({
  value,
  options,
  onChange,
  disabled = false,
  placeholder = 'Selecionar...',
  className = '',
  align = 'left',
}: DropdownSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 rounded-xl bg-[#13161C] hover:bg-[#181C24] border px-3.5 py-2.5 text-sm text-[#F1F5F9] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
          isOpen
            ? 'border-[#5865F2] ring-2 ring-[#5865F2]/20'
            : 'border-[#2A3140] hover:border-[#384152]'
        }`}
      >
        <span className="flex items-center gap-2.5 min-w-0 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0">{selectedOption.icon}</span>
          )}
          <span className="truncate font-medium">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <CaretDown
          className={`w-4 h-4 text-[#94A3B8] shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-[#F1F5F9]' : ''
          }`}
          weight="bold"
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-40 mt-2 min-w-full w-64 rounded-xl bg-[#1B202B] border border-[#2E3646] shadow-2xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#232936] text-[#F1F5F9]'
                    : 'text-[#CBD5E1] hover:bg-[#232936]/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">
                      {opt.label}
                    </div>
                    {opt.description && (
                      <div className="text-[11px] text-[#64748B] truncate">
                        {opt.description}
                      </div>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <Check
                    className="w-4 h-4 text-[#818CF8] shrink-0"
                    weight="bold"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
