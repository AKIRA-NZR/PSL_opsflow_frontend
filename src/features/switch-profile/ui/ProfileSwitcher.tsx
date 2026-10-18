import React, { useState } from 'react';
import {
  Buildings,
  CaretUpDown,
  Check,
  SignOut,
  UserSwitch,
} from '@phosphor-icons/react';
import { getInitials, ROLE_LABELS } from '@opsflow/domain';
import { useWorkspace } from '@entities/session';

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
        className={`w-full flex items-center gap-2.5 p-2 bg-[#161616] border border-[#444748]/50 hover:border-[#8e9192] transition-colors cursor-pointer text-left ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
        title={`${currentUser.name} (${ROLE_LABELS[activeRole]})`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 bg-[#242424] border border-[#444748]/60 text-white flex items-center justify-center text-[11px] font-mono font-bold shrink-0">
            {getInitials(currentUser.name)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-xs font-medium text-white truncate">
                {currentUser.name}
              </div>
              <div className="font-mono text-[10px] text-[#8e9192] uppercase tracking-wider truncate">
                {ROLE_LABELS[activeRole]}
              </div>
            </div>
          )}
        </div>
        {!collapsed && (
          <CaretUpDown className="w-3.5 h-3.5 text-[#8e9192] shrink-0" />
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-14 left-0 w-64 bg-[#1b1b1b] border border-[#444748] shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-2 z-50 space-y-2">
            <div>
              <div className="px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#8e9192] flex items-center gap-1.5">
                <UserSwitch className="w-3.5 h-3.5" />
                ALTERNAR PERFIL
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
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#2a2a2a] text-white font-medium'
                          : 'text-[#c4c7c8] hover:bg-[#242424] hover:text-white'
                      }`}
                    >
                      <div className="truncate pr-2 text-left">
                        <div className="text-xs text-white truncate">
                          {u.name}
                        </div>
                        <div className="font-mono text-[10px] text-[#8e9192]">
                          {ROLE_LABELS[primaryRole]}
                        </div>
                      </div>
                      {isCurrent && (
                        <Check
                          className="w-3.5 h-3.5 text-white shrink-0"
                          weight="bold"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-[#444748]/40">
              <div className="px-2 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-[#8e9192] flex items-center gap-1.5">
                <Buildings className="w-3.5 h-3.5" />
                ORGANIZAÇÃO
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
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#2a2a2a] text-white font-medium'
                          : 'text-[#c4c7c8] hover:bg-[#242424] hover:text-white'
                      }`}
                    >
                      <span>{c.name}</span>
                      {isCurrent && (
                        <Check
                          className="w-3.5 h-3.5 text-white shrink-0"
                          weight="bold"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-[#444748]/40">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-[#fda4af] hover:bg-[#291518] transition-colors cursor-pointer"
              >
                <SignOut className="w-3.5 h-3.5" weight="bold" />
                Sair da conta
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
