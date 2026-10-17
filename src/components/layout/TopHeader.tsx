import React from 'react';
import { List, MagnifyingGlass, PlusCircle } from '@phosphor-icons/react';
import { RolePill } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { RoleName } from '../../core/types/domain.types';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  activeRole: RoleName;
  onOpenMobileSidebar: () => void;
  onOpenCommandModal: () => void;
  onOpenNewTicket: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  activeRole,
  onOpenMobileSidebar,
  onOpenCommandModal,
  onOpenNewTicket,
}) => {
  return (
    <header className="h-14 glass-header px-4 lg:px-8 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-zinc-400 hover:text-white tactile-surface transition-colors cursor-pointer"
          title="Menu"
        >
          <List className="w-4 h-4" weight="bold" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="text-sm sm:text-base font-semibold text-zinc-100 truncate">
            {title}
          </h1>
          <span className="hidden md:inline-flex">
            <RolePill role={activeRole} />
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenCommandModal}
          className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl neumorphic-inset hover:border-white/15 text-xs text-zinc-400 hover:text-zinc-100 transition-all cursor-pointer"
        >
          <MagnifyingGlass className="w-3.5 h-3.5 text-zinc-400" weight="bold" />
          <span className="hidden md:inline">Buscar...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono tactile-surface rounded text-zinc-400">
            Ctrl+K
          </kbd>
        </button>

        {activeRole === 'EMPLOYEE' && (
          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-3.5 h-3.5" weight="fill" />}
            onClick={onOpenNewTicket}
          >
            <span>Novo Chamado</span>
          </Button>
        )}
      </div>
    </header>
  );
};


