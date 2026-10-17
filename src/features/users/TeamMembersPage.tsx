import React, { useState } from 'react';
import { UserMinus, UserPlus } from '@phosphor-icons/react';
import { RolePill } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ROLE_LABELS } from '../../core/constants/ticket.constants';
import type { RoleName } from '../../core/types/domain.types';
import { getInitials } from '../../core/utils/date.utils';

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
    <div className="max-w-6xl mx-auto space-y-5">
      {activeRole === 'ADMIN' && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="sm"
            icon={<UserPlus className="w-4 h-4" weight="duotone" />}
            onClick={() => setIsModalOpen(true)}
          >
            Novo Membro
          </Button>
        </div>
      )}

      <div className="rounded-2xl glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-medium text-zinc-400">
                <th className="py-3.5 px-5">Membro</th>
                <th className="py-3.5 px-5">Setor</th>
                <th className="py-3.5 px-5">Perfis</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-sm">
              {tenantUsers.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full neumorphic-inset text-xs font-semibold text-zinc-200 flex items-center justify-center shrink-0">
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <div className="font-medium text-zinc-100">
                          {u.name}
                        </div>
                        <div className="text-xs text-zinc-500">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 text-zinc-300">{u.department}</td>

                  <td className="py-3.5 px-5">
                    <div className="flex flex-wrap gap-1.5">
                      {u.roles.map((r) => (
                        <RolePill key={r} role={r} />
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-5">
                    {u.active && !u.deletedAt ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        Ativo
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500">Inativo</span>
                    )}
                  </td>

                  <td className="py-3.5 px-5 text-right">
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
        title="Novo Membro"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Nome
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Camila Santana"
              className="w-full rounded-xl neumorphic-inset px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="camila@empresa.com"
                className="w-full rounded-xl neumorphic-inset px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">
                Setor
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ex.: Operações de TI"
                className="w-full rounded-xl neumorphic-inset px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-300 block">
              Perfis
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
                        ? 'tactile-surface text-zinc-100 border-white/25 ring-1 ring-white/15'
                        : 'neumorphic-inset text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Salvar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
