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

export const PrioritySignalIcon: React.FC<{
  priority: TicketPriority;
  className?: string;
}> = ({ priority, className = 'w-3.5 h-3.5' }) => {
  if (priority === 'CRITICAL') {
    return (
      <WarningOctagon
        className={`${className} text-[#fda4af] shrink-0`}
        weight="fill"
      />
    );
  }

  const activeBars =
    priority === 'HIGH' ? 3 : priority === 'MEDIUM' ? 2 : 1;

  const activeColor =
    priority === 'HIGH'
      ? '#fdba74'
      : priority === 'MEDIUM'
        ? '#7dd3fc'
        : '#94a3b8';

  const inactiveColor = 'rgba(255, 255, 255, 0.16)';

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
          className={`${className} text-[#7dd3fc] shrink-0`}
          weight="bold"
        />
      );
    case 'IN_PROGRESS':
      return (
        <CircleHalf
          className={`${className} text-[#a5b4fc] shrink-0`}
          weight="fill"
        />
      );
    case 'WAITING_USER':
      return (
        <Clock
          className={`${className} text-[#fcd34d] shrink-0`}
          weight="fill"
        />
      );
    case 'RESOLVED':
      return (
        <CheckCircle
          className={`${className} text-[#6ee7b7] shrink-0`}
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
          className={`${className} text-[#fda4af] shrink-0`}
          weight="duotone"
        />
      );
  }
};

export const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const styles: Record<TicketStatus, string> = {
    OPEN: 'bg-[#14222e] text-[#7dd3fc] border-[#223a4e]',
    IN_PROGRESS: 'bg-[#1c1d33] text-[#a5b4fc] border-[#2e3154]',
    WAITING_USER: 'bg-[#292112] text-[#fcd34d] border-[#42351b]',
    RESOLVED: 'bg-[#12261e] text-[#6ee7b7] border-[#1d3d31]',
    CLOSED: 'bg-[#1c1c1c] text-[#a1a1aa] border-[#2e2e2e]',
    CANCELLED: 'bg-[#291518] text-[#fda4af] border-[#452126] line-through',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium border ${styles[status]}`}
    >
      <StatusIcon status={status} className="w-3.5 h-3.5" />
      <span>{STATUS_LABELS[status]}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({
  priority,
}) => {
  const styles: Record<TicketPriority, string> = {
    LOW: 'bg-[#181d22] text-[#94a3b8] border-[#283038]',
    MEDIUM: 'bg-[#14222e] text-[#7dd3fc] border-[#223a4e]',
    HIGH: 'bg-[#291f13] text-[#fdba74] border-[#42321b]',
    CRITICAL: 'bg-[#291518] text-[#fda4af] border-[#452126]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium border ${styles[priority]}`}
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
  const styles: Record<SlaHealth, { pill: string; dot: string }> = {
    ON_TIME: {
      pill: 'bg-[#12261e] text-[#6ee7b7] border-[#1d3d31]',
      dot: 'bg-[#34d399]',
    },
    AT_RISK: {
      pill: 'bg-[#292112] text-[#fcd34d] border-[#42351b]',
      dot: 'bg-[#fbbf24]',
    },
    BREACHED: {
      pill: 'bg-[#291518] text-[#fda4af] border-[#452126]',
      dot: 'bg-[#fb7185]',
    },
    COMPLETED: {
      pill: 'bg-[#1b1b1b] text-[#c4c7c8] border-[#2e2e2e]',
      dot: 'bg-[#8e9192]',
    },
  };

  const current = styles[health];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono border ${current.pill}`}
    >
      <span className={`w-1.5 h-1.5 shrink-0 ${current.dot}`} />
      <span>{text}</span>
    </span>
  );
};
