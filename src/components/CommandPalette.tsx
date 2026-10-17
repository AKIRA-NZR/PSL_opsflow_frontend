import React, { useState, useEffect } from 'react';
import {
  Search,
  Ticket as TicketIcon,
  PlusCircle,
  Layers,
  Shield,
  Building2,
  UserCheck,
  X,
} from 'lucide-react';
import { useOpsFlow } from '../store/opsflow-engine';
import { StatusBadge, PriorityBadge } from './Badges';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTicket: (ticketId: string) => void;
  onNavigateTab: (tab: 'tickets' | 'categories' | 'users_audit' | 'schema_lab') => void;
  onOpenNewTicket: () => void;
  onOpenOnboarding: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTicket,
  onNavigateTab,
  onOpenNewTicket,
  onOpenOnboarding,
}) => {
  const { tenantTickets, tenantUsers, switchPersona } = useOpsFlow();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingTickets = tenantTickets
    .filter(
      (t) =>
        !q ||
        t.title.toLowerCase().includes(q) ||
        String(t.number).padStart(6, '0').includes(q) ||
        t.status.toLowerCase().includes(q)
    )
    .slice(0, 5);

  const matchingUsers = tenantUsers
    .filter(
      (u) =>
        u.active &&
        !u.deletedAt &&
        (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    )
    .slice(0, 3);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
          <Search className="w-4 h-4 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar chamado por #000145, título, ação rápida ou trocar persona..."
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Quick Actions */}
          <div>
            <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Ações Rápidas
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                onClick={() => {
                  onClose();
                  onOpenNewTicket();
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-indigo-400" />
                  Abrir Novo Chamado (Incremento Atômico `ticket_counters`)
                </span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
                  C
                </kbd>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenOnboarding();
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  Onboarding Atômico de Novo Tenant (`POST /api/v1/onboarding`)
                </span>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
                  O
                </kbd>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigateTab('categories');
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Gerenciar Categorias & Soft Delete (Índice Único Parcial)
                </span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigateTab('users_audit');
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-sky-400" />
                  Inspecionar Usuários, Sessões Refresh Token & Audit Logs
                </span>
              </button>
            </div>
          </div>

          {/* Matching Tickets */}
          {matchingTickets.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Chamados do Tenant Atual ({matchingTickets.length})
              </div>
              <div className="space-y-0.5 mt-1">
                {matchingTickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onClose();
                      onSelectTicket(t.id);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-zinc-200 hover:bg-zinc-900 transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-3">
                      <TicketIcon className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                      <span className="font-mono text-indigo-400 shrink-0">
                        #{String(t.number).padStart(6, '0')}
                      </span>
                      <span className="truncate text-zinc-200">{t.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Switch Persona */}
          {matchingUsers.length > 0 && (
            <div>
              <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Alternar Persona RBAC
              </div>
              <div className="space-y-0.5 mt-1">
                {matchingUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchPersona(u.id);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-zinc-300 hover:bg-zinc-900 transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                      {u.name} <span className="text-zinc-500 font-mono">({u.email})</span>
                    </span>
                    <span className="font-mono text-[10px] text-indigo-300">
                      {u.roles.join(' + ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-zinc-900/60 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Pressione ESC para fechar</span>
          <span>OpsFlow Command Bar · Ctrl+K</span>
        </div>
      </div>
    </div>
  );
};
