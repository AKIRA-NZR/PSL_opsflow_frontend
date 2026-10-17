import React from 'react';
import {
  Cpu,
  Database,
  GitBranch,
  HardDrive,
  Key,
  Lock,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useOpsFlow } from '../store/opsflow-engine';

/**
 * Interactive PostgreSQL 17 & Spring Boot 4 Architecture Lab View:
 * Visualizes the 10 MVP tables, live row counts for the current tenant, `ticket_counters` state,
 * Composite Foreign Keys `(company_id, id)`, and MVCC / HOT Updates (`fillfactor = 80`).
 */
export const SchemaExplorerView: React.FC = () => {
  const {
    companies,
    activeCompany,
    tenantUsers,
    tenantCategories,
    tenantTickets,
    tenantCounters,
    tenantRefreshSessions,
    tenantAuditLogs,
  } = useOpsFlow();

  const currentCounter = tenantCounters[0]?.lastNumber ?? 0;

  const tables = [
    {
      name: '1. companies',
      pk: 'PRIMARY KEY (id)',
      rows: companies.length,
      scope: 'Root Aggregate',
      highlight: 'uk_companies_slug · Raiz de isolamento Multi-Tenant',
      badge: 'Core Tenant',
    },
    {
      name: '2. users',
      pk: 'PRIMARY KEY (id) + UNIQUE (company_id, id)',
      rows: tenantUsers.length,
      scope: `Tenant (${activeCompany.slug})`,
      highlight:
        'uk_users_company_email_active WHERE deleted_at IS NULL · Anonimização LGPD (DEC-03)',
      badge: 'Identity & PII',
    },
    {
      name: '3. user_roles',
      pk: 'PRIMARY KEY (company_id, user_id, role)',
      rows: tenantUsers.reduce((acc, u) => acc + u.roles.length, 0),
      scope: `Tenant (${activeCompany.slug})`,
      highlight: 'FK Composta (company_id, user_id) -> users(company_id, id) (DEC-12)',
      badge: 'RBAC',
    },
    {
      name: '4. refresh_tokens',
      pk: 'PRIMARY KEY (id)',
      rows: tenantRefreshSessions.length,
      scope: `Tenant (${activeCompany.slug})`,
      highlight: 'family_id + replaced_by_token_id · Detecção de Reuso (Threat T-04)',
      badge: 'Security',
    },
    {
      name: '5. ticket_categories',
      pk: 'PRIMARY KEY (id) + UNIQUE (company_id, id)',
      rows: tenantCategories.length,
      scope: `Tenant (${activeCompany.slug})`,
      highlight: 'Partial Unique Index WHERE deleted_at IS NULL (DEC-02 / RN-010)',
      badge: 'Catalog',
    },
    {
      name: '6. ticket_counters',
      pk: 'PRIMARY KEY (company_id)',
      rows: 1,
      scope: `last_number = ${currentCounter}`,
      highlight:
        'INSERT ... ON CONFLICT (company_id) DO UPDATE SET last_number = last_number + 1',
      badge: 'Atomic Lock',
    },
    {
      name: '7. tickets',
      pk: 'PRIMARY KEY (id) + UNIQUE (company_id, id)',
      rows: tenantTickets.length,
      scope: `Tenant (${activeCompany.slug})`,
      highlight:
        '3 FKs Compostas (category, requester, assignee) + @Version + fillfactor=80 (HOT Update)',
      badge: 'Aggregate Root',
    },
    {
      name: '8. ticket_comments',
      pk: 'PRIMARY KEY (id)',
      rows: 'Append-Only',
      scope: `Tenant (${activeCompany.slug})`,
      highlight:
        'FK Composta (company_id, ticket_id) + internal BOOLEAN (RN-020: oculto de EMPLOYEE)',
      badge: 'Immutable',
    },
    {
      name: '9. ticket_history',
      pk: 'PRIMARY KEY (id)',
      rows: 'Append-Only',
      scope: `Tenant (${activeCompany.slug})`,
      highlight: 'Timeline operacional de transições de estado, prioridade e atribuição',
      badge: 'Timeline',
    },
    {
      name: '10. audit_logs',
      pk: 'PRIMARY KEY (id)',
      rows: tenantAuditLogs.length,
      scope: `Tenant (${activeCompany.slug})`,
      highlight: 'metadata JSONB + correlation_id + IP/User-Agent (Compliance & Security)',
      badge: 'Compliance',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            Arquitetura PostgreSQL 17 & Modelagem das 10 Tabelas do MVP
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Painel vivo sincronizado com o estado em memória do tenant{' '}
            <code className="text-indigo-300">{activeCompany.slug}</code> — refletindo todas as decisões arquiteturais (<code className="text-zinc-200">DEC-01</code> a <code className="text-zinc-200">DEC-15</code>).
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
          <Key className="w-3.5 h-3.5 text-amber-400" />
          <span>ticket_counters.last_number:</span>
          <strong className="text-indigo-400">
            #{String(currentCounter).padStart(6, '0')}
          </strong>
        </div>
      </div>

      {/* Architectural Highlights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-indigo-300">
            <Shield className="w-4 h-4 text-indigo-400" />
            FKs Compostas Anti Cross-Tenant (DEC-01)
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Tabelas pai declaram <code className="text-zinc-200">UNIQUE (company_id, id)</code>. Isso permite que{' '}
            <code className="text-zinc-200">tickets</code> valide{' '}
            <code className="text-indigo-300">FOREIGN KEY (company_id, category_id)</code> diretamente no motor C do PostgreSQL, tornando matematicamente impossível vincular dados de tenants distintos.
          </p>
        </div>

        <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-300">
            <HardDrive className="w-4 h-4 text-emerald-400" />
            MVCC, Dead Tuples & HOT Updates (Part X)
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            No PostgreSQL, todo <code className="text-zinc-200">UPDATE</code> gera uma nova versão física da linha (<code className="text-zinc-200">ctid</code>). Configurar{' '}
            <code className="text-emerald-300">WITH (fillfactor = 80)</code> em <code className="text-zinc-200">tickets</code> reserva 20% da página de 8KB para <strong>Heap-Only Tuple (HOT) Updates</strong> sem Write Amplification nos índices!
          </p>
        </div>

        <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-amber-300">
            <Lock className="w-4 h-4 text-amber-400" />
            Lock Atômico vs @Version Otimista
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Na criação do chamado, o sequencial por empresa usa lock pessimista curtíssimo via{' '}
            <code className="text-amber-300">UPSERT RETURNING last_number</code> em <code className="text-zinc-200">ticket_counters</code>. Já a edição do chamado usa lock otimista via <code className="text-zinc-200">@Version</code> (<code className="text-rose-300">409 Conflict</code>).
          </p>
        </div>
      </div>

      {/* 10 MVP Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {tables.map((t) => (
          <div
            key={t.name}
            className="rounded-xl bg-zinc-950 border border-zinc-800/90 p-4 flex flex-col justify-between gap-2 hover:border-indigo-500/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-sm font-semibold text-zinc-100">
                  {t.name}
                </span>
                <div className="font-mono text-[11px] text-indigo-400 mt-0.5">
                  {t.pk}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-300">
                {t.badge}
              </span>
            </div>

            <p className="text-xs text-zinc-400 font-mono leading-relaxed bg-zinc-900/60 border border-zinc-800/70 rounded p-2">
              {t.highlight}
            </p>

            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-1">
              <span className="flex items-center gap-1">
                <GitBranch className="w-3 h-3 text-zinc-600" />
                Escopo: {t.scope}
              </span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Registros ativos: {t.rows}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
