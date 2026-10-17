import React, { useEffect, useState } from 'react';
import { MagnifyingGlass, Ticket as TicketIcon, X } from '@phosphor-icons/react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatTicketCode } from '../../core/utils/date.utils';
import { StatusBadge } from '../ui/Badge';

interface CommandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTicket: (ticketId: string) => void;
}

export const CommandModal: React.FC<CommandModalProps> = ({
  isOpen,
  onClose,
  onSelectTicket,
}) => {
  const { tenantTickets } = useWorkspace();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const results = tenantTickets
    .filter(
      (t) =>
        !q ||
        t.title.toLowerCase().includes(q) ||
        formatTicketCode(t.number).toLowerCase().includes(q)
    )
    .slice(0, 6);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#06080D]/65 backdrop-blur-md flex items-start justify-center pt-20 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl glass-popover overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl neumorphic-inset">
            <MagnifyingGlass
              className="w-4 h-4 text-zinc-400 shrink-0"
              weight="bold"
            />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por código ou assunto..."
              className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-1 rounded-lg tactile-surface cursor-pointer"
            >
              <X className="w-3.5 h-3.5" weight="bold" />
            </button>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              Nenhum chamado encontrado.
            </div>
          ) : (
            results.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onSelectTicket(t.id);
                  onClose();
                }}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <TicketIcon
                    className="w-4 h-4 text-zinc-500 shrink-0"
                    weight="duotone"
                  />
                  <span className="font-mono text-xs text-zinc-400 shrink-0">
                    {formatTicketCode(t.number)}
                  </span>
                  <span className="text-sm text-zinc-100 truncate">{t.title}</span>
                </div>
                <div className="shrink-0">
                  <StatusBadge status={t.status} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};


