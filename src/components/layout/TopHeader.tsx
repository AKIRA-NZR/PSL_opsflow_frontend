import React from 'react';
import { List, MagnifyingGlass, Plus } from '@phosphor-icons/react';
import type { RoleName } from '../../core/types/domain.types';
import { RolePill } from '../ui/Badge';
import { Button } from '../ui/Button';

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
    <header className="h-14 glass-header px-5 lg:px-8 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1.5 text-[#8e9192] hover:text-white border border-[#444748]/50 cursor-pointer"
          aria-label="Abrir menu"
        >
          <List className="w-4 h-4" weight="bold" />
        </button>

        <div className="flex items-center gap-3 min-w-0">
          <h1 className="text-sm font-mono uppercase tracking-[0.12em] text-white truncate">
            {title}
          </h1>
          <div className="hidden sm:block">
            <RolePill role={activeRole} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onOpenCommandModal}
          className="hidden md:flex items-center gap-2.5 px-3 py-1.5 bg-[#161616] border border-[#444748]/50 hover:border-[#8e9192] text-xs text-[#8e9192] hover:text-white transition-colors cursor-pointer"
        >
          <MagnifyingGlass className="w-3.5 h-3.5" weight="bold" />
          <span>Buscar...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-[#8e9192] bg-[#0e0e0e] border border-[#444748]/40">
            Ctrl K
          </kbd>
        </button>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" weight="bold" />}
          onClick={onOpenNewTicket}
        >
          Novo Chamado
        </Button>
      </div>
    </header>
  );
};
