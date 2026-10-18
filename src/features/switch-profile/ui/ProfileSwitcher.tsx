import React from 'react';
import { SignOut, User as UserIcon } from '@phosphor-icons/react';
import { ROLE_LABELS } from '@opsflow/domain';
import { BlurUpAvatar } from '@opsflow/ui';
import { useWorkspace } from '@entities/session';

interface ProfileSwitcherProps {
  collapsed: boolean;
  onNavigateProfile?: () => void;
}

export const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({
  collapsed,
  onNavigateProfile,
}) => {
  const { currentUser, activeRole, logout } = useWorkspace();

  return (
    <div className="relative group">
      <div
        className={`w-full flex items-center gap-2.5 p-2 bg-surface-recessed border border-[#444748]/50 hover:border-white/40 transition-colors ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        <button
          type="button"
          onClick={onNavigateProfile}
          className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer focus:outline-none"
          title={`${currentUser.name} (${ROLE_LABELS[activeRole]}) — Clique para abrir o Perfil`}
        >
          <BlurUpAvatar
            src={currentUser.avatarUrl}
            blurPlaceholder={currentUser.avatarBlurPlaceholder}
            name={currentUser.name}
            size="sm"
            showStatusIndicator
          />
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-content-primary truncate hover:text-white transition-colors">
                {currentUser.name}
              </div>
              <div className="font-mono text-[9px] text-content-muted uppercase tracking-wider truncate">
                {ROLE_LABELS[activeRole]}
              </div>
            </div>
          )}
        </button>

        {!collapsed && (
          <div className="flex items-center gap-1 shrink-0">
            {onNavigateProfile && (
              <button
                type="button"
                onClick={onNavigateProfile}
                className="p-1 text-content-muted hover:text-content-primary transition-colors cursor-pointer"
                title="Meu Perfil"
              >
                <UserIcon className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={logout}
              className="p-1 text-content-muted hover:text-status-coral transition-colors cursor-pointer"
              title="Sair da conta"
            >
              <SignOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
