import React, { useMemo, useState } from 'react';
import { MagnifyingGlass } from '@phosphor-icons/react';
import { formatTicketCode } from '@opsflow/domain';
import { Modal } from '@opsflow/ui';
import { PriorityBadge, StatusBadge } from '@entities/ticket';
import { useWorkspace } from '@entities/session';

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

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tenantTickets.slice(0, 6);
    return tenantTickets
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          formatTicketCode(t.number).toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [tenantTickets, query]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buscar Chamado">
      <div className="space-y-4">
        <div className="relative">
          <MagnifyingGlass
            className="w-4 h-4 text-[#8e9192] absolute left-3.5 top-1/2 -translate-y-1/2"
            weight="bold"
          />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Código (#00101) ou título..."
            className="w-full neumorphic-inset pl-10 pr-4 py-2.5 text-sm text-white placeholder-[#8e9192] focus:outline-none"
          />
        </div>

        <div className="divide-y divide-[#444748]/30 max-h-72 overflow-y-auto border border-[#444748]/35">
          {results.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8e9192]">
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
                className="w-full flex items-center justify-between gap-3 p-3 text-left bg-[#0e0e0e] hover:bg-[#1b1b1b] transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#8e9192]">
                      {formatTicketCode(t.number)}
                    </span>
                    <span className="text-sm font-medium text-white truncate">
                      {t.title}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={t.priority} />
                  <StatusBadge status={t.status} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

