import React from 'react';
import { ClockCounterClockwise } from '@phosphor-icons/react';
import { formatDateTime, getInitials } from '@opsflow/domain';
import { useWorkspace } from '@entities/session';

export const ActivityLogPage: React.FC = () => {
  const { tenantActivityLogs } = useWorkspace();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="glass-panel divide-y divide-[#444748]/30 overflow-hidden">
        {tenantActivityLogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8e9192]">
            Sem atividades.
          </div>
        ) : (
          tenantActivityLogs.map((item) => (
            <div
              key={item.id}
              className="px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#1c1c1c] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#242424] border border-[#444748]/60 text-[10px] font-mono text-white flex items-center justify-center shrink-0">
                  {getInitials(item.actorName)}
                </div>

                <div className="text-sm text-white flex flex-wrap items-center gap-2">
                  <span className="font-medium">{item.actorName}</span>
                  <span className="text-[#8e9192]">·</span>
                  <span className="text-[#7dd3fc]">{item.actionLabel}</span>
                  <span className="px-2 py-0.5 font-mono text-[10px] bg-[#0e0e0e] text-[#c4c7c8] border border-[#444748]/45">
                    {item.targetLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#8e9192] shrink-0">
                <ClockCounterClockwise className="w-3.5 h-3.5" />
                <span>{formatDateTime(item.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

