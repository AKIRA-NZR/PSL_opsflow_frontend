import React, { useEffect } from 'react';
import { X } from '@phosphor-icons/react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass-popover w-full max-w-lg rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-white/[0.08]">
          <div>
            <h3 className="text-base font-semibold text-[#F1F5F9]">{title}</h3>
            {subtitle && (
              <p className="text-xs text-[#94A3B8] mt-1">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="tactile-surface text-[#94A3B8] hover:text-white p-1.5 rounded-xl cursor-pointer"
          >
            <X className="w-4 h-4" weight="bold" />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
