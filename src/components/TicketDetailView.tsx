import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  GitCommit,
  Lock,
  MessageSquare,
  Play,
  RefreshCw,
  Send,
  ShieldAlert,
  Sparkles,
  UserCheck,
  XCircle,
  Zap,
} from 'lucide-react';
import { computeSlaState, useOpsFlow } from '../store/opsflow-engine';
import {
  ALLOWED_TRANSITIONS,
  type TicketPriority,
  type TicketStatus,
} from '../types/opsflow';
import { PriorityBadge, RoleBadge, SlaPill, StatusBadge } from './Badges';

interface TicketDetailViewProps {
  ticketId: string;
  onBack: () => void;
}

export const TicketDetailView: React.FC<TicketDetailViewProps> = ({
  ticketId,
  onBack,
}) => {
  const {
    activeCompany,
    currentUser,
    activeRole,
    tenantUsers,
    tenantCategories,
    getTicketByIdForCurrentTenant,
    getCommentsForTicket,
    getHistoryForTicket,
    transitionTicketStatus,
    assignTicketTechnician,
    changeTicketPriority,
    simulateConcurrentVersionBump,
    addTicketComment,
  } = useOpsFlow();

  const { ticket, isCrossTenantIdorBlocked } =
    getTicketByIdForCurrentTenant(ticketId);

  // Client-held optimistic lock version (@Version)
  // When another user updates the ticket in DB, clientVersion stays stale until refreshed, allowing 409 Conflict testing!
  const [clientVersion, setClientVersion] = useState<number>(ticket?.version ?? 0);
  const [commentText, setCommentText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [activeFeedTab, setActiveFeedTab] = useState<'all' | 'comments' | 'history'>('all');

  // Resolution Modal state (RN-015)
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionInput, setResolutionInput] = useState('');

  // Sync clientVersion when switching tickets, or when our own action succeeds
  useEffect(() => {
    if (ticket) {
      setClientVersion(ticket.version);
    }
  }, [ticket?.id]);

  // 1. Cross-Tenant BOLA / IDOR 404 Screen (T-01 & RN-003)
  if (!ticket || isCrossTenantIdorBlocked) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-10">
        <div className="rounded-xl bg-zinc-950 border border-rose-500/40 p-6 shadow-2xl">
          <div className="flex items-center gap-3 text-rose-400">
            <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                HTTP 404 Not Found · Anti-IDOR / BOLA (T-01 & RN-003)
              </span>
              <h2 className="text-lg font-semibold text-zinc-100 mt-1">
                Recurso Não Encontrado no Escopo do Tenant `{activeCompany.slug}`
              </h2>
            </div>
          </div>

          <p className="text-xs text-zinc-400 mt-4 leading-relaxed">
            A query executada no PostgreSQL utilizou a chave composta{' '}
            <code className="text-indigo-300 bg-zinc-900 px-1.5 py-0.5 rounded">
              SELECT * FROM tickets WHERE company_id = &apos;{activeCompany.id}&apos; AND id = &apos;{ticketId}&apos;
            </code>
            .
          </p>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Como o registro pertence a outra organização (ou a outro colaborador quando autenticado como{' '}
            <code className="text-zinc-200">EMPLOYEE</code>), o backend retorna estritamente{' '}
            <strong className="text-rose-300">404 Not Found</strong> (e nunca <code className="text-zinc-300">403 Forbidden</code>) para impedir ataques de enumeração de identificadores entre clientes SaaS.
          </p>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar para a Fila do Tenant `{activeCompany.slug}`
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sla = computeSlaState(ticket);
  const category = tenantCategories.find((c) => c.id === ticket.categoryId);
  const requester = tenantUsers.find((u) => u.id === ticket.requesterId);
  const assignee = tenantUsers.find((u) => u.id === ticket.assigneeId);
  const technicians = tenantUsers.filter(
    (u) =>
      u.active &&
      !u.deletedAt &&
      (u.roles.includes('TECHNICIAN') || u.roles.includes('ADMIN'))
  );

  const ticketComments = getCommentsForTicket(ticket.id);
  const ticketHistory = getHistoryForTicket(ticket.id);
  const allowedNextStatuses = ALLOWED_TRANSITIONS[ticket.status];
  const isTerminal = ticket.status === 'CLOSED' || ticket.status === 'CANCELLED';
  const isVersionStale = clientVersion !== ticket.version;

  const handleTransitionClick = (targetStatus: TicketStatus) => {
    if (targetStatus === 'RESOLVED') {
      setResolutionInput(ticket.resolutionSummary || '');
      setShowResolveModal(true);
      return;
    }

    const ok = transitionTicketStatus(ticket.id, targetStatus, clientVersion);
    if (ok) {
      setClientVersion(ticket.version + 1);
    }
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = transitionTicketStatus(ticket.id, 'RESOLVED', clientVersion, {
      resolutionSummary: resolutionInput,
    });
    if (ok) {
      setClientVersion(ticket.version + 1);
      setShowResolveModal(false);
    }
  };

  const handleAssigneeChange = (newAssigneeId: string) => {
    const val = newAssigneeId === '' ? null : newAssigneeId;
    const ok = assignTicketTechnician(ticket.id, val, clientVersion);
    if (ok) {
      setClientVersion(ticket.version + 1);
    }
  };

  const handlePriorityChange = (newPriority: TicketPriority) => {
    const ok = changeTicketPriority(ticket.id, newPriority, clientVersion);
    if (ok) {
      setClientVersion(ticket.version + 1);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = addTicketComment(
      ticket.id,
      commentText,
      activeRole === 'EMPLOYEE' ? false : isInternalNote
    );
    if (ok) {
      setCommentText('');
      setIsInternalNote(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Breadcrumb + Optimistic Locking @Version Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Fila de Chamados
          </button>
          <span className="font-mono text-sm font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/25">
            #{String(ticket.number).padStart(6, '0')}
          </span>
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <SlaPill
            state={sla.state}
            remainingText={sla.remainingText}
            breachedByRecalculation={sla.breachedByRecalculation}
          />
        </div>

        {/* @Version Optimistic Locking Interactive Controls */}
        <div className="flex items-center gap-2">
          <div
            className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[11px] font-mono border ${
              isVersionStale
                ? 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
          >
            <span>
              Tela @Version: <strong className="text-zinc-100">{clientVersion}</strong>
            </span>
            <span>·</span>
            <span>
              DB @Version: <strong className="text-indigo-400">{ticket.version}</strong>
            </span>
          </div>

          <button
            onClick={() => simulateConcurrentVersionBump(ticket.id)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono transition-colors cursor-pointer"
            title="Incrementa a coluna version no banco sem atualizar sua tela, para você testar o erro HTTP 409 Conflict ao tentar salvar!"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Simular Edição Concorrente (@Version +1)
          </button>

          {isVersionStale && (
            <button
              onClick={() => setClientVersion(ticket.version)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              Sincronizar Tela (v{ticket.version})
            </button>
          )}
        </div>
      </div>

      {/* Main Split Grid: 68% Left Content + 32% Right Operational Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Ticket Header & Description Card */}
          <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/90 p-5 space-y-4">
            <h1 className="text-lg font-semibold text-zinc-100 leading-snug">
              {ticket.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pb-3 border-b border-zinc-800/70">
              <span>
                Solicitante:{' '}
                <strong className="text-zinc-200">
                  {requester?.name || 'Usuário Removido'}
                </strong>
              </span>
              <span>•</span>
              <span>
                Aberto em:{' '}
                <span className="font-mono text-zinc-300">
                  {new Date(ticket.createdAt).toLocaleString('pt-BR')}
                </span>
              </span>
              <span>•</span>
              <span>
                Categoria:{' '}
                <span className="text-indigo-300 font-medium">
                  {category?.name || 'Sem categoria'}
                </span>
              </span>
            </div>

            <div className="text-sm text-zinc-300 whitespace-pre-line leading-relaxed bg-zinc-950/60 border border-zinc-800/60 rounded-lg p-4 font-sans">
              {ticket.description}
            </div>

            {/* Resolution Summary Banner (RN-015) */}
            {ticket.resolutionSummary && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Resumo da Resolução (`resolution_summary` — RN-015)
                  </span>
                  {ticket.resolvedAt && (
                    <span className="text-[11px] font-mono text-emerald-400/80">
                      Resolvido em {new Date(ticket.resolvedAt).toLocaleString('pt-BR')}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-200 leading-relaxed pt-1">
                  {ticket.resolutionSummary}
                </p>
              </div>
            )}
          </div>

          {/* Comment Composer (Append-only `ticket_comments` + RN-020 Internal Toggle) */}
          <form
            onSubmit={handleAddComment}
            className={`rounded-xl border p-4 space-y-3 transition-colors ${
              isInternalNote && activeRole !== 'EMPLOYEE'
                ? 'bg-amber-950/20 border-amber-500/40'
                : 'bg-zinc-900/60 border-zinc-800/90'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300 flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                Adicionar Comentário Imutável (`ticket_comments` Append-Only)
              </span>

              {/* RN-020: Only TECHNICIAN and ADMIN can toggle internal notes */}
              {activeRole !== 'EMPLOYEE' ? (
                <label className="inline-flex items-center gap-2 text-xs cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isInternalNote}
                    onChange={(e) => setIsInternalNote(e.target.checked)}
                    className="rounded border-zinc-700 bg-zinc-900 text-amber-500 focus:ring-0"
                  />
                  <span
                    className={`inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded border ${
                      isInternalNote
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}
                  >
                    <Lock className="w-3 h-3" />
                    Nota Interna Técnica (RN-020: Oculta de EMPLOYEE)
                  </span>
                </label>
              ) : (
                <span className="text-[11px] font-mono text-zinc-500">
                  Modo EMPLOYEE: Notas internas da equipe técnica não são serializadas na API (RN-020)
                </span>
              )}
            </div>

            <textarea
              rows={3}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={
                isInternalNote
                  ? 'Escreva uma nota privada visível apenas para TECHNICIAN e ADMIN (ex.: logs de banco, hipótese de causa raiz)...'
                  : 'Escreva uma resposta pública para o solicitante...'
              }
              className="w-full rounded-lg bg-zinc-950/90 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {isInternalNote ? 'Registrar Nota Interna' : 'Enviar Comentário'}
              </button>
            </div>
          </form>

          {/* Activity Feed: Comments + Audit History (`ticket_history`) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                {(['all', 'comments', 'history'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveFeedTab(tab)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      activeFeedTab === tab
                        ? 'bg-zinc-800 text-zinc-100'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {tab === 'all' && ` Linha do Tempo Completa (${ticketComments.length + ticketHistory.length})`}
                    {tab === 'comments' && `Comentários Visíveis (${ticketComments.length})`}
                    {tab === 'history' && `Histórico de Eventos (${ticketHistory.length})`}
                  </button>
                ))}
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                Append-Only · Zero UPDATE/DELETE
              </span>
            </div>

            {/* Comments Section */}
            {(activeFeedTab === 'all' || activeFeedTab === 'comments') && (
              <div className="space-y-3">
                {ticketComments.map((c) => {
                  const author = tenantUsers.find((u) => u.id === c.authorId);
                  return (
                    <div
                      key={c.id}
                      className={`rounded-xl border p-4 space-y-2 ${
                        c.internal
                          ? 'bg-amber-950/15 border-amber-500/35'
                          : 'bg-zinc-900/40 border-zinc-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-200">
                            {author?.name || 'Usuário'}
                          </span>
                          {author?.roles.map((r) => (
                            <RoleBadge key={r} role={r} />
                          ))}
                          {c.internal && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              <Lock className="w-2.5 h-2.5" />
                              INTERNAL NOTE (RN-020)
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-zinc-500">
                          {new Date(c.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                        {c.content}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Ticket History Section (`ticket_history`) */}
            {(activeFeedTab === 'all' || activeFeedTab === 'history') && (
              <div className="rounded-xl bg-zinc-950 border border-zinc-800/80 p-4 space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                  <GitCommit className="w-3.5 h-3.5 text-indigo-400" />
                  Tabela `ticket_history` (Rastreabilidade Operacional Imutável)
                </div>
                <div className="space-y-2.5">
                  {ticketHistory.map((h) => {
                    const actor = tenantUsers.find((u) => u.id === h.actorId);
                    return (
                      <div
                        key={h.id}
                        className="flex items-start justify-between gap-4 text-xs py-1.5 border-b border-zinc-900 last:border-0"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-indigo-300">
                              {h.eventType}
                            </span>
                            <span className="text-zinc-300 font-medium">
                              {actor?.name || 'Sistema'}
                            </span>
                            {h.fieldName && (
                              <span className="text-zinc-500 font-mono text-[11px]">
                                campo <code className="text-zinc-300">{h.fieldName}</code>:{' '}
                                {h.oldValue ? (
                                  <span className="line-through text-rose-400/80">
                                    {h.oldValue}
                                  </span>
                                ) : (
                                  'null'
                                )}{' '}
                                → <span className="text-emerald-400">{h.newValue}</span>
                              </span>
                            )}
                          </div>
                          {h.note && <p className="text-zinc-400 text-[11px]">{h.note}</p>}
                        </div>
                        <span className="font-mono text-[11px] text-zinc-500 shrink-0">
                          {new Date(h.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Operational Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* State Machine Card (RN-012 .. RN-016) */}
          <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/90 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                Máquina de Estados (RN-012)
              </span>
              <span className="text-[11px] font-mono text-zinc-500">
                Estado: {ticket.status}
              </span>
            </div>

            {isTerminal ? (
              <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-400">
                Este chamado encontra-se em estado terminal (
                <code className="text-zinc-200">{ticket.status}</code>). Nenhuma mutação adicional é permitida (
                <strong className="text-indigo-300">RN-013</strong>).
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] text-zinc-400">
                  Transições válidas a partir de <code className="text-zinc-200">{ticket.status}</code>:
                </p>
                <div className="flex flex-wrap gap-2">
                  {allowedNextStatuses.map((nextSt) => (
                    <button
                      key={nextSt}
                      onClick={() => handleTransitionClick(nextSt)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-colors cursor-pointer ${
                        nextSt === 'RESOLVED' || nextSt === 'CLOSED'
                          ? 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30'
                          : nextSt === 'CANCELLED'
                            ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      <Play className="w-3 h-3" />→ {nextSt}
                    </button>
                  ))}
                </div>

                {/* Deliberate Invalid Transition Tester button to demonstrate 409 RN-012 */}
                {ticket.status === 'OPEN' && (
                  <button
                    onClick={() => transitionTicketStatus(ticket.id, 'CLOSED', clientVersion)}
                    className="w-full mt-2 px-2.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-dashed border-zinc-700 text-[11px] font-mono text-zinc-400 hover:text-rose-300 transition-colors cursor-pointer text-left"
                  >
                    🧪 Testar Transição Proibida: OPEN → CLOSED (Dispara 409 RN-012)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Technician Assignment Card (RN-014 + Composite FK) */}
          <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/90 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                Responsável Técnico (RN-014)
              </span>
              <UserCheck className="w-4 h-4 text-indigo-400" />
            </div>

            <select
              disabled={isTerminal}
              value={ticket.assigneeId || ''}
              onChange={(e) => handleAssigneeChange(e.target.value)}
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50 cursor-pointer"
            >
              <option value="">— Sem técnico atribuído (Fila Geral) —</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} ({tech.roles.join(', ')})
                </option>
              ))}
            </select>

            {!ticket.assigneeId && ticket.status === 'OPEN' && (
              <p className="text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded p-2">
                Dica de Teste: Tente clicar em <strong>→ IN_PROGRESS</strong> acima sem atribuir um técnico para ver a validação <strong>HTTP 422 (RN-014)</strong>!
              </p>
            )}

            {assignee && (
              <div className="text-[11px] font-mono text-zinc-500">
                FK Composta validada: <code className="text-zinc-300">(company_id, assignee_id)</code>
              </div>
            )}
          </div>

          {/* Priority & SLA Audit Panel (RN-018 + DEC-06) */}
          <div className="rounded-xl bg-zinc-900/60 border border-zinc-800/90 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-200 uppercase tracking-wider font-mono">
                Prioridade & SLA (DEC-06)
              </span>
              <Clock className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-zinc-400 block">
                Alterar Prioridade (Recalcula `due_at` preservando `original_due_at`):
              </label>
              <select
                disabled={isTerminal}
                value={ticket.priority}
                onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-200 font-mono focus:outline-none focus:border-indigo-500 disabled:opacity-50 cursor-pointer"
              >
                <option value="LOW">LOW (SLA: 72 horas)</option>
                <option value="MEDIUM">MEDIUM (SLA: 24 horas)</option>
                <option value="HIGH">HIGH (SLA: 8 horas)</option>
                <option value="CRITICAL">CRITICAL (SLA: 4 horas)</option>
              </select>
            </div>

            <div className="rounded-lg bg-zinc-950 border border-zinc-800/80 p-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">created_at:</span>
                <span className="text-zinc-300">
                  {new Date(ticket.createdAt).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">original_due_at:</span>
                <span className="text-zinc-400">
                  {new Date(ticket.originalDueAt).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">due_at (vigente):</span>
                <span className="text-indigo-300 font-semibold">
                  {new Date(ticket.dueAt).toLocaleString('pt-BR')}
                </span>
              </div>
              {ticket.dueAt !== ticket.originalDueAt && (
                <div className="pt-1.5 border-t border-zinc-800 text-[11px] text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span>DEC-06 ativa: Prazo recalculado mantendo histórico original.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resolution Summary Modal (RN-015) */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmResolve}
            className="w-full max-w-lg rounded-xl bg-zinc-950 border border-zinc-800 p-6 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Resolver Chamado #{String(ticket.number).padStart(6, '0')} (RN-015)
              </h3>
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="text-zinc-500 hover:text-zinc-300 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Pela regra <strong className="text-zinc-200">RN-015</strong> e pela constraint SQL{' '}
              <code className="text-indigo-300">chk_tickets_resolved_consistency</code>, um chamado só pode transitar para{' '}
              <code className="text-emerald-300">RESOLVED</code> com o preenchimento de{' '}
              <code className="text-zinc-200">resolution_summary</code> e <code className="text-zinc-200">resolved_at</code>.
            </p>

            <textarea
              rows={4}
              value={resolutionInput}
              onChange={(e) => setResolutionInput(e.target.value)}
              placeholder="Descreva a causa raiz identificada e o procedimento aplicado para resolver o incidente (mínimo 10 caracteres)..."
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  // Let user test submitting empty resolution to see HTTP 422 ProblemDetail!
                  transitionTicketStatus(ticket.id, 'RESOLVED', clientVersion, {
                    resolutionSummary: '',
                  });
                }}
                className="text-[11px] font-mono text-amber-400 hover:underline cursor-pointer"
              >
                🧪 Testar envio vazio (Dispara 422 RN-015)
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium cursor-pointer"
                >
                  Confirmar Resolução
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
