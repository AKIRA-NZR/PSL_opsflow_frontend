import React, { useState } from 'react';
import { UserMinus, UserPlus } from '@phosphor-icons/react';
import { RolePill } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ROLE_LABELS } from '../../core/constants/ticket.constants';
import type { RoleName } from '../../core/types/domain.types';
import { formatShortDate, getInitials } from '../../core/utils/date.utils';

export const TeamMembersPage: React.FC = () => {
  const {
    currentUser,
    activeRole,
    tenantUsers,
    createMember,
    deactivateMember,
  } = useWorkspace();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [roles, setRoles] = useState<RoleName[]>(['EMPLOYEE']);

  const toggleRole = (role: RoleName) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = createMember({ name, email, department, roles });
    if (ok) {
      setName('');
      setEmail('');
      setDepartment('');
      setRoles(['EMPLOYEE']);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#F4F7FB]">
            Membros da Equipe
          </h2>
          <p className="text-sm text-[#94A3B8] mt-0.5">
            Gerencie os colaboradores, técnicos e administradores com acesso à sua organização.
          </p>
        </div>

        {activeRole === 'ADMIN' && (
          <Button
            variant="primary"
            icon={<UserPlus className="w-4 h-4" weight="duotone" />}
            onClick={() => setIsModalOpen(true)}
          >
            Adicionar Membro
          </Button>
        )}
      </div>

      <div className="rounded-2xl glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-medium text-[#94A3B8]">
                <th className="py-3.5 px-5">Membro</th>
                <th className="py-3.5 px-5">Departamento</th>
                <th className="py-3.5 px-5">Perfis de Acesso</th>
                <th className="py-3.5 px-5">Situação</th>
                <th className="py-3.5 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-sm">
              {tenantUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full neumorphic-inset text-xs font-semibold text-[#F4F7FB] flex items-center justify-center shrink-0">
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <div className="font-medium text-[#F4F7FB]">
                          {u.name}
                        </div>
                        <div className="text-xs text-[#94A3B8]">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-5 text-[#CBD5E1]">{u.department}</td>

                  <td className="py-4 px-5">
                    <div className="flex flex-wrap gap-1.5">
                      {u.roles.map((r) => (
                        <RolePill key={r} role={r} />
                      ))}
                    </div>
                  </td>

                  <td className="py-4 px-5">
                    {u.active && !u.deletedAt ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6EE7B7]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] shadow-[0_0_8px_rgba(52,211,153,0.75)]" />
                        Ativo desde {formatShortDate(u.createdAt)}
                      </span>
                    ) : (
                      <span className="text-xs text-[#64748B]">Desativado</span>
                    )}
                  </td>

                  <td className="py-4 px-5 text-right">
                    {activeRole === 'ADMIN' &&
                      u.active &&
                      !u.deletedAt &&
                      u.id !== currentUser.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={<UserMinus className="w-3.5 h-3.5" weight="duotone" />}
                          onClick={() => deactivateMember(u.id)}
                        >
                          Desativar
                        </Button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Adicionar Membro à Equipe"
        subtitle="Cadastre um colaborador ou técnico e defina suas permissões de acesso."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F4F7FB] block">
              Nome completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Camila Santana"
              className="w-full rounded-xl neumorphic-inset px-3.5 py-2.5 text-sm text-[#F4F7FB] placeholder-[#64748B] focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#F4F7FB] block">
                E-mail corporativo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="camila@empresa.com"
                className="w-full rounded-xl neumorphic-inset px-3.5 py-2.5 text-sm text-[#F4F7FB] placeholder-[#64748B] focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#F4F7FB] block">
                Departamento
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ex.: Operações de TI"
                className="w-full rounded-xl neumorphic-inset px-3.5 py-2.5 text-sm text-[#F4F7FB] placeholder-[#64748B] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#F4F7FB] block">
              Perfis de permissão
            </label>
            <div className="flex flex-wrap gap-2">
              {(['EMPLOYEE', 'TECHNICIAN', 'ADMIN'] as RoleName[]).map((r) => {
                const selected = roles.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleRole(r)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      selected
                        ? 'tactile-surface text-[#F4F7FB] border-indigo-400/50 ring-2 ring-indigo-400/20'
                        : 'neumorphic-inset text-[#94A3B8] hover:text-[#F4F7FB]'
                    }`}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Salvar Membro
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};


