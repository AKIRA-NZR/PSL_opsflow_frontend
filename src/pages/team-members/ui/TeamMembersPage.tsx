import React, { useState } from 'react';
import { UserMinus, UserPlus } from '@phosphor-icons/react';
import { getInitials, ROLE_LABELS, type RoleName } from '@opsflow/domain';
import { Button, Modal } from '@opsflow/ui';
import { RolePill } from '@entities/user';
import { useWorkspace } from '@entities/session';

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
            icon={<UserPlus className="w-4 h-4" weight="bold" />}
            onClick={() => setIsModalOpen(true)}
          >
            Novo Membro
          </Button>
        </div>
      )}

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#444748]/40 bg-[#0e0e0e] font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192]">
                <th className="py-3.5 px-5">MEMBRO</th>
                <th className="py-3.5 px-5">SETOR</th>
                <th className="py-3.5 px-5">PERFIS</th>
                <th className="py-3.5 px-5">STATUS</th>
                <th className="py-3.5 px-5 text-right">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#444748]/30 text-sm">
              {tenantUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#1c1c1c] transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#242424] border border-[#444748]/60 text-xs font-mono text-white flex items-center justify-center shrink-0">
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {u.name}
                        </div>
                        <div className="text-xs text-[#8e9192]">{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 text-[#c4c7c8]">{u.department}</td>

                  <td className="py-3.5 px-5">
                    <div className="flex flex-wrap gap-1.5">
                      {u.roles.map((r) => (
                        <RolePill key={r} role={r} />
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-5">
                    {u.active && !u.deletedAt ? (
                      <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#6ee7b7]">
                        <span className="w-1.5 h-1.5 bg-[#34d399]" />
                        Ativo
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-[#8e9192]">
                        Inativo
                      </span>
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
        title="Novo Membro"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192] block">
              NOME
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Camila Santana"
              className="w-full neumorphic-inset px-3.5 py-2.5 text-sm text-white placeholder-[#8e9192] focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192] block">
                E-MAIL
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="camila@empresa.com"
                className="w-full neumorphic-inset px-3.5 py-2.5 text-sm text-white placeholder-[#8e9192] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192] block">
                SETOR
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Ex.: Operações de TI"
                className="w-full neumorphic-inset px-3.5 py-2.5 text-sm text-white placeholder-[#8e9192] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192] block">
              PERFIS
            </label>
            <div className="flex flex-wrap gap-2">
              {(['EMPLOYEE', 'TECHNICIAN', 'ADMIN'] as RoleName[]).map((r) => {
                const selected = roles.includes(r);
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => toggleRole(r)}
                    className={`px-3.5 py-2 font-mono text-[10px] uppercase tracking-wider border transition-colors cursor-pointer ${
                      selected
                        ? 'bg-[#242424] text-white border-white'
                        : 'bg-[#0e0e0e] text-[#8e9192] border-[#444748]/45 hover:text-white'
                    }`}
                  >
                    {ROLE_LABELS[r]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#444748]/35">
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

