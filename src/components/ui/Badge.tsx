import React from 'react';
import {
  CheckCircle,
  Clock,
  CircleDashed,
  CircleHalf,
  MinusCircle,
  SealCheck,
  Timer,
  WarningOctagon,
  ShieldStar,
  Wrench,
  UserCircle,
} from '@phosphor-icons/react';
import {
  PRIORITY_LABELS,
  ROLE_LABELS,
  STATUS_LABELS,
} from '../../core/constants/ticket.constants';
import type {
  RoleName,
  SlaHealth,
  TicketPriority,
  TicketStatus,
} from '../../core/types/domain.types';

/**
 * Custom SVG Signal Bars for Priority (Linear-inspired urgency indicator)
 */
export const PrioritySignalIcon: React.FC<{
  priority: TicketPriority;
  className?: string;
}> = ({ priority, className = 'w-3.5 h-3.5' }) => {
  if (priority === 'CRITICAL') {
    return (
      <WarningOctagon
        className={`${className} text-rose-400 shrink-0`}
        weight="fill"
      />
    );
  }

  const activeBars =
    priority === 'HIGH' ? 3 : priority === 'MEDIUM' ? 2 : 1;

  const activeColor =
    priority === 'HIGH'
      ? '#FB923C' // Orange-400
      : priority === 'MEDIUM'
        ? '#60A5FA' // Blue-400
        : '#94A3B8'; // Slate-400

  const mutedColor = '#333B4D';

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
        rx="1"
        fill={activeBars >= 1 ? activeColor : mutedColor}
      />
      <rect
        x="6.7"
        y="6.5"
        width="2.6"
        height="7.5"
        rx="1"
        fill={activeBars >= 2 ? activeColor : mutedColor}
      />
      <rect
        x="11.4"
        y="2.5"
        width="2.6"
        height="11.5"
        rx="1"
        fill={activeBars >= 3 ? activeColor : mutedColor}
      />
    </svg>
  );
};

/**
 * Dedicated vector icon for each TicketStatus
 */
export const StatusIcon: React.FC<{
  status: TicketStatus;
  className?: string;
}> = ({ status, className = 'w-3.5 h-3.5' }) => {
  switch (status) {
    case 'OPEN':
      return (
        <CircleDashed
          className={`${className} text-[#60A5FA] shrink-0`}
          weight="bold"
        />
      );
    case 'IN_PROGRESS':
      return (
        <CircleHalf
          className={`${className} text-[#818CF8] shrink-0`}
          weight="fill"
        />
      );
    case 'WAITING_USER':
      return (
        <Clock
          className={`${className} text-[#FBBF24] shrink-0`}
          weight="fill"
        />
      );
    case 'RESOLVED':
      return (
        <CheckCircle
          className={`${className} text-[#34D399] shrink-0`}
          weight="fill"
        />
      );
    case 'CLOSED':
      return (
        <SealCheck
          className={`${className} text-[#94A3B8] shrink-0`}
          weight="fill"
        />
      );
    case 'CANCELLED':
      return (
        <MinusCircle
          className={`${className} text-[#64748B] shrink-0`}
          weight="duotone"
        />
      );
  }
};

/**
 * Modern Status Badge with custom state icon, soft surface tint, and subtle inner border
 */
export const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const styles: Record<TicketStatus, string> = {
    OPEN: 'bg-[#1E293B]/90 text-[#BFDBFE] border-[#3B82F6]/30',
    IN_PROGRESS: 'bg-[#1E2238]/95 text-[#C7D2FE] border-[#6366F1]/35',
    WAITING_USER: 'bg-[#2B2318]/90 text-[#FDE68A] border-[#F59E0B]/30',
    RESOLVED: 'bg-[#142924]/90 text-[#A7F3D0] border-[#10B981]/30',
    CLOSED: 'bg-[#1E232D] text-[#CBD5E1] border-[#333C4D]',
    CANCELLED: 'bg-[#181C24] text-[#64748B] border-[#262C3A] line-through',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border shadow-2xs transition-colors ${styles[status]}`}
    >
      <StatusIcon status={status} />
      <span>{STATUS_LABELS[status]}</span>
    </span>
  );
};

/**
 * Modern Priority Badge with Signal Bars / Urgency Icon
 */
export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({
  priority,
}) => {
  const styles: Record<TicketPriority, string> = {
    LOW: 'bg-[#181C24] text-[#94A3B8] border-[#262C3A]',
    MEDIUM: 'bg-[#1B2230] text-[#CBD5E1] border-[#2E384D]',
    HIGH: 'bg-[#2A2019] text-[#FDBA74] border-[#EA580C]/30',
    CRITICAL: 'bg-[#2C1820] text-[#FECDD3] border-[#F43F5E]/35',
  };

  return (
    <span
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${styles[priority]}`}
    >
      <PrioritySignalIcon priority={priority} />
      <span>{PRIORITY_LABELS[priority]}</span>
    </span>
  );
};

/**
 * Modern SLA Health Indicator Pill
 */
export const SlaBadge: React.FC<{ health: SlaHealth; text: string }> = ({
  health,
  text,
}) => {
  const config: Record<
    SlaHealth,
    { style: string; icon: React.ReactNode }
  > = {
    ON_TIME: {
      style: 'bg-[#162723] text-[#A7F3D0] border-[#10B981]/25',
      icon: <Timer className="w-3.5 h-3.5 text-[#34D399] shrink-0" weight="duotone" />,
    },
    AT_RISK: {
      style: 'bg-[#2B2318] text-[#FDE68A] border-[#F59E0B]/30',
      icon: <Timer className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" weight="fill" />,
    },
    BREACHED: {
      style: 'bg-[#2C1820] text-[#FECDD3] border-[#F43F5E]/35',
      icon: (
        <WarningOctagon
          className="w-3.5 h-3.5 text-[#FB7185] shrink-0"
          weight="fill"
        />
      ),
    },
    COMPLETED: {
      style: 'bg-[#181C24] text-[#94A3B8] border-[#262C3A]',
      icon: (
        <CheckCircle
          className="w-3.5 h-3.5 text-[#64748B] shrink-0"
          weight="duotone"
        />
      ),
    },
  };

  const current = config[health];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${current.style}`}
    >
      {current.icon}
      <span>{text}</span>
    </span>
  );
};

/**
 * Modern Role Pill with Subtle Icon
 */
export const RolePill: React.FC<{ role: RoleName }> = ({ role }) => {
  const config: Record<
    RoleName,
    { style: string; icon: React.ReactNode }
  > = {
    ADMIN: {
      style: 'bg-[#1E2238] text-[#C7D2FE] border-[#6366F1]/30',
      icon: <ShieldStar className="w-3.5 h-3.5 text-[#818CF8]" weight="duotone" />,
    },
    TECHNICIAN: {
      style: 'bg-[#142924] text-[#A7F3D0] border-[#10B981]/30',
      icon: <Wrench className="w-3.5 h-3.5 text-[#34D399]" weight="duotone" />,
    },
    EMPLOYEE: {
      style: 'bg-[#181C24] text-[#CBD5E1] border-[#2A3140]',
      icon: <UserCircle className="w-3.5 h-3.5 text-[#94A3B8]" weight="duotone" />,
    },
  };

  const current = config[role];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium border ${current.style}`}
    >
      {current.icon}
      <span>{ROLE_LABELS[role]}</span>
    </span>
  );
};
