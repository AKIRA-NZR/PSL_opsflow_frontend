import React from 'react';
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

export const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const styles: Record<TicketStatus, string> = {
    OPEN: 'bg-blue-500/12 text-blue-300 border-blue-500/25',
    IN_PROGRESS: 'bg-indigo-500/14 text-indigo-300 border-indigo-500/28',
    WAITING_USER: 'bg-amber-500/12 text-amber-300 border-amber-500/25',
    RESOLVED: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25',
    CLOSED: 'bg-slate-400/12 text-slate-300 border-slate-400/20',
    CANCELLED: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  const dotColors: Record<TicketStatus, string> = {
    OPEN: 'bg-blue-400',
    IN_PROGRESS: 'bg-indigo-400',
    WAITING_USER: 'bg-amber-400',
    RESOLVED: 'bg-emerald-400',
    CLOSED: 'bg-slate-400',
    CANCELLED: 'bg-slate-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColors[status]}`} />
      {STATUS_LABELS[status]}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({
  priority,
}) => {
  const styles: Record<TicketPriority, string> = {
    LOW: 'bg-slate-500/12 text-slate-300 border-slate-500/20',
    MEDIUM: 'bg-sky-500/12 text-sky-300 border-sky-500/25',
    HIGH: 'bg-orange-500/12 text-orange-300 border-orange-500/25',
    CRITICAL: 'bg-rose-500/14 text-rose-300 border-rose-500/28',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles[priority]}`}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
};

export const SlaBadge: React.FC<{ health: SlaHealth; text: string }> = ({
  health,
  text,
}) => {
  const styles: Record<SlaHealth, string> = {
    ON_TIME: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
    AT_RISK: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
    BREACHED: 'bg-rose-500/14 text-rose-300 border-rose-500/28',
    COMPLETED: 'bg-slate-500/12 text-slate-300 border-slate-500/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${styles[health]}`}
    >
      {text}
    </span>
  );
};

export const RolePill: React.FC<{ role: RoleName }> = ({ role }) => {
  const styles: Record<RoleName, string> = {
    ADMIN: 'bg-indigo-500/14 text-indigo-300 border-indigo-500/25',
    TECHNICIAN: 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25',
    EMPLOYEE: 'bg-slate-500/12 text-slate-300 border-slate-500/25',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${styles[role]}`}
    >
      {ROLE_LABELS[role]}
    </span>
  );
};

