import React from 'react';
import { Search } from 'lucide-react';
import type { TicketPriority, TicketStatus } from '../../core/types/domain.types';
import type { TicketFilterState } from '../../core/types/service.types';

interface TicketFilterBarProps {
  filters: TicketFilterState;
  onChange: (next: Partial<TicketFilterState>) => void;
}

export const TicketFilterBar: React.FC<TicketFilterBarProps> = ({
  filters,
  onChange,
}) => {
  return (
    <div className="rounded-2xl bg-[#1B202B] border border-[#2A3140] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
      <div className="relative flex-1 max-w-md">
        <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Pesquisar por número ou assunto do chamado..."
          className="w-full rounded-xl bg-[#13161C] border border-[#2A3140] pl-10 pr-4 py-2 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#5865F2]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <select
          value={filters.status}
          onChange={(e) =>
            onChange({ status: e.target.value as TicketStatus | 'ALL' })
          }
          className="rounded-xl bg-[#13161C] border border-[#2A3140] px-3.5 py-2 text-xs font-medium text-[#F1F5F9] focus:outline-none focus:border-[#5865F2] cursor-pointer"
        >
          <option value="ALL">Status: Todos</option>
          <option value="OPEN">Abertos</option>
          <option value="IN_PROGRESS">Em Atendimento</option>
          <option value="WAITING_USER">Aguardando Solicitante</option>
          <option value="RESOLVED">Resolvidos</option>
          <option value="CLOSED">Concluídos</option>
          <option value="CANCELLED">Cancelados</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) =>
            onChange({ priority: e.target.value as TicketPriority | 'ALL' })
          }
          className="rounded-xl bg-[#13161C] border border-[#2A3140] px-3.5 py-2 text-xs font-medium text-[#F1F5F9] focus:outline-none focus:border-[#5865F2] cursor-pointer"
        >
          <option value="ALL">Prioridade: Todas</option>
          <option value="CRITICAL">Crítica</option>
          <option value="HIGH">Alta</option>
          <option value="MEDIUM">Média</option>
          <option value="LOW">Baixa</option>
        </select>
      </div>
    </div>
  );
};

