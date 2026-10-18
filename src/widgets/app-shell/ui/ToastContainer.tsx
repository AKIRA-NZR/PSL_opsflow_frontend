import React from 'react';
import {
  CheckCircle,
  Info,
  WarningCircle,
  X,
} from '@phosphor-icons/react';
import type { ToastNotification } from '@opsflow/domain';
import { useWorkspace } from '@entities/session';

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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.variant];
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-[#1b1b1b] border ${style.border} shadow-[0_16px_40px_rgba(0,0,0,0.85)] px-3.5 py-2.5 flex items-center justify-between gap-3`}
          >
            <div className="flex items-center gap-2">
              {style.icon}
              <span className="text-xs font-medium text-white">
                {toast.title}
              </span>
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
