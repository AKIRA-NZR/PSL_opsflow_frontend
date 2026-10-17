import React from 'react';
import { ClockCounterClockwise } from '@phosphor-icons/react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatDateTime, getInitials } from '../../core/utils/date.utils';

export const ActivityLogPage: React.FC = () => {
  const { activeCompany, tenantActivityLogs } = useWorkspace();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#F4F7FB]">
          Registro de Atividades
        </h2>
        <p className="text-sm text-[#94A3B8] mt-0.5">
          Acompanhe o histórico recente de ações realizadas na organização {activeCompany.name}.
        </p>
      </div>

      <div className="rounded-2xl glass-panel divide-y divide-white/[0.06] overflow-hidden">
        {tenantActivityLogs.length === 0 ? (
          <div className="py-14 text-center text-sm text-[#64748B]">
            Nenhuma atividade registrada até o momento.
          </div>
        ) : (
          tenantActivityLogs.map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl neumorphic-inset text-xs font-semibold text-[#A5B4FC] flex items-center justify-center shrink-0 mt-0.5">
                  {getInitials(item.actorName)}
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-[#F4F7FB] flex flex-wrap items-center gap-2">
                    <span className="font-medium">{item.actorName}</span>
                    <span className="text-[#94A3B8]">·</span>
                    <span className="text-[#93C5FD] font-medium">
                      {item.actionLabel}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full glass-pill bg-white/[0.04] text-xs text-[#CBD5E1] border-white/10">
                      {item.targetLabel}
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#64748B] shrink-0">
                <ClockCounterClockwise className="w-4 h-4" weight="duotone" />
                <span>{formatDateTime(item.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


