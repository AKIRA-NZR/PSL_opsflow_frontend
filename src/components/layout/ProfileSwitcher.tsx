import React, { useState } from 'react';
import { Building2, Check, ChevronsUpDown, User as UserIcon } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { ROLE_LABELS } from '../../core/constants/ticket.constants';
import { getInitials } from '../../core/utils/date.utils';

interface ProfileSwitcherProps {
  collapsed: boolean;
}

export const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({ collapsed }) => {
  const {
    companies,
    activeCompany,
    currentUser,
    activeRole,
    tenantUsers,
    switchUserSession,
    switchCompanyTenant,
  } = useWorkspace();

  const [open, setOpen] = useState(false);

  const activeUsers = tenantUsers.filter((u) => u.active && !u.deletedAt);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#232936] transition-colors cursor-pointer text-left ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
        title={`${currentUser.name} (${ROLE_LABELS[activeRole]})`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-full bg-[#5865F2]/20 border border-[#5865F2]/40 text-[#A5B4FC] flex items-center justify-center text-xs font-semibold shrink-0">
            {getInitials(currentUser.name)}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-medium text-[#F1F5F9] truncate">
                {currentUser.name}
              </div>
              <div className="text-xs text-[#94A3B8] truncate">
                {ROLE_LABELS[activeRole]}
              </div>
            </div>
          )}
        </div>
        {!collapsed && (
          <ChevronsUpDown className="w-4 h-4 text-[#64748B] shrink-0" />
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute bottom-14 left-0 w-72 rounded-2xl bg-[#1B202B] border border-[#2A3140] shadow-2xl p-3 z-50 space-y-3">
            {/* Switch Member Persona */}
            <div>
              <div className="px-2 py-1 text-xs font-medium text-[#64748B] flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5" />
                Alternar conta na equipe
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
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#232936] text-[#F1F5F9] font-medium'
                          : 'text-[#94A3B8] hover:bg-[#232936] hover:text-[#F1F5F9]'
                      }`}
                    >
                      <div className="truncate pr-2 text-left">
                        <div className="text-sm text-[#F1F5F9] truncate">
                          {u.name}
                        </div>
                        <div className="text-xs text-[#64748B]">
                          {ROLE_LABELS[primaryRole]} · {u.department}
                        </div>
                      </div>
                      {isCurrent && (
                        <Check className="w-4 h-4 text-[#5865F2] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Switch Organization */}
            <div className="pt-2 border-t border-[#2A3140]">
              <div className="px-2 py-1 text-xs font-medium text-[#64748B] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                Alternar organização
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
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#232936] text-[#F1F5F9] font-medium'
                          : 'text-[#94A3B8] hover:bg-[#232936] hover:text-[#F1F5F9]'
                      }`}
                    >
                      <span>{c.name}</span>
                      {isCurrent && (
                        <Check className="w-4 h-4 text-[#5865F2] shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
