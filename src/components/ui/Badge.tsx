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
 * Custom SVG Signal Bars for Priority with subtle ambient glow
 */
export const PrioritySignalIcon: React.FC<{
  priority: TicketPriority;
  className?: string;
}> = ({ priority, className = 'w-3.5 h-3.5' }) => {
  if (priority === 'CRITICAL') {
    return (
      <WarningOctagon
        className={`${className} text-rose-300 drop-shadow-[0_0_6px_rgba(251,113,133,0.45)] shrink-0`}
        weight="fill"
      />
    );
  }

  const activeBars =
    priority === 'HIGH' ? 3 : priority === 'MEDIUM' ? 2 : 1;

  const activeColor =
    priority === 'HIGH'
      ? '#FDBA74' // Soft Warm Amber/Orange
      : priority === 'MEDIUM'
        ? '#93C5FD' // Soft Sky Blue
        : '#94A3B8'; // Soft Slate

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
        rx="1"
        fill={activeBars >= 1 ? activeColor : inactiveColor}
      />
      <rect
        x="6.7"
        y="6.5"
        width="2.6"
        height="7.5"
        rx="1"
        fill={activeBars >= 2 ? activeColor : inactiveColor}
      />
      <rect
        x="11.4"
        y="2.5"
        width="2.6"
        height="11.5"
        rx="1"
        fill={activeBars >= 3 ? activeColor : inactiveColor}
      />
    </svg>
  );
};

/**
 * Dedicated vector icon for each TicketStatus with luminous glass tint
 */
export const StatusIcon: React.FC<{
  status: TicketStatus;
  className?: string;
}> = ({ status, className = 'w-3.5 h-3.5' }) => {
  switch (status) {
    case 'OPEN':
      return (
        <CircleDashed
          className={`${className} text-sky-300 drop-shadow-[0_0_5px_rgba(125,211,252,0.4)] shrink-0`}
          weight="bold"
        />
      );
    case 'IN_PROGRESS':
      return (
        <CircleHalf
          className={`${className} text-indigo-300 drop-shadow-[0_0_6px_rgba(165,180,252,0.45)] shrink-0`}
          weight="fill"
        />
      );
    case 'WAITING_USER':
      return (
        <Clock
          className={`${className} text-amber-300 drop-shadow-[0_0_5px_rgba(252,211,77,0.4)] shrink-0`}
          weight="fill"
        />
      );
    case 'RESOLVED':
      return (
        <CheckCircle
          className={`${className} text-emerald-300 drop-shadow-[0_0_6px_rgba(110,231,183,0.45)] shrink-0`}
          weight="fill"
        />
      );
    case 'CLOSED':
      return (
        <SealCheck
          className={`${className} text-slate-300 shrink-0`}
          weight="fill"
        />
      );
    case 'CANCELLED':
      return (
        <MinusCircle
          className={`${className} text-slate-400 shrink-0`}
          weight="duotone"
        />
      );
  }
};

/**
 * Luminous Glass Pill Status Badge (Glassmorphism + Specular top highlight + glowing status dot)
 */
export const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const styles: Record<TicketStatus, { pill: string; dot: string }> = {
    OPEN: {
      pill: 'bg-sky-400/[0.08] text-sky-100 border-sky-300/20',
      dot: 'bg-sky-300 shadow-[0_0_8px_rgba(125,211,252,0.85)]',
    },
    IN_PROGRESS: {
      pill: 'bg-indigo-400/[0.10] text-indigo-100 border-indigo-300/25',
      dot: 'bg-indigo-300 shadow-[0_0_8px_rgba(165,180,252,0.9)]',
    },
    WAITING_USER: {
      pill: 'bg-amber-400/[0.09] text-amber-100 border-amber-300/22',
      dot: 'bg-amber-300 shadow-[0_0_8px_rgba(252,211,77,0.85)]',
    },
    RESOLVED: {
      pill: 'bg-emerald-400/[0.09] text-emerald-100 border-emerald-300/22',
      dot: 'bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.85)]',
    },
    CLOSED: {
      pill: 'bg-white/[0.05] text-slate-200 border-white/12',
      dot: 'bg-slate-300',
    },
    CANCELLED: {
      pill: 'bg-white/[0.03] text-slate-400 border-white/8 line-through',
      dot: 'bg-slate-500',
    },
  };

  const s = styles[status];

  return (
    <span
      className={`glass-pill inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all ${s.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      <span>{STATUS_LABELS[status]}</span>
    </span>
  );
};

/**
 * Luminous Glass Pill Priority Badge with Signal Bars
 */
export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({
  priority,
}) => {
  const styles: Record<TicketPriority, string> = {
    LOW: 'bg-white/[0.04] text-slate-200 border-white/10',
    MEDIUM: 'bg-sky-400/[0.07] text-sky-100 border-sky-300/18',
    HIGH: 'bg-orange-400/[0.09] text-orange-100 border-orange-300/22',
    CRITICAL: 'bg-rose-400/[0.11] text-rose-100 border-rose-300/25',
  };

  return (
    <span
      className={`glass-pill inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border transition-all ${styles[priority]}`}
    >
      <PrioritySignalIcon priority={priority} />
      <span>{PRIORITY_LABELS[priority]}</span>
    </span>
  );
};

/**
 * Luminous Glass Pill SLA Health Indicator
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
      style: 'bg-emerald-400/[0.08] text-emerald-100 border-emerald-300/20',
      icon: (
        <Timer
          className="w-3.5 h-3.5 text-emerald-300 drop-shadow-[0_0_5px_rgba(110,231,183,0.45)] shrink-0"
          weight="duotone"
        />
      ),
    },
    AT_RISK: {
      style: 'bg-amber-400/[0.10] text-amber-100 border-amber-300/24',
      icon: (
        <Timer
          className="w-3.5 h-3.5 text-amber-300 drop-shadow-[0_0_5px_rgba(252,211,77,0.45)] shrink-0"
          weight="fill"
        />
      ),
    },
    BREACHED: {
      style: 'bg-rose-400/[0.11] text-rose-100 border-rose-300/26',
      icon: (
        <WarningOctagon
          className="w-3.5 h-3.5 text-rose-300 drop-shadow-[0_0_5px_rgba(251,113,133,0.5)] shrink-0"
          weight="fill"
        />
      ),
    },
    COMPLETED: {
      style: 'bg-white/[0.04] text-slate-200 border-white/10',
      icon: (
        <CheckCircle
          className="w-3.5 h-3.5 text-slate-300 shrink-0"
          weight="duotone"
        />
      ),
    },
  };

  const current = config[health];

  return (
    <span
      className={`glass-pill inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${current.style}`}
    >
      {current.icon}
      <span>{text}</span>
    </span>
  );
};

/**
 * Luminous Glass Role Pill
 */
export const RolePill: React.FC<{ role: RoleName }> = ({ role }) => {
  const config: Record<
    RoleName,
    { style: string; icon: React.ReactNode }
  > = {
    ADMIN: {
      style: 'bg-indigo-400/[0.10] text-indigo-100 border-indigo-300/24',
      icon: <ShieldStar className="w-3.5 h-3.5 text-indigo-300" weight="duotone" />,
    },
    TECHNICIAN: {
      style: 'bg-emerald-400/[0.09] text-emerald-100 border-emerald-300/22',
      icon: <Wrench className="w-3.5 h-3.5 text-emerald-300" weight="duotone" />,
    },
    EMPLOYEE: {
      style: 'bg-white/[0.05] text-slate-200 border-white/12',
      icon: <UserCircle className="w-3.5 h-3.5 text-slate-300" weight="duotone" />,
    },
  };

  const current = config[role];

  return (
    <span
      className={`glass-pill inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.style}`}
    >
      {current.icon}
      <span>{ROLE_LABELS[role]}</span>
    </span>
  );
};
