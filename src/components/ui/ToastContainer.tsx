import React from 'react';
import {
  CheckCircle,
  Info,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import { useWorkspace } from '../../context/WorkspaceContext';
import type { ToastNotification } from '../../core/types/service.types';

const TOAST_STYLES: Record<
  ToastNotification['variant'],
  { border: string; icon: React.ReactNode }
> = {
  success: {
    border: 'border-[#1d3d31]',
    icon: <CheckCircle className="w-4 h-4 text-[#6ee7b7] shrink-0" weight="fill" />,
  },
  error: {
    border: 'border-[#452126]',
    icon: <WarningCircle className="w-4 h-4 text-[#fda4af] shrink-0" weight="fill" />,
  },
  info: {
    border: 'border-[#223a4e]',
    icon: <Info className="w-4 h-4 text-[#7dd3fc] shrink-0" weight="fill" />,
  },
};

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useWorkspace();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.variant];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-[#1b1b1b] border ${style.border} shadow-[0_16px_40px_rgba(0,0,0,0.85)] p-3.5 flex items-start justify-between gap-3`}
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5">{style.icon}</div>
              <div>
                <h4 className="text-xs font-semibold text-white">
                  {toast.title}
                </h4>
                <p className="text-xs text-[#c4c7c8] mt-0.5 leading-relaxed">
                  {toast.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-[#8e9192] hover:text-white transition-colors p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" weight="bold" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
