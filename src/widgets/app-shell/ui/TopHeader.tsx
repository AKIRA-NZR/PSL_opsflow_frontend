import React from 'react';
import { List, MagnifyingGlass, Plus } from '@phosphor-icons/react';
import type { RoleName } from '@opsflow/domain';
import { Button } from '@opsflow/ui';

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

        <h1 className="text-sm font-mono uppercase tracking-[0.12em] text-white truncate">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onOpenCommandModal}
          className="p-2 bg-[#161616] border border-[#444748]/50 hover:border-[#8e9192] text-[#8e9192] hover:text-white transition-colors cursor-pointer"
          title="Buscar (Ctrl+K)"
        >
          <MagnifyingGlass className="w-4 h-4" weight="bold" />
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

