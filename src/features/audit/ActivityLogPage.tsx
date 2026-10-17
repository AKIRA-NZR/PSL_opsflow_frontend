import React from 'react';
import { History } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatDateTime, getInitials } from '../../core/utils/date.utils';

export const ActivityLogPage: React.FC = () => {
  const { activeCompany, tenantActivityLogs } = useWorkspace();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#F1F5F9]">
          Registro de Atividades
        </h2>
        <p className="text-sm text-[#94A3B8] mt-0.5">
          Acompanhe o histórico recente de ações realizadas na organização {activeCompany.name}.
        </p>
      </div>

      <div className="rounded-2xl bg-[#1B202B] border border-[#2A3140] divide-y divide-[#2A3140]/70 overflow-hidden">
        {tenantActivityLogs.length === 0 ? (
          <div className="py-14 text-center text-sm text-[#64748B]">
            Nenhuma atividade registrada até o momento.
          </div>
        ) : (
          tenantActivityLogs.map((item) => (
            <div
              key={item.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#232936]/40 transition-colors"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#232936] border border-[#2F3747] text-xs font-semibold text-[#A5B4FC] flex items-center justify-center shrink-0 mt-0.5">
                  {getInitials(item.actorName)}
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-[#F1F5F9] flex flex-wrap items-center gap-2">
                    <span className="font-medium">{item.actorName}</span>
                    <span className="text-[#94A3B8]">·</span>
                    <span className="text-[#93C5FD] font-medium">
                      {item.actionLabel}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#232936] text-xs text-[#CBD5E1]">
                      {item.targetLabel}
                    </span>
                  </div>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-[#64748B] shrink-0">
                <History className="w-3.5 h-3.5" />
                <span>{formatDateTime(item.createdAt)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
