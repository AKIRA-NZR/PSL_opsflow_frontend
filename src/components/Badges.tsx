import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Flame,
  HelpCircle,
  Loader2,
  ShieldAlert,
  XCircle,
} from 'lucide-react';
import type { RoleName, SlaState, TicketPriority, TicketStatus } from '../types/opsflow';

export const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => {
  const styles: Record<
    TicketStatus,
    { bg: string; text: string; border: string; label: string; icon: React.ReactNode }
  > = {
    OPEN: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-400',
      border: 'border-sky-500/25',
      label: 'OPEN',
      icon: <Clock className="w-3 h-3" />,
    },
    IN_PROGRESS: {
      bg: 'bg-indigo-500/15',
      text: 'text-indigo-400',
      border: 'border-indigo-500/30',
      label: 'IN_PROGRESS',
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
    },
    WAITING_USER: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/25',
      label: 'WAITING_USER',
      icon: <HelpCircle className="w-3 h-3" />,
    },
    RESOLVED: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/25',
      label: 'RESOLVED',
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    CLOSED: {
      bg: 'bg-zinc-800/80',
      text: 'text-zinc-400',
      border: 'border-zinc-700',
      label: 'CLOSED',
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    CANCELLED: {
      bg: 'bg-zinc-900',
      text: 'text-zinc-500 line-through',
      border: 'border-zinc-800',
      label: 'CANCELLED',
      icon: <XCircle className="w-3 h-3" />,
    },
  };

  const s = styles[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border ${s.bg} ${s.text} ${s.border}`}
    >
      {s.icon}
      {s.label}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: TicketPriority }> = ({ priority }) => {
  const styles: Record<
    TicketPriority,
    { bg: string; text: string; border: string; label: string }
  > = {
    LOW: {
      bg: 'bg-zinc-800/60',
      text: 'text-zinc-400',
      border: 'border-zinc-700/80',
      label: 'LOW · 72h',
    },
    MEDIUM: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      border: 'border-blue-500/25',
      label: 'MEDIUM · 24h',
    },
    HIGH: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-400',
      border: 'border-orange-500/25',
      label: 'HIGH · 8h',
    },
    CRITICAL: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/35',
      label: 'CRITICAL · 4h',
    },
  };

  const s = styles[priority];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium border ${s.bg} ${s.text} ${s.border}`}
    >
      {priority === 'CRITICAL' && <Flame className="w-3 h-3 text-rose-400" />}
      {s.label}
    </span>
  );
};

export const SlaPill: React.FC<{
  state: SlaState;
  remainingText: string;
  breachedByRecalculation?: boolean;
}> = ({ state, remainingText, breachedByRecalculation }) => {
  if (state === 'BREACHED') {
    return (
      <span
        title={
          breachedByRecalculation
            ? 'Estourado após recálculo de prioridade (DEC-06: original_due_at preservado)'
            : 'Prazo de SLA excedido'
        }
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30"
      >
        <ShieldAlert className="w-3 h-3" />
        {remainingText}
      </span>
    );
  }

  if (state === 'AT_RISK') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <AlertTriangle className="w-3 h-3" />
        {remainingText}
      </span>
    );
  }

  if (state === 'COMPLETED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="w-3 h-3" />
        {remainingText}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800">
      <Clock className="w-3 h-3 text-emerald-400" />
      {remainingText}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: RoleName }> = ({ role }) => {
  const map: Record<RoleName, string> = {
    ADMIN: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    TECHNICIAN: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    EMPLOYEE: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold border ${map[role]}`}
    >
      {role}
    </span>
  );
};
