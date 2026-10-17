import React, { useState } from 'react';
import {
  Archive,
  CheckCircle2,
  Database,
  KeyRound,
  Layers,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from 'lucide-react';
import { useOpsFlow } from '../store/opsflow-engine';
import type { RoleName } from '../types/opsflow';
import { RoleBadge } from './Badges';

/**
 * 1. Categories Management View:
 * Demonstrates Soft Delete (`deleted_at`) + PostgreSQL Partial Unique Index (`WHERE deleted_at IS NULL` — DEC-02 / RN-009 / RN-010).
 */
export const CategoriesManagementView: React.FC = () => {
  const {
    activeCompany,
    activeRole,
    tenantCategories,
    createCategory,
    toggleCategoryActive,
    softDeleteCategory,
  } = useOpsFlow();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const ok = createCategory(name, description);
    if (ok) {
      setName('');
      setDescription('');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Categorias do Tenant & Índice Único Parcial (`ticket_categories`)
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Demonstração prática da <strong className="text-zinc-200">DEC-02 / RN-009 / RN-010</strong>:{' '}
            <code className="text-indigo-300">
              CREATE UNIQUE INDEX uk_ticket_categories_company_name_active ON ticket_categories (company_id, LOWER(name)) WHERE deleted_at IS NULL
            </code>
          </p>
        </div>
        <span className="font-mono text-xs px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
          Tenant: <strong className="text-zinc-200">{activeCompany.slug}</strong>
        </span>
      </div>

      {/* Create Category Form */}
      <form
        onSubmit={handleSubmit}
        className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
      >
        <div className="md:col-span-4 space-y-1">
          <label className="text-[11px] font-mono text-zinc-400">
            Nome da Categoria (`LOWER(name)`)
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Telefonia PABX Legada"
            className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="md:col-span-5 space-y-1">
          <label className="text-[11px] font-mono text-zinc-400">Descrição Operacional</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Escopo de atendimento desta fila..."
            className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-2 text-xs text-zinc-100 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="md:col-span-3 flex gap-2">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Criar Categoria
          </button>
        </div>

        <div className="md:col-span-12 pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
          <span>
            💡 <strong>Teste o Índice Único Parcial:</strong> A categoria{' '}
            <code className="text-amber-300">Telefonia PABX Legada</code> sofreu Soft Delete (
            <code className="text-zinc-300">deleted_at IS NOT NULL</code>). Você pode recriar outra com o mesmo nome sem erro! Já tentar duplicar{' '}
            <code className="text-indigo-300">Infraestrutura &amp; Cloud</code> dispara <strong>HTTP 409 Conflict</strong>.
          </span>
          <button
            type="button"
            onClick={() => {
              setName('Telefonia PABX Legada');
              setDescription('Recriada com mesmo nome após Soft Delete graças ao Partial Unique Index!');
            }}
            className="font-mono text-indigo-400 hover:underline cursor-pointer shrink-0"
          >
            Preencher &quot;Telefonia PABX Legada&quot;
          </button>
        </div>
      </form>

      {/* Categories Table */}
      <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[11px] font-mono uppercase text-zinc-400">
              <th className="py-3 px-4">Nome</th>
              <th className="py-3 px-4">Descrição</th>
              <th className="py-3 px-4">Estado (`active` / `deleted_at`)</th>
              <th className="py-3 px-4 text-right">Ações (ADMIN)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {tenantCategories.map((cat) => (
              <tr key={cat.id} className="hover:bg-zinc-900/40 transition-colors">
                <td className="py-3 px-4 font-medium text-zinc-200">
                  {cat.name}
                  <div className="font-mono text-[10px] text-zinc-500">{cat.id}</div>
                </td>
                <td className="py-3 px-4 text-zinc-400">{cat.description || '—'}</td>
                <td className="py-3 px-4 font-mono">
                  {cat.deletedAt ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/25 text-[11px]">
                      <Archive className="w-3 h-3" />
                      SOFT DELETED ({new Date(cat.deletedAt).toLocaleDateString('pt-BR')})
                    </span>
                  ) : cat.active ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[11px]">
                      <CheckCircle2 className="w-3 h-3" />
                      ACTIVE (deleted_at IS NULL)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/25 text-[11px]">
                      INACTIVE (RN-010: Bloqueia novos tickets)
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right space-x-2">
                  {!cat.deletedAt && (
                    <>
                      <button
                        disabled={activeRole !== 'ADMIN'}
                        onClick={() => toggleCategoryActive(cat.id)}
                        className="px-2.5 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-[11px] font-mono disabled:opacity-40 cursor-pointer"
                      >
                        {cat.active ? 'Desativar' : 'Reativar'}
                      </button>
                      <button
                        disabled={activeRole !== 'ADMIN'}
                        onClick={() => softDeleteCategory(cat.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-mono disabled:opacity-40 cursor-pointer"
                        title="Define deleted_at = NOW() liberando o nome no índice parcial"
                      >
                        <Trash2 className="w-3 h-3" />
                        Soft Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * 2. Users, LGPD Anonymization (DEC-03), Refresh Token Family Rotation (T-04) & Audit Logs (`audit_logs`)
 */
export const UsersAndAuditView: React.FC = () => {
  const {
    activeCompany,
    activeRole,
    tenantUsers,
    tenantRefreshSessions,
    tenantAuditLogs,
    createUser,
    anonymizeUserLgpd,
    simulateRefreshTokenReuseAttack,
  } = useOpsFlow();

  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<RoleName[]>(['EMPLOYEE']);

  const toggleRoleSelection = (role: RoleName) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;
    const ok = createUser(newName, newEmail, selectedRoles);
    if (ok) {
      setNewName('');
      setNewEmail('');
      setSelectedRoles(['EMPLOYEE']);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* SECTION A: Users & LGPD Anonymization (DEC-03) */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Usuários, Perfis (`user_roles`) & Anonimização LGPD (`DEC-03`)
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Em vez de <code className="text-rose-300">DELETE FROM users</code> (que quebraria FKs em{' '}
              <code className="text-zinc-300">tickets</code> e <code className="text-zinc-300">ticket_history</code>), o OpsFlow aplica anonimização in-place (<strong className="text-zinc-200">DEC-03</strong>).
            </p>
          </div>
        </div>

        {/* Create User Form */}
        <form
          onSubmit={handleCreateUser}
          className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
        >
          <div className="md:col-span-3 space-y-1">
            <label className="text-[11px] font-mono text-zinc-400">Nome Completo</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex.: Gabriel Rocha"
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-100"
            />
          </div>
          <div className="md:col-span-4 space-y-1">
            <label className="text-[11px] font-mono text-zinc-400">
              E-mail (`uk_users_company_email_active`)
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="gabriel@acme.io"
              className="w-full rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs text-zinc-100"
            />
          </div>
          <div className="md:col-span-3 space-y-1">
            <label className="text-[11px] font-mono text-zinc-400 block">
              Roles (`user_roles`)
            </label>
            <div className="flex items-center gap-1.5">
              {(['EMPLOYEE', 'TECHNICIAN', 'ADMIN'] as RoleName[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => toggleRoleSelection(r)}
                  className={`px-2 py-1 rounded text-[10px] font-mono border cursor-pointer ${
                    selectedRoles.includes(r)
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Adicionar
            </button>
          </div>
        </form>

        {/* Users Table */}
        <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[11px] font-mono uppercase text-zinc-400">
                <th className="py-2.5 px-4">Usuário</th>
                <th className="py-2.5 px-4">E-mail</th>
                <th className="py-2.5 px-4">Roles (`user_roles`)</th>
                <th className="py-2.5 px-4">Status / LGPD</th>
                <th className="py-2.5 px-4 text-right">Direito ao Esquecimento (DEC-03)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {tenantUsers.map((u) => (
                <tr key={u.id} className="hover:bg-zinc-900/40">
                  <td className="py-2.5 px-4 font-medium text-zinc-200">{u.name}</td>
                  <td className="py-2.5 px-4 font-mono text-zinc-400">{u.email}</td>
                  <td className="py-2.5 px-4 space-x-1">
                    {u.roles.map((r) => (
                      <RoleBadge key={r} role={r} />
                    ))}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[11px]">
                    {u.deletedAt ? (
                      <span className="text-rose-400">
                        ANONIMIZADO ({new Date(u.deletedAt).toLocaleTimeString('pt-BR')})
                      </span>
                    ) : (
                      <span className="text-emerald-400">ATIVO</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {!u.deletedAt && (
                      <button
                        disabled={activeRole !== 'ADMIN'}
                        onClick={() => anonymizeUserLgpd(u.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-mono disabled:opacity-40 cursor-pointer"
                      >
                        <UserMinus className="w-3 h-3" />
                        Anonimizar PII (LGPD)
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION B: Refresh Token Family & Reuse Detection Simulator (T-04) */}
      <div className="space-y-3">
        <div className="border-b border-zinc-800 pb-2">
          <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-amber-400" />
            Sessões `refresh_tokens` & Detecção de Reuso por Família (`family_id` — Threat T-04)
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Se um atacante roubar um Refresh Token antigo que já foi rotacionado (<code className="text-zinc-200">replaced_by_token_id IS NOT NULL</code>) e tentar usá-lo, o backend invalida instantaneamente <strong>toda a família (`family_id`)</strong> no PostgreSQL!
          </p>
        </div>

        <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[11px] font-mono uppercase text-zinc-400">
                <th className="py-2.5 px-4">Token ID / Família</th>
                <th className="py-2.5 px-4">Usuário</th>
                <th className="py-2.5 px-4">Hash SHA-256 & Substituição</th>
                <th className="py-2.5 px-4">Estado</th>
                <th className="py-2.5 px-4 text-right">Simulador de Ataque (T-04)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900">
              {tenantRefreshSessions.map((s) => {
                const usr = tenantUsers.find((u) => u.id === s.userId);
                return (
                  <tr key={s.id} className="hover:bg-zinc-900/40 font-mono text-[11px]">
                    <td className="py-2.5 px-4">
                      <div className="text-zinc-200">{s.id}</div>
                      <div className="text-indigo-400">family: {s.familyId}</div>
                    </td>
                    <td className="py-2.5 px-4 font-sans text-zinc-300">
                      {usr?.name || s.userId}
                      <div className="text-[10px] text-zinc-500">{s.userAgent}</div>
                    </td>
                    <td className="py-2.5 px-4 text-zinc-400">
                      <div>{s.tokenHash}</div>
                      {s.replacedByTokenId && (
                        <div className="text-amber-300">
                          replaced_by: {s.replacedByTokenId}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4">
                      {s.revokedAt ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          REVOKED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      {s.replacedByTokenId && (
                        <button
                          onClick={() => simulateRefreshTokenReuseAttack(s.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-300 cursor-pointer"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Simular Reuso de Token Rotacionado
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION C: Immutable Compliance Audit Logs (`audit_logs` with JSONB metadata) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div>
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              Trilha de Auditoria de Conformidade (`audit_logs` + Coluna `metadata JSONB`)
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Separada de <code className="text-zinc-200">ticket_history</code> (<strong>DEC-07</strong>): registra eventos críticos de segurança, onboarding, anonimização LGPD e mutações com <code className="text-indigo-300">correlation_id</code>.
            </p>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            Tenant: {activeCompany.name} ({tenantAuditLogs.length} eventos)
          </span>
        </div>

        <div className="space-y-2">
          {tenantAuditLogs.map((log) => (
            <div
              key={log.id}
              className="rounded-xl bg-zinc-950 border border-zinc-800/90 p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 font-mono text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold text-[11px]">
                    <ShieldCheck className="w-3 h-3" />
                    {log.action}
                  </span>
                  <span className="text-zinc-400 text-[11px]">
                    resource: <strong className="text-zinc-200">{log.resourceType}</strong> ({log.resourceId})
                  </span>
                  <span className="text-zinc-500 text-[11px]">
                    actor: {log.actorEmail || 'system'}
                  </span>
                </div>
                <pre className="text-[11px] text-emerald-300/90 bg-zinc-900/90 border border-zinc-800 rounded p-2 overflow-x-auto">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              </div>
              <div className="text-right text-[11px] text-zinc-500 shrink-0 space-y-0.5">
                <div>{new Date(log.createdAt).toLocaleString('pt-BR')}</div>
                <div>IP: {log.ipAddress}</div>
                <div className="text-zinc-600">corr: {log.correlationId.slice(0, 12)}...</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
