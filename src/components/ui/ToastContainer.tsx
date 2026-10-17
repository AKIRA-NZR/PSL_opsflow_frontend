import React from 'react';
import { CheckCircle, Info, WarningCircle, X } from '@phosphor-icons/react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useWorkspace();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const icon =
          t.variant === 'success' ? (
            <CheckCircle
              className="w-4.5 h-4.5 text-[#6EE7B7] shrink-0 mt-0.5"
              weight="fill"
            />
          ) : t.variant === 'error' ? (
            <WarningCircle
              className="w-4.5 h-4.5 text-[#FDA4AF] shrink-0 mt-0.5"
              weight="fill"
            />
          ) : (
            <Info
              className="w-4.5 h-4.5 text-[#A5B4FC] shrink-0 mt-0.5"
              weight="fill"
            />
          );

        const borderClass =
          t.variant === 'success'
            ? 'border-emerald-400/25'
            : t.variant === 'error'
              ? 'border-rose-400/30'
              : 'border-indigo-400/25';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-2xl glass-popover border ${borderClass} p-4 flex items-start justify-between gap-3`}
          >
            <div className="flex items-start gap-3">
              {icon}
              <div>
                <h4 className="text-sm font-medium text-[#F4F7FB]">{t.title}</h4>
                <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">
                  {t.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-[#94A3B8] hover:text-[#F4F7FB] p-1 rounded-lg tactile-surface cursor-pointer"
            >
              <X className="w-3.5 h-3.5" weight="bold" />
            </button>
          </div>
        );
      })}
    </div>
  );
};


