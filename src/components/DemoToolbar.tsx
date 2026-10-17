import React from 'react';
import { Building2, FlaskConical, ShieldAlert, UserCheck } from 'lucide-react';
import { useOpsFlow } from '../store/opsflow-engine';
import { RoleBadge } from './Badges';

interface DemoToolbarProps {
  onTestCrossTenantTicket: (foreignTicketId: string) => void;
}

/**
 * Interactive Portfolio Showcase Bar:
 * Allows recruiters and engineers to switch Tenants (`company_id`), switch RBAC Roles (`ADMIN`, `TECHNICIAN`, `EMPLOYEE`),
 * and trigger a Cross-Tenant BOLA/IDOR attempt (`T-01` -> HTTP 404 Not Found).
 */
export const DemoToolbar: React.FC<DemoToolbarProps> = ({ onTestCrossTenantTicket }) => {
  const {
    companies,
    activeCompany,
    currentUser,
    activeRole,
    tenantUsers,
    allTicketsUnfiltered,
    switchPersona,
    switchTenant,
    pushProblem,
  } = useOpsFlow();

  // Find a ticket belonging to ANOTHER company to demonstrate Anti-IDOR 404
  const foreignTicket = allTicketsUnfiltered.find(
    (t) => t.companyId !== activeCompany.id
  );

  const handleTriggerBolaTest = () => {
    if (!foreignTicket) return;
    pushProblem({
      type: 'https://opsflow.dev/problems/resource-not-found',
      title: 'Resource Not Found (Anti-IDOR / BOLA Protection)',
      status: 404,
      detail: `Tentativa de acesso ao chamado "${foreignTicket.id}" (#${String(foreignTicket.number).padStart(6, '0')}) pertencente a outro tenant bloqueada pela query WHERE company_id = :tenantId AND id = :id. Retornado 404 (e nunca 403) para impedir enumeração de UUIDs entre empresas!`,
      instance: `/api/v1/tickets/${foreignTicket.id}`,
      errorCode: 'TENANT_RESOURCE_NOT_FOUND',
      ruleRef: 'T-01 / RN-003',
    });
    onTestCrossTenantTicket(foreignTicket.id);
  };

  return (
    <div className="h-11 bg-zinc-950/95 border-t border-indigo-500/30 px-4 flex items-center justify-between text-xs select-none z-40 shrink-0">
      <div className="flex items-center gap-3 overflow-x-auto">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono font-semibold text-[11px] shrink-0">
          <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
          Architecture Lab
        </span>

        {/* Tenant Switcher */}
        <div className="flex items-center gap-1.5 text-zinc-400 shrink-0">
          <Building2 className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[11px] text-zinc-500">Tenant (`company_id`):</span>
          <div className="inline-flex rounded-md bg-zinc-900 p-0.5 border border-zinc-800">
            {companies.map((comp) => {
              const active = comp.id === activeCompany.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => switchTenant(comp.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {comp.name} ({comp.slug})
                </button>
              );
            })}
          </div>
        </div>

        <div className="h-4 w-[1px] bg-zinc-800 shrink-0" />

        {/* Persona / Role Switcher within current Tenant */}
        <div className="flex items-center gap-1.5 shrink-0">
          <UserCheck className="w-3.5 h-3.5 text-zinc-500" />
          <span className="text-[11px] text-zinc-500">Persona JWT:</span>
          <select
            value={currentUser.id}
            onChange={(e) => switchPersona(e.target.value)}
            className="bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-[11px] text-zinc-200 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            {tenantUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} [{u.roles.join(', ')}] {u.deletedAt ? '(LGPD Anonimizado)' : ''}
              </option>
            ))}
          </select>
          <RoleBadge role={activeRole} />
        </div>
      </div>

      {/* Anti-IDOR / BOLA Cross-Tenant Attack Simulator */}
      {foreignTicket && (
        <button
          onClick={handleTriggerBolaTest}
          className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono text-[11px] transition-colors cursor-pointer shrink-0"
          title="Simula requisição GET /api/v1/tickets/{id} para um chamado de outro Tenant (T-01 BOLA/IDOR)"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          Simular Ataque BOLA Cross-Tenant (#{String(foreignTicket.number).padStart(6, '0')})
        </button>
      )}
    </div>
  );
};
