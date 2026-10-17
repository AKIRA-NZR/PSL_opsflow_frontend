import React, { useMemo } from 'react';
import { CalendarBlank, Clock, UserCheck, UserCircleDashed } from '@phosphor-icons/react';
import {
  PrioritySignalIcon,
  SlaBadge,
  StatusBadge,
  StatusIcon,
} from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  DropdownSelect,
  type DropdownOption,
} from '../../components/ui/DropdownSelect';
import {
  ALLOWED_STATUS_TRANSITIONS,
  STATUS_ACTION_LABELS,
} from '../../core/constants/ticket.constants';
import type {
  RoleName,
  Ticket,
  TicketPriority,
  TicketStatus,
  User,
} from '../../core/types/domain.types';
import { formatDateTime, getInitials } from '../../core/utils/date.utils';
import { evaluateTicketSla } from '../../core/utils/sla.utils';

interface TicketActionPanelProps {
  ticket: Ticket;
  currentUser: User;
  activeRole: RoleName;
  technicians: User[];
  onTransitionStatus: (targetStatus: TicketStatus) => void;
  onAssign: (assigneeId: string | null) => void;
  onChangePriority: (priority: TicketPriority) => void;
}

const PRIORITY_SELECT_OPTIONS: DropdownOption<TicketPriority>[] = [
  {
    value: 'LOW',
    label: 'Baixa',
    description: 'Meta de atendimento: 72 horas',
    icon: <PrioritySignalIcon priority="LOW" />,
  },
  {
    value: 'MEDIUM',
    label: 'Média',
    description: 'Meta de atendimento: 24 horas',
    icon: <PrioritySignalIcon priority="MEDIUM" />,
  },
  {
    value: 'HIGH',
    label: 'Alta',
    description: 'Meta de atendimento: 8 horas',
    icon: <PrioritySignalIcon priority="HIGH" />,
  },
  {
    value: 'CRITICAL',
    label: 'Crítica',
    description: 'Meta de atendimento: 4 horas',
    icon: <PrioritySignalIcon priority="CRITICAL" />,
  },
];

export const TicketActionPanel: React.FC<TicketActionPanelProps> = ({
  ticket,
  currentUser,
  activeRole,
  technicians,
  onTransitionStatus,
  onAssign,
  onChangePriority,
}) => {
  const sla = evaluateTicketSla(ticket);
  const allowedNext = ALLOWED_STATUS_TRANSITIONS[ticket.status];
  const isTerminal =
    ticket.status === 'CLOSED' || ticket.status === 'CANCELLED';

  const canAssignToSelf =
    !isTerminal &&
    activeRole !== 'EMPLOYEE' &&
    ticket.assigneeId !== currentUser.id;

  const assigneeOptions: DropdownOption<string>[] = useMemo(() => {
    const base: DropdownOption<string>[] = [
      {
        value: '',
        label: 'Aguardando atribuição',
        description: 'Disponível na fila geral',
        icon: (
          <UserCircleDashed
            className="w-4 h-4 text-[#64748B]"
            weight="duotone"
          />
        ),
      },
    ];

    for (const tech of technicians) {
      base.push({
        value: tech.id,
        label: tech.name,
        description: tech.department,
        icon: (
          <span className="w-5 h-5 rounded-full bg-[#232936] border border-[#333C4D] text-[10px] font-semibold text-[#C7D2FE] inline-flex items-center justify-center">
            {getInitials(tech.name)}
          </span>
        ),
      });
    }

    return base;
  }, [technicians]);

  return (
    <div className="space-y-5">
      {/* Card 1: Current Status & Workflow Transitions */}
      <div className="rounded-2xl glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Status do Chamado
          </h3>
          <StatusBadge status={ticket.status} />
        </div>

        {isTerminal ? (
          <p className="text-xs text-[#94A3B8] leading-relaxed neumorphic-inset rounded-xl p-3.5">
            Este chamado já foi finalizado e encontra-se arquivado para consulta.
          </p>
        ) : (
          <div className="space-y-2 pt-1">
            <span className="text-xs text-[#94A3B8] block">
              Próxima etapa disponível:
            </span>
            <div className="flex flex-col gap-2">
              {allowedNext.map((nextStatus) => {
                const variant =
                  nextStatus === 'RESOLVED' || nextStatus === 'CLOSED'
                    ? 'success'
                    : nextStatus === 'CANCELLED'
                      ? 'danger'
                      : 'secondary';

                return (
                  <Button
                    key={nextStatus}
                    variant={variant}
                    size="md"
                    icon={<StatusIcon status={nextStatus} className="w-4 h-4" />}
                    className="w-full justify-start"
                    onClick={() => onTransitionStatus(nextStatus)}
                  >
                    {STATUS_ACTION_LABELS[nextStatus]}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Card 2: Assignee */}
      <div className="rounded-2xl glass-panel p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Responsável
          </h3>
          <UserCheck className="w-4 h-4 text-[#93C5FD]" weight="duotone" />
        </div>

        <DropdownSelect
          disabled={isTerminal || activeRole === 'EMPLOYEE'}
          value={ticket.assigneeId || ''}
          options={assigneeOptions}
          onChange={(val) => onAssign(val || null)}
        />

        {canAssignToSelf && (
          <button
            type="button"
            onClick={() => onAssign(currentUser.id)}
            className="text-xs font-medium text-[#93C5FD] hover:text-white transition-colors cursor-pointer"
          >
            Assumir este atendimento →
          </button>
        )}
      </div>

      {/* Card 3: Priority & SLA Target */}
      <div className="rounded-2xl glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Prioridade e Prazo
          </h3>
          <Clock className="w-4 h-4 text-[#A5B4FC]" weight="duotone" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-[#94A3B8] block">
            Classificação de urgência
          </label>
          <DropdownSelect
            disabled={isTerminal || activeRole === 'EMPLOYEE'}
            value={ticket.priority}
            options={PRIORITY_SELECT_OPTIONS}
            onChange={(val) => onChangePriority(val)}
          />
        </div>

        <div className="rounded-xl neumorphic-inset p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#94A3B8]">Situação do prazo</span>
            <SlaBadge health={sla.health} text={sla.badgeText} />
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.06]">
            <span className="text-[#94A3B8] flex items-center gap-1.5">
              <CalendarBlank
                className="w-3.5 h-3.5 text-[#93C5FD]"
                weight="duotone"
              />
              Prazo limite
            </span>
            <span className="text-[#F4F7FB] font-medium">
              {formatDateTime(ticket.dueAt)}
            </span>
          </div>

          {sla.wasRecalculated && (
            <div className="flex items-center justify-between text-[#64748B]">
              <span>Meta inicial de abertura</span>
              <span>{formatDateTime(ticket.originalDueAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

