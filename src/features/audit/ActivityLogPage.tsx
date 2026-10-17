import React from 'react';
import { ClockCounterClockwise } from '@phosphor-icons/react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatDateTime, getInitials } from '../../core/utils/date.utils';

export const ActivityLogPage: React.FC = () => {
  const { tenantActivityLogs } = useWorkspace();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="rounded-2xl glass-panel divide-y divide-white/[0.06] overflow-hidden">
        {tenantActivityLogs.length === 0 ? (
          <div className="py-12 text-center text-sm text-zinc-500">
            Sem atividades registradas.
          </div>
        ) : (
          tenantActivityLogs.map((item) => (
            <div
              key={item.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl neumorphic-inset text-xs font-semibold text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                  {getInitials(item.actorName)}
                </div>

                <div className="space-y-0.5">
                  <div className="text-sm text-zinc-100 flex flex-wrap items-center gap-2">
                    <span className="font-medium">{item.actorName}</span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-300 font-medium">
                      {item.actionLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded-full glass-pill bg-white/[0.04] text-xs text-zinc-300 border-white/10">
                      {item.targetLabel}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {item.detail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-zinc-500 shrink-0">
                <ClockCounterClockwise className="w-3.5 h-3.5" weight="duotone" />
                <span>{formatDateTime(item.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
