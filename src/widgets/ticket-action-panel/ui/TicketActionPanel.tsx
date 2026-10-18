import React, { useMemo } from 'react';
import { Clock, UserCheck, UserCircleDashed } from '@phosphor-icons/react';
import {
  ALLOWED_STATUS_TRANSITIONS,
  evaluateTicketSla,
  formatDateTime,
  getInitials,
  STATUS_ACTION_LABELS,
  type RoleName,
  type Ticket,
  type TicketPriority,
  type TicketStatus,
  type User,
} from '@opsflow/domain';
import {
  Button,
  DropdownSelect,
  type DropdownOption,
} from '@opsflow/ui';
import {
  PrioritySignalIcon,
  SlaBadge,
  StatusBadge,
  StatusIcon,
} from '@entities/ticket';

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
    icon: <PrioritySignalIcon priority="LOW" />,
  },
  {
    value: 'MEDIUM',
    label: 'Média',
    icon: <PrioritySignalIcon priority="MEDIUM" />,
  },
  {
    value: 'HIGH',
    label: 'Alta',
    icon: <PrioritySignalIcon priority="HIGH" />,
  },
  {
    value: 'CRITICAL',
    label: 'Crítica',
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
      <div className="relative z-10 glass-panel p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192]">
            STATUS
          </h3>
          <StatusBadge status={ticket.status} />
        </div>

        {!isTerminal && (
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
            className="font-mono text-[10px] uppercase tracking-wider text-[#7dd3fc] hover:text-white transition-colors cursor-pointer"
          >
            ASSUMIR [ → ]
          </button>
        )}
      </div>

      <div className="relative z-20 glass-panel p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192]">
            PRIORIDADE
          </h3>
          <Clock className="w-4 h-4 text-[#a5b4fc]" />
        </div>

        <DropdownSelect
          disabled={isTerminal || activeRole === 'EMPLOYEE'}
          value={ticket.priority}
          options={PRIORITY_SELECT_OPTIONS}
          onChange={(val) => onChangePriority(val)}
        />

        <div className="neumorphic-inset px-3.5 py-2.5 flex items-center justify-between text-xs">
          <SlaBadge health={sla.health} text={sla.badgeText} />
          <span className="text-[#8e9192] font-mono text-[11px]">
            {formatDateTime(ticket.dueAt)}
          </span>
        </div>
      </div>
    </div>
  );
};
