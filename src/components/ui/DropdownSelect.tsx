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
 * Spatial Glass & Tactile Neumorphic Dropdown Select
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
        className={`tactile-surface w-full flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-zinc-100 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${
          isOpen ? 'border-white/25 ring-2 ring-white/10' : ''
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
          className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
          weight="bold"
        />
      </button>

      {isOpen && (
        <div
          className={`glass-popover absolute z-40 mt-2 min-w-full w-60 rounded-2xl p-1.5 space-y-0.5 animate-in fade-in zoom-in-95 duration-100 ${
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
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white/[0.10] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]'
                    : 'text-zinc-300 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                  <div className="min-w-0">
                    <div className="text-xs font-medium truncate">
                      {opt.label}
                    </div>
                    {opt.description && (
                      <div className="text-[11px] text-zinc-400 truncate">
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
