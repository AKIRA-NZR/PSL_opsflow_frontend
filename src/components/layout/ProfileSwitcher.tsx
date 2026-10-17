import React, { useState } from 'react';
import {
  Buildings,
  CaretUpDown,
  Check,
  SignOut,
  UserSwitch,
} from '@phosphor-icons/react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ROLE_LABELS } from '../../core/constants/ticket.constants';
import { getInitials } from '../../core/utils/date.utils';

interface ProfileSwitcherProps {
  collapsed: boolean;
}

export const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({
  collapsed,
}) => {
  const {
    companies,
    activeCompany,
    currentUser,
    activeRole,
    tenantUsers,
    switchUserSession,
    switchCompanyTenant,
    logout,
  } = useWorkspace();

  const [open, setOpen] = useState(false);

  const activeUsers = tenantUsers.filter((u) => u.active && !u.deletedAt);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center gap-3 p-2.5 rounded-xl tactile-surface transition-all cursor-pointer text-left ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
        title={`${currentUser.name} (${ROLE_LABELS[activeRole]})`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full neumorphic-inset text-[#C7D2FE] flex items-center justify-center text-xs font-semibold shrink-0">
            {getInitials(currentUser.name)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-medium text-[#F4F7FB] truncate">
                {currentUser.name}
              </div>
              <div className="text-xs text-[#94A3B8] truncate">
                {ROLE_LABELS[activeRole]}
              </div>
            </div>
          )}
        </div>
        {!collapsed && (
          <CaretUpDown className="w-4 h-4 text-[#94A3B8] shrink-0" />
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-16 left-0 w-72 rounded-2xl glass-popover p-3 z-50 space-y-3">
            {/* Switch Account quickly */}
            <div>
              <div className="px-2 py-1 text-xs font-medium text-[#64748B] flex items-center gap-1.5">
                <UserSwitch className="w-3.5 h-3.5" />
                Alternar perfil de teste
              </div>
              <div className="mt-1 space-y-0.5">
                {activeUsers.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  const primaryRole = u.roles.includes('ADMIN')
                    ? 'ADMIN'
                    : u.roles.includes('TECHNICIAN')
                      ? 'TECHNICIAN'
                      : 'EMPLOYEE';

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        switchUserSession(u.id);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-white/[0.08] text-[#F4F7FB] font-medium'
                          : 'text-[#94A3B8] hover:bg-white/[0.05] hover:text-[#F4F7FB]'
                      }`}
                    >
                      <div className="truncate pr-2 text-left">
                        <div className="text-sm text-[#F4F7FB] truncate">
                          {u.name}
                        </div>
                        <div className="text-xs text-[#94A3B8]">
                          {ROLE_LABELS[primaryRole]} · {u.department}
                        </div>
                      </div>
                      {isCurrent && (
                        <Check
                          className="w-4 h-4 text-[#A5B4FC] shrink-0"
                          weight="bold"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Switch Organization */}
            <div className="pt-2 border-t border-white/[0.07]">
              <div className="px-2 py-1 text-xs font-medium text-[#64748B] flex items-center gap-1.5">
                <Buildings className="w-3.5 h-3.5" />
                Organização
              </div>
              <div className="mt-1 space-y-0.5">
                {companies.map((c) => {
                  const isCurrent = c.id === activeCompany.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        switchCompanyTenant(c.id);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-white/[0.08] text-[#F4F7FB] font-medium'
                          : 'text-[#94A3B8] hover:bg-white/[0.05] hover:text-[#F4F7FB]'
                      }`}
                    >
                      <span>{c.name}</span>
                      {isCurrent && (
                        <Check
                          className="w-4 h-4 text-[#A5B4FC] shrink-0"
                          weight="bold"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Logout Button */}
            <div className="pt-2 border-t border-white/[0.07]">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-[#FECDD3] hover:bg-rose-500/15 transition-colors cursor-pointer"
              >
                <SignOut className="w-4 h-4" weight="bold" />
                Sair e voltar para a tela de Login
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

