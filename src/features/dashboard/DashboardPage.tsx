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

  // Weekly Volume Data (Resolved vs Pending over the last 7 days)
  const weeklySeries = useMemo(
    () => [
      { day: 'Seg', resolved: 6, pending: 2 },
      { day: 'Ter', resolved: 8, pending: 3 },
      { day: 'Qua', resolved: 5, pending: 4 },
      { day: 'Qui', resolved: 9, pending: 2 },
      { day: 'Sex', resolved: 7, pending: 3 },
      { day: 'Sáb', resolved: 3, pending: 1 },
      {
        day: 'Hoje',
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

  // Category Breakdown
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

  // Unassigned / Triage Tickets waiting for a Technician
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

  // Donut Chart geometry (r = 54, circumference = 339.29)
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const totalForDonut = Math.max(1, metrics.total);

  const segments = [
    {
      label: 'Resolvidos',
      count: metrics.resolvedOrClosed,
      color: '#F4F4F5', // Titanium White
    },
    {
      label: 'Em Atendimento',
      count: metrics.inProgress,
      color: '#A1A1AA', // Frosted Silver
    },
    {
      label: 'Na Triagem',
      count: metrics.openUnassigned,
      color: '#71717A', // Zinc
    },
    {
      label: 'Aguardando',
      count: metrics.waitingUser,
      color: '#3F3F46', // Graphite
    },
  ];

  let accumulatedPercent = 0;

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Row 1: Top Operational KPIs (Monochrome Titanium) */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl glass-panel p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-400">Pendentes</p>
            <p className="text-2xl font-semibold text-white mt-1">
              {metrics.pendingTotal}
            </p>
          </div>
          <div className="p-2.5 rounded-xl neumorphic-inset text-zinc-300">
            <Clock className="w-4 h-4" weight="duotone" />
          </div>
        </div>

        <div className="rounded-2xl glass-panel p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-400">Resolvidos</p>
            <p className="text-2xl font-semibold text-white mt-1">
              {metrics.resolvedOrClosed}
            </p>
          </div>
          <div className="p-2.5 rounded-xl neumorphic-inset text-zinc-300">
            <CheckCircle className="w-4 h-4" weight="duotone" />
          </div>
        </div>

        <div className="rounded-2xl glass-panel p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-400">Fila de Triagem</p>
            <p className="text-2xl font-semibold text-white mt-1">
              {triageQueue.length}
            </p>
          </div>
          <div className="p-2.5 rounded-xl neumorphic-inset text-zinc-300">
            <Tray className="w-4 h-4" weight="duotone" />
          </div>
        </div>

        <div className="rounded-2xl glass-panel p-4 sm:p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-400">SLA no Prazo</p>
            <p className="text-2xl font-semibold text-white mt-1">
              {metrics.slaComplianceRate}%
            </p>
          </div>
          <div className="p-2.5 rounded-xl neumorphic-inset text-zinc-300">
            <WarningOctagon className="w-4 h-4" weight="duotone" />
          </div>
        </div>
      </div>

      {/* Row 2: Visual Charts (Monochrome Titanium Scale) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Chart: Weekly Volume (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-5 flex flex-col justify-between space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <ChartBar className="w-4 h-4 text-zinc-400" weight="duotone" />
              Volume Semanal
            </h3>

            <div className="flex items-center gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-zinc-100" />
                Resolvidos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-xs bg-zinc-600" />
                Pendentes
              </span>
            </div>
          </div>

          {/* Monochrome Bar Chart */}
          <div className="h-44 pt-4 flex items-end justify-between gap-3 sm:gap-5 px-4 rounded-2xl neumorphic-inset">
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
                    {/* Resolved Bar (Titanium White/Silver) */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono text-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.resolved}
                      </span>
                      <div
                        style={{ height: `${Math.max(8, resolvedHeight)}px` }}
                        className="w-3 sm:w-4 rounded-t-sm bg-gradient-to-t from-zinc-400/70 to-zinc-100 group-hover:to-white transition-all"
                        title={`Resolvidos (${item.day}): ${item.resolved}`}
                      />
                    </div>

                    {/* Pending Bar (Smoked Graphite) */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.pending}
                      </span>
                      <div
                        style={{ height: `${Math.max(8, pendingHeight)}px` }}
                        className="w-3 sm:w-4 rounded-t-sm bg-white/[0.14] border-t border-white/25 group-hover:bg-white/[0.22] transition-all"
                        title={`Pendentes (${item.day}): ${item.pending}`}
                      />
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-zinc-400 pb-2">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Category Progress Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {categoryStats.map((c) => {
              const pct =
                c.total > 0 ? Math.round((c.resolved / c.total) * 100) : 0;
              return (
                <div
                  key={c.id}
                  className="rounded-xl neumorphic-inset p-3 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-200 truncate">
                      {c.name}
                    </span>
                    <span className="text-zinc-400 font-mono text-[11px]">
                      {c.resolved}/{c.total}
                    </span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full rounded-full bg-zinc-200 transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Chart: Status Distribution Donut Chart (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-5 flex flex-col justify-between space-y-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <ChartDonut className="w-4 h-4 text-zinc-400" weight="duotone" />
            Por Status
          </h3>

          <div className="flex flex-col items-center justify-center py-1">
            <div className="relative w-40 h-40 rounded-full neumorphic-inset flex items-center justify-center p-2">
              <svg
                viewBox="0 0 140 140"
                className="w-full h-full -rotate-90 transform"
              >
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="rgba(255,255,255,0.05)"
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
                <span className="text-[11px] text-zinc-400">Total</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-white/[0.06]">
            {segments.map((seg) => {
              const pct = Math.round((seg.count / totalForDonut) * 100);
              return (
                <div
                  key={seg.label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2 text-zinc-300">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    {seg.label}
                  </span>
                  <span className="font-mono text-zinc-400">
                    {seg.count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Compact Triage Queue */}
      <div className="rounded-2xl glass-panel overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.08] flex items-center justify-between gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Triagem Pendente ({triageQueue.length})
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
          <div className="py-10 px-6 text-center text-xs text-zinc-500">
            Nenhum chamado aguardando triagem.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
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
                  className="px-5 py-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 hover:bg-white/[0.03] transition-colors"
                >
                  <div
                    onClick={() => onSelectTicket(t.id)}
                    className="space-y-1 cursor-pointer min-w-0 flex-1"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-zinc-400">
                        {formatTicketCode(t.number)}
                      </span>
                      <span className="text-sm font-medium text-zinc-100 hover:text-white">
                        {t.title}
                      </span>
                      <PriorityBadge priority={t.priority} />
                      <SlaBadge health={sla.health} text={sla.badgeText} />
                    </div>
                    <div className="text-xs text-zinc-500">
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



