import React from 'react';
import { FunnelSimple, MagnifyingGlass, X } from '@phosphor-icons/react';
import type {
  TicketFilterState,
  TicketPriority,
  TicketStatus,
} from '@opsflow/domain';
import { DropdownSelect, type DropdownOption } from '@opsflow/ui';
import { PrioritySignalIcon, StatusIcon } from '@entities/ticket';

interface TicketFilterBarProps {
  filters: TicketFilterState;
  onChange: (next: Partial<TicketFilterState>) => void;
}

const STATUS_OPTIONS: DropdownOption<TicketStatus | 'ALL'>[] = [
  {
    value: 'ALL',
    label: 'Status',
    icon: <FunnelSimple className="w-3.5 h-3.5 text-[#8e9192]" weight="bold" />,
  },
  {
    value: 'OPEN',
    label: 'Aberto',
    icon: <StatusIcon status="OPEN" />,
  },
  {
    value: 'IN_PROGRESS',
    label: 'Em Atendimento',
    icon: <StatusIcon status="IN_PROGRESS" />,
  },
  {
    value: 'WAITING_USER',
    label: 'Aguardando',
    icon: <StatusIcon status="WAITING_USER" />,
  },
  {
    value: 'RESOLVED',
    label: 'Resolvido',
    icon: <StatusIcon status="RESOLVED" />,
  },
  {
    value: 'CLOSED',
    label: 'Concluído',
    icon: <StatusIcon status="CLOSED" />,
  },
  {
    value: 'CANCELLED',
    label: 'Cancelado',
    icon: <StatusIcon status="CANCELLED" />,
  },
];

const PRIORITY_OPTIONS: DropdownOption<TicketPriority | 'ALL'>[] = [
  {
    value: 'ALL',
    label: 'Prioridade',
    icon: <FunnelSimple className="w-3.5 h-3.5 text-[#8e9192]" weight="bold" />,
  },
  {
    value: 'CRITICAL',
    label: 'Crítica',
    icon: <PrioritySignalIcon priority="CRITICAL" />,
  },
  {
    value: 'HIGH',
    label: 'Alta',
    icon: <PrioritySignalIcon priority="HIGH" />,
  },
  {
    value: 'MEDIUM',
    label: 'Média',
    icon: <PrioritySignalIcon priority="MEDIUM" />,
  },
  {
    value: 'LOW',
    label: 'Baixa',
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
    <div className="relative z-30 glass-panel p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <div className="relative flex-1 max-w-md">
        <MagnifyingGlass
          className="w-4 h-4 text-[#8e9192] absolute left-3.5 top-1/2 -translate-y-1/2"
          weight="bold"
        />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Buscar..."
          className="w-full neumorphic-inset pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-[#8e9192] focus:outline-none transition-colors"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <DropdownSelect
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(val) => onChange({ status: val })}
          className="w-40"
          align="right"
        />

        <DropdownSelect
          value={filters.priority}
          options={PRIORITY_OPTIONS}
          onChange={(val) => onChange({ priority: val })}
          className="w-40"
          align="right"
        />

        {hasActiveFilters && (
          <button
            type="button"
            onClick={() =>
              onChange({ status: 'ALL', priority: 'ALL', search: '' })
            }
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#c4c7c8] hover:text-white bg-[#1b1b1b] border border-[#444748]/50 hover:border-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" weight="bold" />
            Limpar
          </button>
        )}
      </div>
    </div>
  );
};

