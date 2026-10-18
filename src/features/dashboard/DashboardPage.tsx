import React, { useMemo } from 'react';
import {
  ArrowRight,
  ChartBar,
  ChartDonut,
  CheckCircle,
  Clock,
  Tray,
  UserPlus,
  WarningOctagon,
} from '@phosphor-icons/react';
import {
  PriorityBadge,
  SlaBadge,
} from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatDateTime, formatTicketCode } from '../../core/utils/date.utils';
import { evaluateTicketSla } from '../../core/utils/sla.utils';

interface DashboardPageProps {
  onSelectTicket: (ticketId: string) => void;
  onNavigateQueue: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectTicket,
  onNavigateQueue,
}) => {
  const {
    tenantTickets,
    tenantCategories,
    tenantUsers,
    assumeAndStartTicket,
  } = useWorkspace();

  const metrics = useMemo(() => {
    let openUnassigned = 0;
    let inProgress = 0;
    let waitingUser = 0;
    let resolvedOrClosed = 0;
    let slaOnTimeCount = 0;
    let slaAttentionCount = 0;

    for (const t of tenantTickets) {
      if (t.status === 'OPEN') openUnassigned++;
      if (t.status === 'IN_PROGRESS') inProgress++;
      if (t.status === 'WAITING_USER') waitingUser++;
      if (t.status === 'RESOLVED' || t.status === 'CLOSED') resolvedOrClosed++;

      const sla = evaluateTicketSla(t);
      if (sla.health === 'BREACHED' || sla.health === 'AT_RISK') {
        slaAttentionCount++;
      } else {
        slaOnTimeCount++;
      }
    }

    const total = Math.max(1, tenantTickets.length);
    const pendingTotal = openUnassigned + inProgress + waitingUser;
    const resolutionRate = Math.round((resolvedOrClosed / total) * 100);
    const slaComplianceRate = Math.round((slaOnTimeCount / total) * 100);

    return {
      total: tenantTickets.length,
      openUnassigned,
      inProgress,
      waitingUser,
      pendingTotal,
      resolvedOrClosed,
      slaAttentionCount,
      resolutionRate,
      slaComplianceRate,
    };
  }, [tenantTickets]);

  const weeklySeries = useMemo(
    () => [
      { day: 'SEG', resolved: 6, pending: 2 },
      { day: 'TER', resolved: 8, pending: 3 },
      { day: 'QUA', resolved: 5, pending: 4 },
      { day: 'QUI', resolved: 9, pending: 2 },
      { day: 'SEX', resolved: 7, pending: 3 },
      { day: 'SÁB', resolved: 3, pending: 1 },
      {
        day: 'HOJE',
        resolved: metrics.resolvedOrClosed,
        pending: metrics.pendingTotal,
      },
    ],
    [metrics.resolvedOrClosed, metrics.pendingTotal]
  );

  const maxWeeklyVal = Math.max(
    10,
    ...weeklySeries.map((d) => Math.max(d.resolved, d.pending))
  );

  const categoryStats = useMemo(() => {
    return tenantCategories.map((cat) => {
      const catTickets = tenantTickets.filter((t) => t.categoryId === cat.id);
      const resolved = catTickets.filter(
        (t) => t.status === 'RESOLVED' || t.status === 'CLOSED'
      ).length;
      const pending = catTickets.filter(
        (t) =>
          t.status === 'OPEN' ||
          t.status === 'IN_PROGRESS' ||
          t.status === 'WAITING_USER'
      ).length;
      return {
        id: cat.id,
        name: cat.name,
        total: catTickets.length,
        resolved,
        pending,
      };
    });
  }, [tenantCategories, tenantTickets]);

  const triageQueue = useMemo(
    () =>
      tenantTickets.filter(
        (t) =>
          !t.assigneeId &&
          t.status !== 'CLOSED' &&
          t.status !== 'CANCELLED'
      ),
    [tenantTickets]
  );

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const totalForDonut = Math.max(1, metrics.total);

  // Comfortable semantic colors for status breakdown
  const segments = [
    {
      label: 'Resolvidos',
      count: metrics.resolvedOrClosed,
      color: '#6ee7b7', // Soft Sage Emerald
    },
    {
      label: 'Em Atendimento',
      count: metrics.inProgress,
      color: '#a5b4fc', // Soft Periwinkle
    },
    {
      label: 'Na Triagem',
      count: metrics.openUnassigned,
      color: '#7dd3fc', // Soft Sky
    },
    {
      label: 'Aguardando',
      count: metrics.waitingUser,
      color: '#fcd34d', // Warm Sand Amber
    },
  ];

  let accumulatedPercent = 0;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Row 1: Top Operational KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="glass-panel p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192]">
              PENDENTES
            </p>
            <p className="text-2xl font-semibold text-white mt-1">
              {metrics.pendingTotal}
            </p>
          </div>
          <div className="p-2.5 bg-[#292112] border border-[#42351b] text-[#fcd34d]">
            <Clock className="w-4 h-4" weight="fill" />
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192]">
              RESOLVIDOS
            </p>
            <p className="text-2xl font-semibold text-white mt-1">
              {metrics.resolvedOrClosed}
            </p>
          </div>
          <div className="p-2.5 bg-[#12261e] border border-[#1d3d31] text-[#6ee7b7]">
            <CheckCircle className="w-4 h-4" weight="fill" />
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192]">
              FILA DE TRIAGEM
            </p>
            <p className="text-2xl font-semibold text-white mt-1">
              {triageQueue.length}
            </p>
          </div>
          <div className="p-2.5 bg-[#14222e] border border-[#223a4e] text-[#7dd3fc]">
            <Tray className="w-4 h-4" weight="fill" />
          </div>
        </div>

        <div className="glass-panel p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192]">
              SLA NO PRAZO
            </p>
            <p className="text-2xl font-semibold text-white mt-1">
              {metrics.slaComplianceRate}%
            </p>
          </div>
          <div className="p-2.5 bg-[#291518] border border-[#452126] text-[#fda4af]">
            <WarningOctagon className="w-4 h-4" weight="fill" />
          </div>
        </div>
      </div>

      {/* Row 2: Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Chart: Weekly Volume (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-5 flex flex-col justify-between space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-white flex items-center gap-2">
              <ChartBar className="w-4 h-4 text-[#7dd3fc]" />
              VOLUME SEMANAL
            </h3>

            <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-wider text-[#8e9192]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#6ee7b7]" />
                RESOLVIDOS
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-[#7dd3fc]" />
                PENDENTES
              </span>
            </div>
          </div>

          <div className="h-44 pt-4 flex items-end justify-between gap-3 sm:gap-5 px-4 neumorphic-inset">
            {weeklySeries.map((item) => {
              const resolvedHeight = Math.round(
                (item.resolved / maxWeeklyVal) * 120
              );
              const pendingHeight = Math.round(
                (item.pending / maxWeeklyVal) * 120
              );

              return (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  <div className="w-full flex items-end justify-center gap-1.5 h-32">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono text-[#6ee7b7] opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.resolved}
                      </span>
                      <div
                        style={{ height: `${Math.max(8, resolvedHeight)}px` }}
                        className="w-3 sm:w-4 bg-[#6ee7b7]/80 hover:bg-[#6ee7b7] transition-all"
                        title={`Resolvidos (${item.day}): ${item.resolved}`}
                      />
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono text-[#7dd3fc] opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.pending}
                      </span>
                      <div
                        style={{ height: `${Math.max(8, pendingHeight)}px` }}
                        className="w-3 sm:w-4 bg-[#7dd3fc]/70 hover:bg-[#7dd3fc] transition-all"
                        title={`Pendentes (${item.day}): ${item.pending}`}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-[#8e9192] pb-2">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {categoryStats.map((c) => {
              const pct =
                c.total > 0 ? Math.round((c.resolved / c.total) * 100) : 0;
              return (
                <div
                  key={c.id}
                  className="neumorphic-inset p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#e2e2e2] truncate">
                      {c.name}
                    </span>
                    <span className="text-[#8e9192] font-mono text-[11px]">
                      {c.resolved}/{c.total}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#262626] overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-[#6ee7b7] transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Chart: Status Distribution Donut Chart (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-5 flex flex-col justify-between space-y-5">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-white flex items-center gap-2">
            <ChartDonut className="w-4 h-4 text-[#a5b4fc]" />
            POR STATUS
          </h3>

          <div className="flex flex-col items-center justify-center py-1">
            <div className="relative w-40 h-40 neumorphic-inset flex items-center justify-center p-2">
              <svg
                viewBox="0 0 140 140"
                className="w-full h-full -rotate-90 transform"
              >
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#262626"
                  strokeWidth="14"
                />
                {segments.map((seg) => {
                  const pct = seg.count / totalForDonut;
                  const strokeDasharray = `${pct * circumference} ${circumference}`;
                  const strokeDashoffset = -accumulatedPercent * circumference;
                  accumulatedPercent += pct;

                  if (seg.count === 0) return null;

                  return (
                    <circle
                      key={seg.label}
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="14"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="butt"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-semibold text-white">
                  {metrics.total}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-[#8e9192]">
                  TOTAL
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-[#444748]/35">
            {segments.map((seg) => {
              const pct = Math.round((seg.count / totalForDonut) * 100);
              return (
                <div
                  key={seg.label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2 text-[#c4c7c8]">
                    <span
                      className="w-2 h-2 shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    {seg.label}
                  </span>
                  <span className="font-mono text-[#8e9192]">
                    {seg.count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Compact Triage Queue */}
      <div className="glass-panel overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#444748]/40 bg-[#0e0e0e] flex items-center justify-between gap-3">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.14em] text-white">
            TRIAGEM PENDENTE ({triageQueue.length})
          </h3>

          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={onNavigateQueue}
          >
            Ver Todos
          </Button>
        </div>

        {triageQueue.length === 0 ? (
          <div className="py-10 px-6 text-center text-xs text-[#8e9192]">
            Nenhum chamado aguardando triagem.
          </div>
        ) : (
          <div className="divide-y divide-[#444748]/30">
            {triageQueue.map((t) => {
              const requester = tenantUsers.find(
                (u) => u.id === t.requesterId
              );
              const category = tenantCategories.find(
                (c) => c.id === t.categoryId
              );
              const sla = evaluateTicketSla(t);

              return (
                <div
                  key={t.id}
                  className="px-5 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-[#1c1c1c] transition-colors"
                >
                  <div
                    onClick={() => onSelectTicket(t.id)}
                    className="space-y-1 cursor-pointer min-w-0 flex-1"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-[#8e9192]">
                        {formatTicketCode(t.number)}
                      </span>
                      <span className="text-sm font-medium text-white">
                        {t.title}
                      </span>
                      <PriorityBadge priority={t.priority} />
                      <SlaBadge health={sla.health} text={sla.badgeText} />
                    </div>
                    <div className="text-xs text-[#8e9192]">
                      {category?.name || 'Geral'} · {requester?.name || 'Colaborador'} ·{' '}
                      {formatDateTime(t.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<UserPlus className="w-3.5 h-3.5" weight="bold" />}
                      onClick={() => {
                        assumeAndStartTicket(t.id);
                        onSelectTicket(t.id);
                      }}
                    >
                      Assumir
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
