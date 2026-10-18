import React, { useState } from 'react';
import { Buildings, Check, FloppyDisk, IdentificationCard, ShieldCheck } from '@phosphor-icons/react';
import { Button, DropdownSelect, type DropdownOption } from '@opsflow/ui';
import { RolePill } from '@entities/user';
import { useWorkspace } from '@entities/session';

export const ProfileDataSection: React.FC = () => {
  const {
    currentUser,
    companies,
    activeCompany,
    switchCompanyTenant,
    updateUserProfile,
  } = useWorkspace();

  const [name, setName] = useState(currentUser.name);
  const [department, setDepartment] = useState(currentUser.department);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = updateUserProfile({ name, department });
    if (ok) {
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2500);
    }
  };

  const companyOptions: DropdownOption<string>[] = companies.map((c) => ({
    value: c.id,
    label: c.name,
    icon: <Buildings className="w-4 h-4 text-status-sky" />,
  }));

  return (
    <div className="glass-panel p-6 sm:p-7 space-y-6">
      <div className="flex items-center justify-between border-b border-[#444748]/35 pb-4">
        <div className="flex items-center gap-2.5">
          <IdentificationCard className="w-5 h-5 text-status-sky" weight="duotone" />
          <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-[0.12em]">
            DADOS CADASTRAIS
          </h2>
        </div>
        <span className="font-mono text-[10px] text-content-muted">
          ID: {currentUser.id}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Nome */}
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-muted block">
              NOME COMPLETO
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full neumorphic-inset px-3.5 py-2.5 text-sm text-white placeholder-content-muted focus:outline-none transition-colors"
            />
          </div>

          {/* Setor */}
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-muted block">
              SETOR / DEPARTAMENTO
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Ex.: Engenharia de Plataforma"
              className="w-full neumorphic-inset px-3.5 py-2.5 text-sm text-white placeholder-content-muted focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* E-mail Corporativo (Read-only com selo SSO) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-muted block">
              E-MAIL CORPORATIVO
            </label>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-status-sage uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" weight="fill" />
              SSO / JWT Verificado
            </span>
          </div>
          <input
            type="email"
            disabled
            value={currentUser.email}
            className="w-full bg-surface-lowest text-content-muted border border-[#444748]/35 px-3.5 py-2.5 text-sm cursor-not-allowed select-none font-mono"
          />
          <span className="text-[11px] text-content-muted block">
            O endereço de e-mail institucional é gerenciado pelo Identity Provider da organização.
          </span>
        </div>

        {/* Roles / Perfis RBAC */}
        <div className="space-y-2 pt-2 border-t border-[#444748]/30">
          <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-muted block">
            PERFIS DE ACESSO (RBAC)
          </label>
          <div className="flex flex-wrap gap-2">
            {currentUser.roles.map((r) => (
              <RolePill key={r} role={r} />
            ))}
          </div>
        </div>

        {/* Organização Tenant */}
        <div className="space-y-2 pt-2 border-t border-[#444748]/30">
          <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-muted block">
            ORGANIZAÇÃO ATIVA (TENANT)
          </label>
          <div className="max-w-md">
            <DropdownSelect
              value={activeCompany.id}
              options={companyOptions}
              onChange={(val) => switchCompanyTenant(val)}
            />
          </div>
        </div>

        {/* Submit with Optimistic UI feedback */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#444748]/35">
          {isSavedRecently && (
            <span className="inline-flex items-center gap-1.5 text-xs text-status-sage font-mono animate-fade-in">
              <Check className="w-4 h-4" weight="bold" />
              Salvo no sistema!
            </span>
          )}
          <Button
            type="submit"
            variant="primary"
            icon={<FloppyDisk className="w-4 h-4" weight="bold" />}
          >
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
};

