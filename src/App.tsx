import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Command,
  Database,
  Filter,
  Flame,
  Inbox,
  Layers,
  Plus,
  Search,
  Shield,
  Sparkles,
  Ticket as TicketIcon,
  UserCheck,
  X,
} from 'lucide-react';
import {
  OpsFlowProvider,
  computeSlaState,
  useOpsFlow,
} from './store/opsflow-engine';
import type { TicketPriority, TicketStatus } from './types/opsflow';
import { PriorityBadge, RoleBadge, SlaPill, StatusBadge } from './components/Badges';
import { ProblemDetailToastStack } from './components/ProblemDetailToast';
import { DemoToolbar } from './components/DemoToolbar';
import { CommandPalette } from './components/CommandPalette';
import { TicketDetailView } from './components/TicketDetailView';
import {
  CategoriesManagementView,
  UsersAndAuditView,
} from './components/AdminAndAuditViews';
import { SchemaExplorerView } from './components/SchemaExplorerView';

type ActiveTab = 'tickets' | 'categories' | 'users_audit' | 'schema_lab';
type TicketScopeFilter = 'ALL' | 'ASSIGNED_TO_ME' | 'CREATED_BY_ME' | 'SLA_RISK';

const OpsFlowWorkspace: React.FC = () => {
  const {
    activeCompany,
    currentUser,
    activeRole,
    tenantUsers,
    tenantCategories,
    tenantTickets,
    tenantCounters,
    createTicket,
    onboardNewTenant,
  } = useOpsFlow();

  const [activeTab, setActiveTab] = useState<ActiveTab>('tickets');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Filters for Ticket Queue
  const [scopeFilter, setScopeFilter] = useState<TicketScopeFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // New Ticket Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<TicketPriority>('MEDIUM');
  const [newCategoryId, setNewCategoryId] = useState<string>('');

  // Onboarding Form state
  const [onbCompanyName, setOnbCompanyName] = useState('');
  const [onbCompanySlug, setOnbCompanySlug] = useState('');
  const [onbAdminName, setOnbAdminName] = useState('');
  const [onbAdminEmail, setOnbAdminEmail] = useState('');

  // Keep default category synced with active tenant
  useEffect(() => {
    const firstActiveCat = tenantCategories.find((c) => c.active && !c.deletedAt);
    if (firstActiveCat) {
      setNewCategoryId(firstActiveCat.id);
    }
  }, [activeCompany.id, tenantCategories]);

  // Global keyboard shortcuts (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCmdOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tenantTickets.filter((t) => {
      if (scopeFilter === 'ASSIGNED_TO_ME' && t.assigneeId !== currentUser.id) {
        return false;
      }
      if (scopeFilter === 'CREATED_BY_ME' && t.requesterId !== currentUser.id) {
        return false;
      }
      if (scopeFilter === 'SLA_RISK') {
        const sla = computeSlaState(t);
        if (sla.state !== 'BREACHED' && sla.state !== 'AT_RISK') return false;
      }
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const numStr = String(t.number).padStart(6, '0');
        if (!t.title.toLowerCase().includes(q) && !numStr.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [
    tenantTickets,
    scopeFilter,
    currentUser.id,
    statusFilter,
    priorityFilter,
    searchQuery,
  ]);

  // Operational KPIs for current Tenant view
  const kpis = useMemo(() => {
    let openOrProgress = 0;
    let breached = 0;
    let atRisk = 0;
    let resolvedOrClosed = 0;

    for (const t of tenantTickets) {
      if (
        t.status === 'OPEN' ||
        t.status === 'IN_PROGRESS' ||
        t.status === 'WAITING_USER'
      ) {
        openOrProgress++;
      }
      if (t.status === 'RESOLVED' || t.status === 'CLOSED') {
        resolvedOrClosed++;
      }
      const sla = computeSlaState(t);
      if (sla.state === 'BREACHED') breached++;
      if (sla.state === 'AT_RISK') atRisk++;
    }
    return { openOrProgress, breached, atRisk, resolvedOrClosed };
  }, [tenantTickets]);

  const handleCreateTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createTicket({
      title: newTitle,
      description: newDesc,
      priority: newPriority,
      categoryId: newCategoryId,
    });
    if (created) {
      setNewTitle('');
      setNewDesc('');
      setNewPriority('MEDIUM');
      setIsNewTicketOpen(false);
      setActiveTab('tickets');
      setSelectedTicketId(created.id);
    }
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onbCompanyName.trim() || !onbCompanySlug.trim() || !onbAdminEmail.trim()) {
      return;
    }
    const createdCompany = onboardNewTenant({
      companyName: onbCompanyName,
      companySlug: onbCompanySlug,
      adminName: onbAdminName || 'Admin Principal',
      adminEmail: onbAdminEmail,
    });
    if (createdCompany) {
      setOnbCompanyName('');
      setOnbCompanySlug('');
      setOnbAdminName('');
      setOnbAdminEmail('');
      setIsOnboardingOpen(false);
      setSelectedTicketId(null);
      setActiveTab('tickets');
    }
  };

  const nextSequentialNumber = (tenantCounters[0]?.lastNumber ?? 0) + 1;

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-[#09090B] text-zinc-100 select-none">
      {/* Main Layout Wrapper */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* LEFT SIDEBAR (Linear-inspired 248px navigation) */}
        <aside className="w-62 bg-[#0D0D10] border-r border-zinc-800/80 flex flex-col justify-between shrink-0">
          <div className="p-3.5 space-y-4">
            {/* Brand + Tenant Badge */}
            <div className="flex items-center justify-between px-1.5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-mono font-bold text-xs text-white shadow-inner">
                  OF
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-zinc-100 truncate">
                    {activeCompany.name}
                  </div>
                  <div className="text-[10px] font-mono text-indigo-400 truncate">
                    slug: {activeCompany.slug}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOnboardingOpen(true)}
                className="p-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                title="Onboarding Atômico de Novo Tenant (POST /api/v1/onboarding)"
              >
                <Building2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* New Ticket + Command Palette Trigger */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setIsNewTicketOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Novo Chamado
              </button>
              <button
                onClick={() => setIsCmdOpen(true)}
                className="px-2 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 text-xs font-mono inline-flex items-center gap-1 cursor-pointer"
                title="Command Palette (Ctrl+K)"
              >
                <Command className="w-3 h-3" />K
              </button>
            </div>

            {/* Primary Navigation */}
            <div className="space-y-1">
              <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Operação & Escopos
              </div>

              <button
                onClick={() => {
                  setActiveTab('tickets');
                  setSelectedTicketId(null);
                  setScopeFilter('ALL');
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  activeTab === 'tickets' && scopeFilter === 'ALL' && !selectedTicketId
                    ? 'bg-zinc-800/90 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Inbox className="w-3.5 h-3.5 text-indigo-400" />
                  {activeRole === 'EMPLOYEE' ? 'Meus Chamados (RN-007)' : 'Fila do Tenant'}
                </span>
                <span className="font-mono text-[11px] text-zinc-500">
                  {tenantTickets.length}
                </span>
              </button>

              {activeRole !== 'EMPLOYEE' && (
                <button
                  onClick={() => {
                    setActiveTab('tickets');
                    setSelectedTicketId(null);
                    setScopeFilter('ASSIGNED_TO_ME');
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    activeTab === 'tickets' &&
                    scopeFilter === 'ASSIGNED_TO_ME' &&
                    !selectedTicketId
                      ? 'bg-zinc-800/90 text-zinc-100 font-medium'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Atribuídos a Mim
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500">
                    {tenantTickets.filter((t) => t.assigneeId === currentUser.id).length}
                  </span>
                </button>
              )}

              <button
                onClick={() => {
                  setActiveTab('tickets');
                  setSelectedTicketId(null);
                  setScopeFilter('SLA_RISK');
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  activeTab === 'tickets' && scopeFilter === 'SLA_RISK' && !selectedTicketId
                    ? 'bg-zinc-800/90 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-rose-400" />
                  SLA Estourado / Risco
                </span>
                <span className="font-mono text-[11px] text-rose-400 font-semibold">
                  {kpis.breached + kpis.atRisk}
                </span>
              </button>
            </div>

            {/* Governance & Architecture Navigation */}
            <div className="space-y-1 pt-2 border-t border-zinc-800/70">
              <div className="px-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Governança & Banco
              </div>

              <button
                onClick={() => {
                  setSelectedTicketId(null);
                  setActiveTab('categories');
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  activeTab === 'categories'
                    ? 'bg-zinc-800/90 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Categorias & Soft Delete
                </span>
                <span className="font-mono text-[10px] text-zinc-500">DEC-02</span>
              </button>

              <button
                onClick={() => {
                  setSelectedTicketId(null);
                  setActiveTab('users_audit');
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  activeTab === 'users_audit'
                    ? 'bg-zinc-800/90 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  Usuários, LGPD & Audit
                </span>
                <span className="font-mono text-[10px] text-zinc-500">DEC-03</span>
              </button>

              <button
                onClick={() => {
                  setSelectedTicketId(null);
                  setActiveTab('schema_lab');
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  activeTab === 'schema_lab'
                    ? 'bg-zinc-800/90 text-zinc-100 font-medium'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  10 Tabelas & MVCC Lab
                </span>
                <span className="font-mono text-[10px] text-emerald-400">PG 17</span>
              </button>
            </div>
          </div>

          {/* Current User Profile Card at Bottom of Sidebar */}
          <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Sessão JWT Ativa
              </span>
              <RoleBadge role={activeRole} />
            </div>
            <div className="truncate text-xs font-medium text-zinc-200">
              {currentUser.name}
            </div>
            <div className="truncate text-[11px] font-mono text-zinc-500">
              {currentUser.email}
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#09090B]">
          {/* Top Header Bar */}
          <header className="h-13 border-b border-zinc-800/80 px-6 flex items-center justify-between shrink-0 bg-[#09090B]/90 backdrop-blur-xs">
            <div className="flex items-center gap-3">
              <TicketIcon className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-medium text-zinc-200">
                {selectedTicketId
                  ? 'Inspeção de Chamado & Máquina de Estados'
                  : activeTab === 'tickets'
                    ? 'Central de Operações Multi-Tenant (Service Desk)'
                    : activeTab === 'categories'
                      ? 'Catálogo de Categorias & Índice Único Parcial'
                      : activeTab === 'users_audit'
                        ? 'Governança RBAC, Anonimização LGPD & Sessões Refresh Token'
                        : 'Explorador de Schema PostgreSQL 17 & Internals'}
              </span>
              <span className="hidden sm:inline-block font-mono text-[11px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">
                company_id: {activeCompany.id}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setIsCmdOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-400 transition-colors cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <span>Buscar ou executar comando...</span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-950 border border-zinc-800 rounded text-zinc-400">
                  Ctrl+K
                </kbd>
              </button>
            </div>
          </header>

          {/* Scrollable Viewport */}
          <div className="flex-1 overflow-y-auto">
            {selectedTicketId ? (
              <TicketDetailView
                ticketId={selectedTicketId}
                onBack={() => setSelectedTicketId(null)}
              />
            ) : activeTab === 'categories' ? (
              <CategoriesManagementView />
            ) : activeTab === 'users_audit' ? (
              <UsersAndAuditView />
            ) : activeTab === 'schema_lab' ? (
              <SchemaExplorerView />
            ) : (
              /* TICKETS LIST VIEW */
              <div className="p-6 max-w-7xl mx-auto space-y-5">
                {/* Operational KPI Strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                  <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/80 p-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-mono uppercase text-zinc-500">
                        Chamados em Aberto
                      </div>
                      <div className="text-xl font-semibold text-zinc-100 mt-0.5 font-mono">
                        {kpis.openOrProgress}
                      </div>
                    </div>
                    <Inbox className="w-5 h-5 text-indigo-400" />
                  </div>

                  <div className="rounded-xl bg-zinc-900/50 border border-rose-500/25 p-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-mono uppercase text-rose-400/90">
                        SLA Estourado (Breached)
                      </div>
                      <div className="text-xl font-semibold text-rose-400 mt-0.5 font-mono">
                        {kpis.breached}
                      </div>
                    </div>
                    <Flame className="w-5 h-5 text-rose-400" />
                  </div>

                  <div className="rounded-xl bg-zinc-900/50 border border-amber-500/25 p-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-mono uppercase text-amber-300/90">
                        SLA em Risco (&lt;25%)
                      </div>
                      <div className="text-xl font-semibold text-amber-300 mt-0.5 font-mono">
                        {kpis.atRisk}
                      </div>
                    </div>
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                  </div>

                  <div className="rounded-xl bg-zinc-900/50 border border-emerald-500/25 p-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-mono uppercase text-emerald-400/90">
                        Resolvidos / Fechados
                      </div>
                      <div className="text-xl font-semibold text-emerald-400 mt-0.5 font-mono">
                        {kpis.resolvedOrClosed}
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>

                {/* Filter Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-zinc-500 ml-1" />
                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(e.target.value as TicketStatus | 'ALL')
                      }
                      className="rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="ALL">Status: Todos</option>
                      <option value="OPEN">OPEN</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="WAITING_USER">WAITING_USER</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>

                    <select
                      value={priorityFilter}
                      onChange={(e) =>
                        setPriorityFilter(e.target.value as TicketPriority | 'ALL')
                      }
                      className="rounded-lg bg-zinc-950 border border-zinc-800 px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="ALL">Prioridade: Todas</option>
                      <option value="CRITICAL">CRITICAL (4h)</option>
                      <option value="HIGH">HIGH (8h)</option>
                      <option value="MEDIUM">MEDIUM (24h)</option>
                      <option value="LOW">LOW (72h)</option>
                    </select>

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filtrar por #número ou título..."
                      className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 w-56"
                    />
                  </div>

                  <div className="text-[11px] font-mono text-zinc-500">
                    Índice utilizado:{' '}
                    <code className="text-indigo-300">
                      idx_tickets_company_status_created_at
                    </code>
                  </div>
                </div>

                {/* High-Density Linear-style Ticket Table */}
                <div className="rounded-xl bg-zinc-950 border border-zinc-800/90 overflow-hidden shadow-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[11px] font-mono uppercase text-zinc-400">
                        <th className="py-3 px-4 w-24"># Número</th>
                        <th className="py-3 px-4">Título & Categoria</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Prioridade</th>
                        <th className="py-3 px-4">SLA (`due_at`)</th>
                        <th className="py-3 px-4">Responsável</th>
                        <th className="py-3 px-4 text-right">@Version</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {filteredTickets.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-12 text-center text-zinc-500 font-mono text-xs"
                          >
                            Nenhum chamado encontrado para os filtros atuais no tenant{' '}
                            <code>{activeCompany.slug}</code>.
                          </td>
                        </tr>
                      ) : (
                        filteredTickets.map((t) => {
                          const sla = computeSlaState(t);
                          const cat = tenantCategories.find((c) => c.id === t.categoryId);
                          const assignee = tenantUsers.find((u) => u.id === t.assigneeId);
                          const requester = tenantUsers.find((u) => u.id === t.requesterId);

                          return (
                            <tr
                              key={t.id}
                              onClick={() => setSelectedTicketId(t.id)}
                              className="hover:bg-zinc-900/60 transition-colors cursor-pointer group"
                            >
                              <td className="py-3 px-4 font-mono font-semibold text-indigo-400 group-hover:text-indigo-300">
                                #{String(t.number).padStart(6, '0')}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-medium text-zinc-100 group-hover:text-white line-clamp-1">
                                  {t.title}
                                </div>
                                <div className="text-[11px] text-zinc-500 flex items-center gap-2 mt-0.5">
                                  <span>{cat?.name || 'Sem categoria'}</span>
                                  <span>•</span>
                                  <span>por {requester?.name || 'Usuário'}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <StatusBadge status={t.status} />
                              </td>
                              <td className="py-3 px-4">
                                <PriorityBadge priority={t.priority} />
                              </td>
                              <td className="py-3 px-4">
                                <SlaPill
                                  state={sla.state}
                                  remainingText={sla.remainingText}
                                  breachedByRecalculation={sla.breachedByRecalculation}
                                />
                              </td>
                              <td className="py-3 px-4 text-zinc-300">
                                {assignee ? (
                                  <span className="text-xs">{assignee.name}</span>
                                ) : (
                                  <span className="text-[11px] font-mono text-zinc-500">
                                    Não atribuído
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-right font-mono text-[11px] text-zinc-500">
                                v{t.version}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Bottom Interactive Architecture Lab Toolbar */}
      <DemoToolbar
        onTestCrossTenantTicket={(foreignId) => {
          setActiveTab('tickets');
          setSelectedTicketId(foreignId);
        }}
      />

      {/* RFC 9457 Problem Details Toast Stack */}
      <ProblemDetailToastStack />

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCmdOpen}
        onClose={() => setIsCmdOpen(false)}
        onSelectTicket={(id) => {
          setActiveTab('tickets');
          setSelectedTicketId(id);
        }}
        onNavigateTab={(tab) => {
          setSelectedTicketId(null);
          setActiveTab(tab);
        }}
        onOpenNewTicket={() => setIsNewTicketOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Modal 1: Create New Ticket (`ticket_counters` Atomic Increment + RN-010 Validation) */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTicketSubmit}
            className="w-full max-w-lg rounded-xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  Próximo Sequencial Atômico: #{String(nextSequentialNumber).padStart(6, '0')}
                </span>
                <h3 className="text-base font-semibold text-zinc-100 mt-1">
                  Abrir Novo Chamado no Tenant `{activeCompany.slug}`
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTicketOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-300 font-medium">
                Título do Incidente ou Solicitação *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex.: Lentidão na VPN após atualização de certificado"
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-300 font-medium">
                  Categoria (`RN-010`)
                </label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {tenantCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {!c.active || c.deletedAt ? '(INATIVA — Testar 422 RN-010)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-300 font-medium">
                  Prioridade & Janela SLA (`RN-018`)
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as TicketPriority)}
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 font-mono focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="LOW">LOW (SLA: 72h)</option>
                  <option value="MEDIUM">MEDIUM (SLA: 24h)</option>
                  <option value="HIGH">HIGH (SLA: 8h)</option>
                  <option value="CRITICAL">CRITICAL (SLA: 4h)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-zinc-300 font-medium">
                Descrição Detalhada
              </label>
              <textarea
                rows={4}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Descreva os sintomas, logs ou impacto operacional..."
                className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <span className="text-[11px] font-mono text-zinc-500">
                UPSERT em `ticket_counters` + cálculo automático de `due_at`
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer"
                >
                  Criar Chamado #{String(nextSequentialNumber).padStart(6, '0')}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Modal 2: Atomic Tenant Onboarding (`POST /api/v1/onboarding`) */}
      {isOnboardingOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleOnboardingSubmit}
            className="w-full max-w-lg rounded-xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-3 h-3" />
                  Transação Atômica `@Transactional`
                </span>
                <h3 className="text-base font-semibold text-zinc-100 mt-1">
                  Onboarding de Nova Empresa (`POST /api/v1/onboarding`)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOnboardingOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Cria em uma única transação ACID: registro em <code className="text-zinc-200">companies</code>, primeiro usuário em <code className="text-zinc-200">users</code>, role <code className="text-indigo-300">ADMIN</code> em <code className="text-zinc-200">user_roles</code> e semente <code className="text-emerald-300">last_number = 0</code> em <code className="text-zinc-200">ticket_counters</code>.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-300">Nome da Empresa *</label>
                <input
                  type="text"
                  required
                  value={onbCompanyName}
                  onChange={(e) => {
                    setOnbCompanyName(e.target.value);
                    setOnbCompanySlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/^-|-$/g, '')
                    );
                  }}
                  placeholder="Ex.: Stark Robotics Ltda"
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-300">
                  Slug Único (`uk_companies_slug`) *
                </label>
                <input
                  type="text"
                  required
                  value={onbCompanySlug}
                  onChange={(e) => setOnbCompanySlug(e.target.value)}
                  placeholder="stark-robotics"
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs font-mono text-indigo-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-300">Nome do Admin Inicial *</label>
                <input
                  type="text"
                  required
                  value={onbAdminName}
                  onChange={(e) => setOnbAdminName(e.target.value)}
                  placeholder="Ex.: Tony Stark"
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-zinc-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-zinc-300">E-mail do Admin *</label>
                <input
                  type="email"
                  required
                  value={onbAdminEmail}
                  onChange={(e) => setOnbAdminEmail(e.target.value)}
                  placeholder="tony@stark.io"
                  className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs font-mono text-zinc-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsOnboardingOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-900 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium cursor-pointer"
              >
                Provisionar Novo Tenant
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <OpsFlowProvider>
      <OpsFlowWorkspace />
    </OpsFlowProvider>
  );
}

export default App;
