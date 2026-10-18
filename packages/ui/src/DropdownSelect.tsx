import React, { useEffect, useRef, useState } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';

export interface DropdownOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface DropdownSelectProps<T extends string = string> {
  value: T;
  options: DropdownOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  align?: 'left' | 'right';
}

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
    <div
      ref={containerRef}
      className={`relative ${isOpen ? 'z-50' : 'z-10'} ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-2.5 bg-[#0e0e0e] border px-3.5 py-2 text-xs sm:text-sm text-[#e2e2e2] transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
          isOpen
            ? 'border-white bg-[#161616]'
            : 'border-[#444748]/50 hover:border-[#8e9192]'
        }`}
      >
        <span className="flex items-center gap-2 min-w-0 truncate">
          {selectedOption?.icon && (
            <span className="shrink-0">{selectedOption.icon}</span>
          )}
          <span className="truncate font-medium">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>
        <CaretDown
          className={`w-3.5 h-3.5 text-[#8e9192] shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
          weight="bold"
        />
      </button>

      {isOpen && (
        <div
          className={`absolute z-50 mt-1 min-w-full w-60 bg-[#1b1b1b] border border-[#444748] shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-1 space-y-0.5 ${
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
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 text-left transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#2a2a2a] text-white'
                    : 'text-[#c4c7c8] hover:bg-[#242424] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">
                      {opt.label}
                    </div>
                    {opt.description && (
                      <div className="text-[11px] text-[#8e9192] truncate">
                        {opt.description}
                      </div>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <Check
                    className="w-3.5 h-3.5 text-white shrink-0"
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
