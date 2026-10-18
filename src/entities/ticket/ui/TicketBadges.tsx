import React from 'react';
import {
  CheckCircle,
  Clock,
  CircleDashed,
  CircleHalf,
  MinusCircle,
  SealCheck,
  WarningOctagon,
} from '@phosphor-icons/react';
import {
  PRIORITY_LABELS,
  STATUS_LABELS,
  type SlaHealth,
  type TicketPriority,
  type TicketStatus,
} from '@opsflow/domain';
import { COMPONENT_TOKENS } from '@opsflow/ui';

export const PrioritySignalIcon: React.FC<{
  priority: TicketPriority;
  className?: string;
}> = ({ priority, className = 'w-3.5 h-3.5' }) => {
  if (priority === 'CRITICAL') {
    return (
      <WarningOctagon
        className={`${className} text-status-coral shrink-0`}
        weight="fill"
      />
    );
  }

  const activeBars =
    priority === 'HIGH' ? 3 : priority === 'MEDIUM' ? 2 : 1;

  const activeColor = COMPONENT_TOKENS.prioritySignalColor[priority];
  const inactiveColor = COMPONENT_TOKENS.prioritySignalColor.inactiveBar;

  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className={`${className} shrink-0`}
      aria-hidden="true"
    >
      <rect
        x="2"
        y="10"
        width="2.6"
        height="4"
        fill={activeBars >= 1 ? activeColor : inactiveColor}
      />
      <rect
        x="6.7"
        y="6.5"
        width="2.6"
        height="7.5"
        fill={activeBars >= 2 ? activeColor : inactiveColor}
      />
      <rect
        x="11.4"
        y="2.5"
        width="2.6"
        height="11.5"
        fill={activeBars >= 3 ? activeColor : inactiveColor}
      />
    </svg>
  );
};

export const StatusIcon: React.FC<{
  status: TicketStatus;
  className?: string;
}> = ({ status, className = 'w-3.5 h-3.5' }) => {
  switch (status) {
    case 'OPEN':
      return (
        <CircleDashed
          className={`${className} text-status-sky shrink-0`}
          weight="bold"
        />
      );
    case 'IN_PROGRESS':
      return (
        <CircleHalf
          className={`${className} text-status-lavender shrink-0`}
          weight="fill"
        />
      );
    case 'WAITING_USER':
      return (
        <Clock
          className={`${className} text-status-amber shrink-0`}
          weight="fill"
        />
      );
    case 'RESOLVED':
      return (
        <CheckCircle
          className={`${className} text-status-sage shrink-0`}
          weight="fill"
        />
      );
    case 'CLOSED':
      return (
        <SealCheck
          className={`${className} text-[#a1a1aa] shrink-0`}
          weight="fill"
        />
      );
    case 'CANCELLED':
      return (
        <MinusCircle
          className={`${className} text-status-coral shrink-0`}
          weight="duotone"
        />
      );
  }
};

export const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium border ${COMPONENT_TOKENS.statusBadge[status]}`}
    >
      <StatusIcon status={status} className="w-3.5 h-3.5" />
      <span>{STATUS_LABELS[status]}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({
  priority,
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium border ${COMPONENT_TOKENS.priorityBadge[priority]}`}
    >
      <PrioritySignalIcon priority={priority} />
      <span>{PRIORITY_LABELS[priority]}</span>
    </span>
  );
};

export const SlaBadge: React.FC<{ health: SlaHealth; text: string }> = ({
  health,
  text,
}) => {
  const current = COMPONENT_TOKENS.slaBadge[health];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono border ${current.pill}`}
    >
      <span className={`w-1.5 h-1.5 shrink-0 ${current.dot}`} />
      <span>{text}</span>
    </span>
  );
};
