import React from 'react';
import { ClockCounterClockwise } from '@phosphor-icons/react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatDateTime, getInitials } from '../../core/utils/date.utils';

export const ActivityLogPage: React.FC = () => {
  const { tenantActivityLogs } = useWorkspace();

  return (
    <div className="max-w-5xl mx-auto">
      <div className="glass-panel divide-y divide-[#444748]/30 overflow-hidden">
        {tenantActivityLogs.length === 0 ? (
          <div className="py-12 text-center text-sm text-[#8e9192]">
            Sem atividades registradas.
          </div>
        ) : (
          tenantActivityLogs.map((item) => (
            <div
              key={item.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#1c1c1c] transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#242424] border border-[#444748]/60 text-xs font-mono text-white flex items-center justify-center shrink-0 mt-0.5">
                  {getInitials(item.actorName)}
                </div>

                <div className="space-y-0.5">
                  <div className="text-sm text-white flex flex-wrap items-center gap-2">
                    <span className="font-medium">{item.actorName}</span>
                    <span className="text-[#8e9192]">·</span>
                    <span className="text-[#7dd3fc] font-medium">
                      {item.actionLabel}
                    </span>
                    <span className="px-2 py-0.5 font-mono text-[11px] bg-[#0e0e0e] text-[#c4c7c8] border border-[#444748]/45">
                      {item.targetLabel}
                    </span>
                  </div>
                  <p className="text-xs text-[#8e9192]">
                    {item.detail}
                  </p>
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
