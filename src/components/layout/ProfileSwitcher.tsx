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
        className={`w-full flex items-center gap-2.5 p-2 rounded-xl tactile-surface transition-all cursor-pointer text-left ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
        title={`${currentUser.name} (${ROLE_LABELS[activeRole]})`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full neumorphic-inset text-zinc-200 flex items-center justify-center text-xs font-semibold shrink-0">
            {getInitials(currentUser.name)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-xs font-medium text-zinc-100 truncate">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-zinc-400 truncate">
                {ROLE_LABELS[activeRole]}
              </div>
            </div>
          )}
        </div>
        {!collapsed && (
          <CaretUpDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-14 left-0 w-64 rounded-2xl glass-popover p-2.5 z-50 space-y-2.5">
            <div>
              <div className="px-2 py-1 text-[11px] font-medium text-zinc-500 flex items-center gap-1.5">
                <UserSwitch className="w-3.5 h-3.5" />
                Alternar perfil
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
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-white/[0.09] text-white font-medium'
                          : 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100'
                      }`}
                    >
                      <div className="truncate pr-2 text-left">
                        <div className="text-xs text-zinc-100 truncate">
                          {u.name}
                        </div>
                        <div className="text-[11px] text-zinc-500">
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

            <div className="pt-2 border-t border-white/[0.06]">
              <div className="px-2 py-1 text-[11px] font-medium text-zinc-500 flex items-center gap-1.5">
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
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-white/[0.09] text-white font-medium'
                          : 'text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100'
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

            <div className="pt-2 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer"
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

