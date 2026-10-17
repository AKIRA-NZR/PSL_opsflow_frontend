import React from 'react';
import { AlertOctagon, Copy, Check, X, Terminal } from 'lucide-react';
import { useOpsFlow } from '../store/opsflow-engine';

/**
 * Renders RFC 9457 (`application/problem+json`) responses from the backend
 * with HTTP status, errorCode, ruleRef, field violations, and copyable traceId.
 */
export const ProblemDetailToastStack: React.FC = () => {
  const { problems, dismissProblem } = useOpsFlow();
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (problems.length === 0) return null;

  const copyTrace = (traceId: string) => {
    navigator.clipboard.writeText(traceId);
    setCopiedId(traceId);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div className="fixed bottom-16 right-5 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {problems.map((p) => (
        <div
          key={p.traceId}
          className="pointer-events-auto rounded-lg bg-zinc-950/95 backdrop-blur-md border border-rose-500/40 shadow-2xl shadow-black/80 p-4 text-xs text-zinc-200 animate-in fade-in slide-in-from-bottom-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-semibold text-[11px] border border-rose-500/30">
                <AlertOctagon className="w-3 h-3" />
                HTTP {p.status}
              </span>
              <span className="font-mono text-[11px] text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {p.errorCode}
              </span>
              {p.ruleRef && (
                <span className="font-mono text-[10px] text-indigo-300 bg-indigo-500/15 px-1.5 py-0.5 rounded border border-indigo-500/30">
                  {p.ruleRef}
                </span>
              )}
            </div>
            <button
              onClick={() => dismissProblem(p.traceId)}
              className="text-zinc-500 hover:text-zinc-200 p-0.5 rounded transition-colors cursor-pointer"
              title="Fechar alerta RFC 9457"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="font-semibold text-zinc-100 mt-2 text-sm">{p.title}</h4>
          <p className="text-zinc-400 mt-1 leading-relaxed">{p.detail}</p>

          {p.errors && p.errors.length > 0 && (
            <div className="mt-2.5 bg-zinc-900/90 border border-zinc-800 rounded p-2 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Field Violations (422)
              </div>
              {p.errors.map((err, idx) => (
                <div key={idx} className="text-[11px] font-mono text-rose-300">
                  • <span className="text-zinc-200">{err.field}</span>: {err.message}
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span className="flex items-center gap-1 truncate">
              <Terminal className="w-3 h-3 text-indigo-400 shrink-0" />
              application/problem+json · {p.instance}
            </span>
            <button
              onClick={() => copyTrace(p.traceId)}
              className="inline-flex items-center gap-1 text-zinc-400 hover:text-indigo-300 transition-colors shrink-0 ml-2 cursor-pointer"
              title="Copiar traceId (MDC Correlation)"
            >
              {copiedId === p.traceId ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>trace:{p.traceId.slice(0, 8)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
