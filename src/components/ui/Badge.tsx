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
 * Custom SVG Signal Bars for Priority using muted, non-neon architectural tones
 */
export const PrioritySignalIcon: React.FC<{
  priority: TicketPriority;
  className?: string;
}> = ({ priority, className = 'w-3.5 h-3.5' }) => {
  if (priority === 'CRITICAL') {
    return (
      <WarningOctagon
        className={`${className} text-[#C98A94] shrink-0`}
        weight="duotone"
      />
    );
  }

  const activeBars =
    priority === 'HIGH' ? 3 : priority === 'MEDIUM' ? 2 : 1;

  const activeColor =
    priority === 'HIGH'
      ? '#C49A72' // Muted Warm Sand/Amber
      : priority === 'MEDIUM'
        ? '#8BA3BE' // Muted Steel Blue
        : '#7D8796'; // Muted Slate

  const mutedColor = '#2A303C';

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
 * Dedicated vector icon for each TicketStatus in soft, desaturated tones
 */
export const StatusIcon: React.FC<{
  status: TicketStatus;
  className?: string;
}> = ({ status, className = 'w-3.5 h-3.5' }) => {
  switch (status) {
    case 'OPEN':
      return (
        <CircleDashed
          className={`${className} text-[#8BA3BE] shrink-0`}
          weight="bold"
        />
      );
    case 'IN_PROGRESS':
      return (
        <CircleHalf
          className={`${className} text-[#969ECA] shrink-0`}
          weight="fill"
        />
      );
    case 'WAITING_USER':
      return (
        <Clock
          className={`${className} text-[#C4A676] shrink-0`}
          weight="duotone"
        />
      );
    case 'RESOLVED':
      return (
        <CheckCircle
          className={`${className} text-[#7FA998] shrink-0`}
          weight="fill"
        />
      );
    case 'CLOSED':
      return (
        <SealCheck
          className={`${className} text-[#838D9B] shrink-0`}
          weight="duotone"
        />
      );
    case 'CANCELLED':
      return (
        <MinusCircle
          className={`${className} text-[#646E7D] shrink-0`}
          weight="duotone"
        />
      );
  }
};

/**
 * Matte, Soft Dark Mode Status Badge (Zero Neon)
 */
export const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const styles: Record<TicketStatus, string> = {
    OPEN: 'bg-[#1A212B] text-[#B8C7D9] border-[#2B3646]',
    IN_PROGRESS: 'bg-[#1D2030] text-[#C2C7E2] border-[#323854]',
    WAITING_USER: 'bg-[#231F19] text-[#D4BE98] border-[#3A3226]',
    RESOLVED: 'bg-[#17231F] text-[#A8C7BA] border-[#263B34]',
    CLOSED: 'bg-[#191D24] text-[#9BA3B0] border-[#282E38]',
    CANCELLED: 'bg-[#161920] text-[#687282] border-[#222731]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${styles[status]}`}
    >
      <StatusIcon status={status} />
      <span>{STATUS_LABELS[status]}</span>
    </span>
  );
};

/**
 * Matte Priority Badge with subtle neutral/earthy tones
 */
export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({
  priority,
}) => {
  const styles: Record<TicketPriority, string> = {
    LOW: 'bg-[#171A21] text-[#8E97A6] border-[#242934]',
    MEDIUM: 'bg-[#191F28] text-[#AEBDD0] border-[#283240]',
    HIGH: 'bg-[#231E19] text-[#D1B08E] border-[#382F26]',
    CRITICAL: 'bg-[#251A1D] text-[#D6A6AE] border-[#3D292E]',
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
 * Matte SLA Health Indicator Pill
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
      style: 'bg-[#17231F] text-[#A8C7BA] border-[#263B34]',
      icon: <Timer className="w-3.5 h-3.5 text-[#7FA998] shrink-0" weight="duotone" />,
    },
    AT_RISK: {
      style: 'bg-[#231F19] text-[#D4BE98] border-[#3A3226]',
      icon: <Timer className="w-3.5 h-3.5 text-[#C4A676] shrink-0" weight="duotone" />,
    },
    BREACHED: {
      style: 'bg-[#251A1D] text-[#D6A6AE] border-[#3D292E]',
      icon: (
        <WarningOctagon
          className="w-3.5 h-3.5 text-[#C98A94] shrink-0"
          weight="duotone"
        />
      ),
    },
    COMPLETED: {
      style: 'bg-[#171A21] text-[#8E97A6] border-[#242934]',
      icon: (
        <CheckCircle
          className="w-3.5 h-3.5 text-[#727C8C] shrink-0"
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
 * Matte Role Pill
 */
export const RolePill: React.FC<{ role: RoleName }> = ({ role }) => {
  const config: Record<
    RoleName,
    { style: string; icon: React.ReactNode }
  > = {
    ADMIN: {
      style: 'bg-[#1D2030] text-[#C2C7E2] border-[#323854]',
      icon: <ShieldStar className="w-3.5 h-3.5 text-[#969ECA]" weight="duotone" />,
    },
    TECHNICIAN: {
      style: 'bg-[#17231F] text-[#A8C7BA] border-[#263B34]',
      icon: <Wrench className="w-3.5 h-3.5 text-[#7FA998]" weight="duotone" />,
    },
    EMPLOYEE: {
      style: 'bg-[#171A21] text-[#9BA3B0] border-[#252B36]',
      icon: <UserCircle className="w-3.5 h-3.5 text-[#838D9B]" weight="duotone" />,
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
