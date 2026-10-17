import React from 'react';
import { List, MagnifyingGlass, PlusCircle } from '@phosphor-icons/react';
import { Button } from '../ui/Button';

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileSidebar: () => void;
  onOpenCommandModal: () => void;
  onOpenNewTicket: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  subtitle,
  onOpenMobileSidebar,
  onOpenCommandModal,
  onOpenNewTicket,
}) => {
  return (
    <header className="h-16 border-b border-[#2A3140] bg-[#13161C]/90 backdrop-blur-xs px-4 lg:px-8 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1B202B] transition-colors cursor-pointer"
          title="Abrir menu de navegação"
        >
          <List className="w-5 h-5" weight="bold" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-[#F1F5F9] truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden sm:block text-xs text-[#94A3B8] truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onOpenCommandModal}
          className="inline-flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#1B202B] hover:bg-[#232936] border border-[#2A3140] text-xs text-[#94A3B8] transition-colors cursor-pointer"
        >
          <MagnifyingGlass className="w-4 h-4 text-[#93C5FD]" weight="duotone" />
          <span className="hidden md:inline">Buscar chamado...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[11px] font-mono bg-[#13161C] border border-[#2A3140] rounded text-[#64748B]">
            Ctrl+K
          </kbd>
        </button>

        <Button
          variant="primary"
          size="md"
          icon={<PlusCircle className="w-4 h-4" weight="fill" />}
          onClick={onOpenNewTicket}
        >
          <span className="hidden sm:inline">Novo Chamado</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>
    </header>
  );
};
