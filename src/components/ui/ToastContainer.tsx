import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useWorkspace();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const icon =
          t.variant === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : t.variant === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          ) : (
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          );

        const borderClass =
          t.variant === 'success'
            ? 'border-emerald-500/30'
            : t.variant === 'error'
              ? 'border-rose-500/35'
              : 'border-indigo-500/30';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl bg-[#1B202B] border ${borderClass} shadow-xl p-4 flex items-start justify-between gap-3`}
          >
            <div className="flex items-start gap-3">
              {icon}
              <div>
                <h4 className="text-sm font-medium text-[#F1F5F9]">{t.title}</h4>
                <p className="text-xs text-[#94A3B8] mt-0.5 leading-relaxed">
                  {t.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismissToast(t.id)}
              className="text-[#64748B] hover:text-[#F1F5F9] p-1 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
