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
  StatusBadge,
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
      label: 'Resolvidos / Concluídos',
      count: metrics.resolvedOrClosed,
      color: '#34D399', // Luminous Emerald
    },
    {
      label: 'Em Atendimento',
      count: metrics.inProgress,
      color: '#818CF8', // Luminous Indigo
    },
    {
      label: 'Aguardando Triagem',
      count: metrics.openUnassigned,
      color: '#60A5FA', // Luminous Sky Blue
    },
    {
      label: 'Aguardando Solicitante',
      count: metrics.waitingUser,
      color: '#FBBF24', // Luminous Warm Amber
    },
  ];

  let accumulatedPercent = 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Row 1: Top Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl glass-panel p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#94A3B8]">
              Chamados Pendentes
            </p>
            <p className="text-2xl font-semibold text-[#F4F7FB] mt-1">
              {metrics.pendingTotal}
            </p>
            <p className="text-xs text-[#64748B] mt-1">
              {metrics.inProgress} em atendimento ativo
            </p>
          </div>
          <div className="p-3 rounded-xl neumorphic-inset text-[#A5B4FC]">
            <Clock className="w-5 h-5" weight="duotone" />
          </div>
        </div>

        <div className="rounded-2xl glass-panel p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#94A3B8]">
              Chamados Resolvidos
            </p>
            <p className="text-2xl font-semibold text-[#F4F7FB] mt-1">
              {metrics.resolvedOrClosed}
            </p>
            <p className="text-xs text-[#6EE7B7] mt-1">
              {metrics.resolutionRate}% do volume atual
            </p>
          </div>
          <div className="p-3 rounded-xl neumorphic-inset text-[#6EE7B7]">
            <CheckCircle className="w-5 h-5" weight="duotone" />
          </div>
        </div>

        <div className="rounded-2xl glass-panel p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#94A3B8]">
              Fila de Triagem (Sem Técnico)
            </p>
            <p className="text-2xl font-semibold text-[#F4F7FB] mt-1">
              {triageQueue.length}
            </p>
            <p className="text-xs text-[#93C5FD] mt-1">
              Aguardando atribuição da equipe
            </p>
          </div>
          <div className="p-3 rounded-xl neumorphic-inset text-[#93C5FD]">
            <Tray className="w-5 h-5" weight="duotone" />
          </div>
        </div>

        <div className="rounded-2xl glass-panel p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#94A3B8]">
              Conformidade de Prazo (SLA)
            </p>
            <p className="text-2xl font-semibold text-[#F4F7FB] mt-1">
              {metrics.slaComplianceRate}%
            </p>
            <p className="text-xs text-[#FCD34D] mt-1">
              {metrics.slaAttentionCount} chamado(s) exigem atenção
            </p>
          </div>
          <div className="p-3 rounded-xl neumorphic-inset text-[#FCD34D]">
            <WarningOctagon className="w-5 h-5" weight="duotone" />
          </div>
        </div>
      </div>

      {/* Row 2: Visual Charts (Weekly Resolved vs Pending Bar Chart + Status Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Weekly Resolved vs Pending (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl glass-panel p-6 flex flex-col justify-between space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#F4F7FB] flex items-center gap-2">
                <ChartBar className="w-4 h-4 text-[#93C5FD]" weight="duotone" />
                Evolução de Chamados: Resolvidos vs. Pendentes
              </h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Comparativo diário de vazão de atendimento da equipe técnica
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#34D399]" />
                Resolvidos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#818CF8]" />
                Pendentes
              </span>
            </div>
          </div>

          {/* Custom Spatial Bar Chart */}
          <div className="h-52 pt-4 flex items-end justify-between gap-3 sm:gap-5 px-4 rounded-2xl neumorphic-inset">
            {weeklySeries.map((item) => {
              const resolvedHeight = Math.round(
                (item.resolved / maxWeeklyVal) * 140
              );
              const pendingHeight = Math.round(
                (item.pending / maxWeeklyVal) * 140
              );

              return (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  <div className="w-full flex items-end justify-center gap-1.5 h-36">
                    {/* Resolved Bar */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono text-[#6EE7B7] opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.resolved}
                      </span>
                      <div
                        style={{ height: `${Math.max(8, resolvedHeight)}px` }}
                        className="w-3.5 sm:w-5 rounded-t-md bg-gradient-to-t from-emerald-500/40 to-emerald-400/85 border-t border-emerald-300/50 group-hover:to-emerald-300 transition-all"
                        title={`Resolvidos (${item.day}): ${item.resolved}`}
                      />
                    </div>

                    {/* Pending Bar */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono text-[#A5B4FC] opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.pending}
                      </span>
                      <div
                        style={{ height: `${Math.max(8, pendingHeight)}px` }}
                        className="w-3.5 sm:w-5 rounded-t-md bg-gradient-to-t from-indigo-500/35 to-indigo-400/80 border-t border-indigo-300/45 group-hover:to-indigo-300 transition-all"
                        title={`Pendentes (${item.day}): ${item.pending}`}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[#94A3B8] pb-2.5">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Category Progress Breakdown */}
          <div className="space-y-3">
            <div className="text-xs font-medium text-[#94A3B8]">
              Volume por Categoria de Atendimento
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categoryStats.map((c) => {
                const pct =
                  c.total > 0 ? Math.round((c.resolved / c.total) * 100) : 0;
                return (
                  <div
                    key={c.id}
                    className="rounded-xl neumorphic-inset p-3.5 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#E2E8F0] truncate">
                        {c.name}
                      </span>
                      <span className="text-[#94A3B8] font-mono">
                        {c.resolved}/{c.total} resolvidos
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400 transition-all"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Chart: Status Distribution Donut Chart (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-6 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F7FB] flex items-center gap-2">
              <ChartDonut className="w-4 h-4 text-[#A5B4FC]" weight="duotone" />
              Distribuição da Fila por Status
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Visão proporcional de todos os chamados registrados
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-44 h-44 rounded-full neumorphic-inset flex items-center justify-center p-2">
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
                  strokeWidth="15"
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
                      strokeWidth="15"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="butt"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-semibold text-[#F4F7FB]">
                  {metrics.total}
                </span>
                <span className="text-[11px] text-[#94A3B8]">Chamados</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-white/[0.07]">
            {segments.map((seg) => {
              const pct = Math.round((seg.count / totalForDonut) * 100);
              return (
                <div
                  key={seg.label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2.5 text-[#CBD5E1]">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor]"
                      style={{ backgroundColor: seg.color, color: seg.color }}
                    />
                    {seg.label}
                  </span>
                  <span className="font-mono text-[#94A3B8]">
                    {seg.count} ({pct}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Immediate Triage Queue (Unassigned Tickets from Employees) */}
      <div className="rounded-2xl glass-panel overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#F4F7FB]">
              Chamados Aguardando Triagem e Atribuição ({triageQueue.length})
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Solicitações abertas pelos colaboradores que ainda não possuem um técnico responsável
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={onNavigateQueue}
          >
            Ver Fila Completa
          </Button>
        </div>

        {triageQueue.length === 0 ? (
          <div className="py-12 px-6 text-center text-sm text-[#94A3B8]">
            Excelente! Todos os chamados da fila já possuem um técnico responsável atribuído.
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
                  className="px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-white/[0.03] transition-colors"
                >
                  <div
                    onClick={() => onSelectTicket(t.id)}
                    className="space-y-1.5 cursor-pointer min-w-0 flex-1"
                  >
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-medium text-[#93C5FD]">
                        {formatTicketCode(t.number)}
                      </span>
                      <span className="text-sm font-medium text-[#F4F7FB] hover:underline">
                        {t.title}
                      </span>
                      <StatusBadge status={t.status} />
                      <PriorityBadge priority={t.priority} />
                      <SlaBadge health={sla.health} text={sla.badgeText} />
                    </div>
                    <div className="text-xs text-[#94A3B8]">
                      Solicitado por{' '}
                      <strong className="text-[#CBD5E1] font-medium">
                        {requester?.name || 'Colaborador'}
                      </strong>{' '}
                      ({requester?.department || 'Setor'}) · Categoria:{' '}
                      {category?.name || 'Geral'} · {formatDateTime(t.createdAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onSelectTicket(t.id)}
                    >
                      Inspecionar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={<UserPlus className="w-3.5 h-3.5" weight="duotone" />}
                      onClick={() => {
                        assumeAndStartTicket(t.id);
                        onSelectTicket(t.id);
                      }}
                    >
                      Assumir Atendimento
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


