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
              className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
              weight="fill"
            />
          ) : t.variant === 'error' ? (
            <WarningCircle
              className="w-4 h-4 text-rose-400 shrink-0 mt-0.5"
              weight="fill"
            />
          ) : (
            <Info
              className="w-4 h-4 text-zinc-300 shrink-0 mt-0.5"
              weight="fill"
            />
          );

        return (
          <div
            key={t.id}
            className="pointer-events-auto rounded-2xl glass-popover p-3.5 flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-2.5">
              {icon}
              <div>
                <h4 className="text-xs font-semibold text-zinc-100">{t.title}</h4>
                <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
                  {t.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-zinc-400 hover:text-white p-1 rounded-lg tactile-surface cursor-pointer"
            >
              <X className="w-3 h-3" weight="bold" />
            </button>
          </div>
        );
      })}
    </div>
  );
};


