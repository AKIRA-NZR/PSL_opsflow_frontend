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
      color: '#7FA998', // Matte Sage Green
    },
    {
      label: 'Em Atendimento',
      count: metrics.inProgress,
      color: '#828BB8', // Matte Slate Indigo
    },
    {
      label: 'Aguardando Triagem',
      count: metrics.openUnassigned,
      color: '#8BA3BE', // Matte Steel Blue
    },
    {
      label: 'Aguardando Solicitante',
      count: metrics.waitingUser,
      color: '#C4A676', // Matte Warm Sand
    },
  ];

  let accumulatedPercent = 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Row 1: Top Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-[#1B202B] border border-[#2A3140] p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#94A3B8]">
              Chamados Pendentes
            </p>
            <p className="text-2xl font-semibold text-[#F1F5F9] mt-1">
              {metrics.pendingTotal}
            </p>
            <p className="text-xs text-[#64748B] mt-1">
              {metrics.inProgress} em atendimento ativo
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#1D2030] border border-[#323854] text-[#969ECA]">
            <Clock className="w-5 h-5" weight="duotone" />
          </div>
        </div>

        <div className="rounded-2xl bg-[#1B202B] border border-[#2A3140] p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#94A3B8]">
              Chamados Resolvidos
            </p>
            <p className="text-2xl font-semibold text-[#F1F5F9] mt-1">
              {metrics.resolvedOrClosed}
            </p>
            <p className="text-xs text-[#7FA998] mt-1">
              {metrics.resolutionRate}% do volume atual
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#17231F] border border-[#263B34] text-[#7FA998]">
            <CheckCircle className="w-5 h-5" weight="duotone" />
          </div>
        </div>

        <div className="rounded-2xl bg-[#1B202B] border border-[#2A3140] p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#94A3B8]">
              Fila de Triagem (Sem Técnico)
            </p>
            <p className="text-2xl font-semibold text-[#F1F5F9] mt-1">
              {triageQueue.length}
            </p>
            <p className="text-xs text-[#8BA3BE] mt-1">
              Aguardando atribuição da equipe
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#19202B] border border-[#2B3646] text-[#8BA3BE]">
            <Tray className="w-5 h-5" weight="duotone" />
          </div>
        </div>

        <div className="rounded-2xl bg-[#1B202B] border border-[#2A3140] p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-[#94A3B8]">
              Conformidade de Prazo (SLA)
            </p>
            <p className="text-2xl font-semibold text-[#F1F5F9] mt-1">
              {metrics.slaComplianceRate}%
            </p>
            <p className="text-xs text-[#C4A676] mt-1">
              {metrics.slaAttentionCount} chamado(s) exigem atenção
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#231F19] border border-[#3A3226] text-[#C4A676]">
            <WarningOctagon className="w-5 h-5" weight="duotone" />
          </div>
        </div>
      </div>

      {/* Row 2: Visual Charts (Weekly Resolved vs Pending Bar Chart + Status Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart: Weekly Resolved vs Pending (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-[#1B202B] border border-[#2A3140] p-6 flex flex-col justify-between space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
                <ChartBar className="w-4 h-4 text-[#8BA3BE]" weight="duotone" />
                Evolução de Chamados: Resolvidos vs. Pendentes
              </h3>
              <p className="text-xs text-[#94A3B8] mt-0.5">
                Comparativo diário de vazão de atendimento da equipe técnica
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#7FA998]" />
                Resolvidos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#5C6B8A]" />
                Pendentes
              </span>
            </div>
          </div>

          {/* Custom Matte Bar Chart */}
          <div className="h-52 pt-4 flex items-end justify-between gap-3 sm:gap-5 px-2 border-b border-[#2A3140]">
            {weeklySeries.map((item) => {
              const resolvedHeight = Math.round(
                (item.resolved / maxWeeklyVal) * 150
              );
              const pendingHeight = Math.round(
                (item.pending / maxWeeklyVal) * 150
              );

              return (
                <div
                  key={item.day}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  <div className="w-full flex items-end justify-center gap-1.5 h-40">
                    {/* Resolved Bar */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono text-[#7FA998] opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.resolved}
                      </span>
                      <div
                        style={{ height: `${Math.max(8, resolvedHeight)}px` }}
                        className="w-3.5 sm:w-5 rounded-t-md bg-[#7FA998]/85 group-hover:bg-[#7FA998] transition-all"
                        title={`Resolvidos (${item.day}): ${item.resolved}`}
                      />
                    </div>

                    {/* Pending Bar */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] font-mono text-[#94A3B8] opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.pending}
                      </span>
                      <div
                        style={{ height: `${Math.max(8, pendingHeight)}px` }}
                        className="w-3.5 sm:w-5 rounded-t-md bg-[#5C6B8A]/85 group-hover:bg-[#7384A8] transition-all"
                        title={`Pendentes (${item.day}): ${item.pending}`}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-medium text-[#94A3B8] pb-2">
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
                    className="rounded-xl bg-[#13161C] border border-[#2A3140] p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[#E2E8F0] truncate">
                        {c.name}
                      </span>
                      <span className="text-[#94A3B8] font-mono">
                        {c.resolved}/{c.total} resolvidos
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#1F2532] overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className="h-full rounded-full bg-[#7FA998] transition-all"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Chart: Status Distribution Donut Chart (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-[#1B202B] border border-[#2A3140] p-6 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-[#F1F5F9] flex items-center gap-2">
              <ChartDonut className="w-4 h-4 text-[#969ECA]" weight="duotone" />
              Distribuição da Fila por Status
            </h3>
            <p className="text-xs text-[#94A3B8] mt-0.5">
              Visão proporcional de todos os chamados registrados
            </p>
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg
                viewBox="0 0 140 140"
                className="w-full h-full -rotate-90 transform"
              >
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="#13161C"
                  strokeWidth="16"
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
                      strokeWidth="16"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="butt"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-semibold text-[#F1F5F9]">
                  {metrics.total}
                </span>
                <span className="text-[11px] text-[#94A3B8]">Chamados</span>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-[#2A3140]">
            {segments.map((seg) => {
              const pct = Math.round((seg.count / totalForDonut) * 100);
              return (
                <div
                  key={seg.label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="flex items-center gap-2.5 text-[#CBD5E1]">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color }}
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
      <div className="rounded-2xl bg-[#1B202B] border border-[#2A3140] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2A3140] flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-[#F1F5F9]">
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
          <div className="divide-y divide-[#2A3140]/70">
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
                  className="px-6 py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-[#212734]/60 transition-colors"
                >
                  <div
                    onClick={() => onSelectTicket(t.id)}
                    className="space-y-1 cursor-pointer min-w-0 flex-1"
                  >
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-xs font-medium text-[#93A8C1]">
                        {formatTicketCode(t.number)}
                      </span>
                      <span className="text-sm font-medium text-[#F1F5F9] hover:underline">
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

