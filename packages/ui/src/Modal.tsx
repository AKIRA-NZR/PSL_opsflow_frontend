import React, { useEffect } from 'react';
import { X } from '@phosphor-icons/react';

export interface ModalProps {
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
      className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#131313] border border-[#444748]/60 shadow-[0_24px_64px_rgba(0,0,0,0.9)] w-full max-w-lg overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-[#444748]/40 bg-[#0e0e0e]">
          <div>
            <h3 className="text-sm font-mono uppercase tracking-wider text-white">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#8e9192] mt-1">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8e9192] hover:text-white p-1 border border-transparent hover:border-[#444748]/50 cursor-pointer"
          >
            <X className="w-4 h-4" weight="bold" />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
