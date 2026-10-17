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
    label: 'Baixa (72h)',
    icon: <PrioritySignalIcon priority="LOW" />,
  },
  {
    value: 'MEDIUM',
    label: 'Média (24h)',
    icon: <PrioritySignalIcon priority="MEDIUM" />,
  },
  {
    value: 'HIGH',
    label: 'Alta (8h)',
    icon: <PrioritySignalIcon priority="HIGH" />,
  },
  {
    value: 'CRITICAL',
    label: 'Crítica (4h)',
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
        label: 'Sem responsável',
        icon: (
          <UserCircleDashed
            className="w-4 h-4 text-zinc-500"
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
          <span className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/15 text-[10px] font-semibold text-zinc-200 inline-flex items-center justify-center">
            {getInitials(tech.name)}
          </span>
        ),
      });
    }

    return base;
  }, [technicians]);

  return (
    <div className="space-y-4">
      {/* Card 1: Current Status & Workflow Transitions */}
      <div className="rounded-2xl glass-panel p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Status
          </h3>
          <StatusBadge status={ticket.status} />
        </div>

        {isTerminal ? (
          <p className="text-xs text-zinc-500 neumorphic-inset rounded-xl p-3">
            Chamado arquivado.
          </p>
        ) : (
          <div className="flex flex-col gap-2 pt-1">
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
                  icon={<StatusIcon status={nextStatus} />}
                  className="w-full justify-start"
                  onClick={() => onTransitionStatus(nextStatus)}
                >
                  {STATUS_ACTION_LABELS[nextStatus]}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Card 2: Assignee */}
      <div className="rounded-2xl glass-panel p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Responsável
          </h3>
          <UserCheck className="w-4 h-4 text-zinc-400" weight="duotone" />
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
            className="text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Assumir chamado →
          </button>
        )}
      </div>

      {/* Card 3: Priority & SLA Target */}
      <div className="rounded-2xl glass-panel p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Prioridade e SLA
          </h3>
          <Clock className="w-4 h-4 text-zinc-400" weight="duotone" />
        </div>

        <DropdownSelect
          disabled={isTerminal || activeRole === 'EMPLOYEE'}
          value={ticket.priority}
          options={PRIORITY_SELECT_OPTIONS}
          onChange={(val) => onChangePriority(val)}
        />

        <div className="rounded-xl neumorphic-inset p-3.5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Prazo</span>
            <SlaBadge health={sla.health} text={sla.badgeText} />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
            <span className="text-zinc-400 flex items-center gap-1.5">
              <CalendarBlank
                className="w-3.5 h-3.5 text-zinc-400"
                weight="duotone"
              />
              Vencimento
            </span>
            <span className="text-zinc-200 font-medium">
              {formatDateTime(ticket.dueAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
