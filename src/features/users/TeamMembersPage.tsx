import React, { useState } from 'react';
import { UserMinus, UserPlus } from 'lucide-react';
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
          <h2 className="text-lg font-semibold text-[#F1F5F9]">
            Membros da Equipe
          </h2>
          <p className="text-sm text-[#94A3B8] mt-0.5">
            Gerencie os colaboradores, técnicos e administradores com acesso à sua organização.
          </p>
        </div>

        {activeRole === 'ADMIN' && (
          <Button
            variant="primary"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsModalOpen(true)}
          >
            Adicionar Membro
          </Button>
        )}
      </div>

      <div className="rounded-2xl bg-[#1B202B] border border-[#2A3140] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#2A3140] bg-[#161A22]/60 text-xs font-medium text-[#94A3B8]">
                <th className="py-3.5 px-5">Membro</th>
                <th className="py-3.5 px-5">Departamento</th>
                <th className="py-3.5 px-5">Perfis de Acesso</th>
                <th className="py-3.5 px-5">Situação</th>
                <th className="py-3.5 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A3140]/70 text-sm">
              {tenantUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#232936]/50 transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#232936] border border-[#2F3747] text-xs font-semibold text-[#F1F5F9] flex items-center justify-center shrink-0">
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <div className="font-medium text-[#F1F5F9]">
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
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
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
                          icon={<UserMinus className="w-3.5 h-3.5" />}
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
            <label className="text-xs font-medium text-[#F1F5F9] block">
              Nome completo
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Camila Santana"
              className="w-full rounded-xl bg-[#13161C] border border-[#2A3140] px-3.5 py-2.5 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#5865F2]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#F1F5F9] block">
                E-mail corporativo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="camila@empresa.com"
                className="w-full rounded-xl bg-[#13161C] border border-[#2A3140] px-3.5 py-2.5 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#5865F2]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#F1F5F9] block">
                Departamento
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ex.: Operações de TI"
                className="w-full rounded-xl bg-[#13161C] border border-[#2A3140] px-3.5 py-2.5 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#5865F2]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-[#F1F5F9] block">
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
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[#5865F2]/20 text-[#F1F5F9] border-[#5865F2]'
                        : 'bg-[#13161C] text-[#94A3B8] border-[#2A3140]'
                    }`}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#2A3140]">
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

