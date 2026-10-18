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
            className="w-4 h-4 text-[#8e9192]"
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
          <span className="w-5 h-5 bg-[#242424] border border-[#444748]/60 text-[10px] font-mono text-white inline-flex items-center justify-center">
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
      <div className="relative z-10 glass-panel p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192]">
            STATUS
          </h3>
          <StatusBadge status={ticket.status} />
        </div>

        {isTerminal ? (
          <p className="text-xs text-[#8e9192] neumorphic-inset p-3">
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

      {/* Card 2: Assignee (z-30 so its dropdown floats over Card 3) */}
      <div className="relative z-30 glass-panel p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192]">
            RESPONSÁVEL
          </h3>
          <UserCheck className="w-4 h-4 text-[#7dd3fc]" />
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
            className="font-mono text-[11px] uppercase tracking-wider text-[#7dd3fc] hover:text-white transition-colors cursor-pointer"
          >
            ASSUMIR CHAMADO [ → ]
          </button>
        )}
      </div>

      {/* Card 3: Priority & SLA Target (z-20) */}
      <div className="relative z-20 glass-panel p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192]">
            PRIORIDADE E SLA
          </h3>
          <Clock className="w-4 h-4 text-[#a5b4fc]" />
        </div>

        <DropdownSelect
          disabled={isTerminal || activeRole === 'EMPLOYEE'}
          value={ticket.priority}
          options={PRIORITY_SELECT_OPTIONS}
          onChange={(val) => onChangePriority(val)}
        />

        <div className="neumorphic-inset p-3.5 space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#8e9192]">Prazo</span>
            <SlaBadge health={sla.health} text={sla.badgeText} />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#444748]/35">
            <span className="text-[#8e9192] flex items-center gap-1.5">
              <CalendarBlank className="w-3.5 h-3.5 text-[#8e9192]" />
              Vencimento
            </span>
            <span className="text-white font-mono text-[11px]">
              {formatDateTime(ticket.dueAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
