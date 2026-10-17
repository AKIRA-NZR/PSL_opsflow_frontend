import React from 'react';
import { FunnelSimple, MagnifyingGlass, X } from '@phosphor-icons/react';
import {
  PrioritySignalIcon,
  StatusIcon,
} from '../../components/ui/Badge';
import {
  DropdownSelect,
  type DropdownOption,
} from '../../components/ui/DropdownSelect';
import type { TicketPriority, TicketStatus } from '../../core/types/domain.types';
import type { TicketFilterState } from '../../core/types/service.types';

interface TicketFilterBarProps {
  filters: TicketFilterState;
  onChange: (next: Partial<TicketFilterState>) => void;
}

const STATUS_OPTIONS: DropdownOption<TicketStatus | 'ALL'>[] = [
  {
    value: 'ALL',
    label: 'Status: Todos',
    icon: <FunnelSimple className="w-3.5 h-3.5 text-[#94A3B8]" weight="bold" />,
  },
  {
    value: 'OPEN',
    label: 'Aberto',
    description: 'Aguardando triagem inicial',
    icon: <StatusIcon status="OPEN" />,
  },
  {
    value: 'IN_PROGRESS',
    label: 'Em Atendimento',
    description: 'Técnico atuando no chamado',
    icon: <StatusIcon status="IN_PROGRESS" />,
  },
  {
    value: 'WAITING_USER',
    label: 'Aguardando Solicitante',
    description: 'Pendente de retorno do usuário',
    icon: <StatusIcon status="WAITING_USER" />,
  },
  {
    value: 'RESOLVED',
    label: 'Resolvido',
    description: 'Solução registrada pela equipe',
    icon: <StatusIcon status="RESOLVED" />,
  },
  {
    value: 'CLOSED',
    label: 'Concluído',
    description: 'Chamado encerrado',
    icon: <StatusIcon status="CLOSED" />,
  },
  {
    value: 'CANCELLED',
    label: 'Cancelado',
    description: 'Solicitação cancelada',
    icon: <StatusIcon status="CANCELLED" />,
  },
];

const PRIORITY_OPTIONS: DropdownOption<TicketPriority | 'ALL'>[] = [
  {
    value: 'ALL',
    label: 'Prioridade: Todas',
    icon: <FunnelSimple className="w-3.5 h-3.5 text-[#94A3B8]" weight="bold" />,
  },
  {
    value: 'CRITICAL',
    label: 'Crítica',
    description: 'Meta de atendimento: 4 horas',
    icon: <PrioritySignalIcon priority="CRITICAL" />,
  },
  {
    value: 'HIGH',
    label: 'Alta',
    description: 'Meta de atendimento: 8 horas',
    icon: <PrioritySignalIcon priority="HIGH" />,
  },
  {
    value: 'MEDIUM',
    label: 'Média',
    description: 'Meta de atendimento: 24 horas',
    icon: <PrioritySignalIcon priority="MEDIUM" />,
  },
  {
    value: 'LOW',
    label: 'Baixa',
    description: 'Meta de atendimento: 72 horas',
    icon: <PrioritySignalIcon priority="LOW" />,
  },
];

export const TicketFilterBar: React.FC<TicketFilterBarProps> = ({
  filters,
  onChange,
}) => {
  const hasActiveFilters =
    filters.status !== 'ALL' ||
    filters.priority !== 'ALL' ||
    filters.search.trim().length > 0;

  return (
    <div className="rounded-2xl glass-panel p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div className="relative flex-1 max-w-md">
        <MagnifyingGlass
          className="w-4 h-4 text-[#93C5FD] absolute left-3.5 top-1/2 -translate-y-1/2"
          weight="duotone"
        />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Pesquisar por número ou assunto do chamado..."
          className="w-full rounded-xl neumorphic-inset pl-10 pr-4 py-2.5 text-sm text-[#F4F7FB] placeholder-[#64748B] focus:outline-none transition-all"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <DropdownSelect
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(val) => onChange({ status: val })}
          className="w-52"
          align="right"
        />

        <DropdownSelect
          value={filters.priority}
          options={PRIORITY_OPTIONS}
          onChange={(val) => onChange({ priority: val })}
          className="w-48"
          align="right"
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() =>
              onChange({ status: 'ALL', priority: 'ALL', search: '' })
            }
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#94A3B8] hover:text-[#F4F7FB] tactile-surface transition-all cursor-pointer"
          >
            <X className="w-3.5 h-3.5" weight="bold" />
            Limpar
          </button>
        )}
      </div>
    </div>
  );
};

