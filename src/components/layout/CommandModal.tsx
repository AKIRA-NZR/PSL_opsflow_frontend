import React, { useEffect, useState } from 'react';
import { Search, Ticket as TicketIcon, X } from 'lucide-react';
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
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-start justify-center pt-20 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-[#1B202B] border border-[#2A3140] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#2A3140]">
          <Search className="w-4 h-4 text-[#94A3B8] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite o número ou título do chamado..."
            className="w-full bg-transparent text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-[#94A3B8] hover:text-[#F1F5F9] p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#64748B]">
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
                className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl hover:bg-[#232936] transition-colors cursor-pointer text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <TicketIcon className="w-4 h-4 text-[#64748B] shrink-0" />
                  <span className="font-mono text-xs text-[#93C5FD] shrink-0">
                    {formatTicketCode(t.number)}
                  </span>
                  <span className="text-sm text-[#F1F5F9] truncate">{t.title}</span>
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

