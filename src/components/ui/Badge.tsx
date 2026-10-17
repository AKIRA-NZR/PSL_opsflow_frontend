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
 * Monochrome Titanium Signal Bars for Priority (only CRITICAL uses a subtle rose accent)
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
      ? '#F4F4F5' // Crisp Titanium White
      : priority === 'MEDIUM'
        ? '#D4D4D8' // Silver
        : '#A1A1AA'; // Muted Zinc

  const inactiveColor = 'rgba(255, 255, 255, 0.14)';

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
 * Clean vector icon for each TicketStatus
 */
export const StatusIcon: React.FC<{
  status: TicketStatus;
  className?: string;
}> = ({ status, className = 'w-3.5 h-3.5' }) => {
  switch (status) {
    case 'OPEN':
      return (
        <CircleDashed
          className={`${className} text-zinc-300 shrink-0`}
          weight="bold"
        />
      );
    case 'IN_PROGRESS':
      return (
        <CircleHalf
          className={`${className} text-white shrink-0`}
          weight="fill"
        />
      );
    case 'WAITING_USER':
      return (
        <Clock
          className={`${className} text-amber-300/90 shrink-0`}
          weight="fill"
        />
      );
    case 'RESOLVED':
      return (
        <CheckCircle
          className={`${className} text-emerald-300/90 shrink-0`}
          weight="fill"
        />
      );
    case 'CLOSED':
      return (
        <SealCheck
          className={`${className} text-zinc-400 shrink-0`}
          weight="fill"
        />
      );
    case 'CANCELLED':
      return (
        <MinusCircle
          className={`${className} text-zinc-500 shrink-0`}
          weight="duotone"
        />
      );
  }
};

/**
 * Monochrome Smoked Glass Pill with 6px Micro-Indicator Dot
 */
export const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const dots: Record<TicketStatus, string> = {
    OPEN: 'bg-zinc-300',
    IN_PROGRESS: 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]',
    WAITING_USER: 'bg-amber-400/90',
    RESOLVED: 'bg-emerald-400/90',
    CLOSED: 'bg-zinc-500',
    CANCELLED: 'bg-zinc-600',
  };

  return (
    <span
      className={`glass-pill inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.09] ${
        status === 'CANCELLED' ? 'text-zinc-500 line-through' : 'text-zinc-200'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dots[status]}`} />
      <span>{STATUS_LABELS[status]}</span>
    </span>
  );
};

/**
 * Monochrome Smoked Glass Priority Badge with Signal Bars
 */
export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({
  priority,
}) => {
  return (
    <span className="glass-pill inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.09] text-zinc-200">
      <PrioritySignalIcon priority={priority} />
      <span>{PRIORITY_LABELS[priority]}</span>
    </span>
  );
};

/**
 * Monochrome Smoked Glass SLA Pill with 6px Micro-Dot
 */
export const SlaBadge: React.FC<{ health: SlaHealth; text: string }> = ({
  health,
  text,
}) => {
  const dotColor: Record<SlaHealth, string> = {
    ON_TIME: 'bg-emerald-400/85',
    AT_RISK: 'bg-amber-400',
    BREACHED: 'bg-rose-400',
    COMPLETED: 'bg-zinc-400',
  };

  return (
    <span className="glass-pill inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.09] text-zinc-300 font-mono">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor[health]}`} />
      <span>{text}</span>
    </span>
  );
};

/**
 * Monochrome Smoked Glass Role Pill
 */
export const RolePill: React.FC<{ role: RoleName }> = ({ role }) => {
  return (
    <span className="glass-pill inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/[0.05] border border-white/[0.10] text-zinc-300">
      {ROLE_LABELS[role]}
    </span>
  );
};

