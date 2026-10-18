import React from 'react';
import { Tray } from '@phosphor-icons/react';
import {
  PriorityBadge,
  SlaBadge,
  StatusBadge,
} from '../../components/ui/Badge';
import type {
  Ticket,
  TicketCategory,
  User,
} from '../../core/types/domain.types';
import {
  formatDateTime,
  formatTicketCode,
  getInitials,
} from '../../core/utils/date.utils';
import { evaluateTicketSla } from '../../core/utils/sla.utils';

interface TicketTableProps {
  tickets: Ticket[];
  categories: TicketCategory[];
  users: User[];
  onSelectTicket: (ticketId: string) => void;
}

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  categories,
  users,
  onSelectTicket,
}) => {
  if (tickets.length === 0) {
    return (
      <div className="glass-panel py-14 px-6 text-center">
        <div className="w-10 h-10 neumorphic-inset flex items-center justify-center mx-auto text-[#8e9192]">
          <Tray className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-medium text-[#c4c7c8] mt-3">
          Nenhum chamado encontrado
        </h3>
      </div>
    );
  }

  return (
    <div className="relative z-10 glass-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#444748]/40 bg-[#0e0e0e] font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192]">
              <th className="py-3.5 px-5 w-24">CÓDIGO</th>
              <th className="py-3.5 px-5">ASSUNTO</th>
              <th className="py-3.5 px-5">STATUS</th>
              <th className="py-3.5 px-5">PRIORIDADE</th>
              <th className="py-3.5 px-5">SLA</th>
              <th className="py-3.5 px-5">RESPONSÁVEL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#444748]/30 text-sm">
            {tickets.map((t) => {
              const category = categories.find((c) => c.id === t.categoryId);
              const requester = users.find((u) => u.id === t.requesterId);
              const assignee = users.find((u) => u.id === t.assigneeId);
              const sla = evaluateTicketSla(t);

              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectTicket(t.id)}
                  className="hover:bg-[#1c1c1c] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-5 font-mono text-xs text-[#8e9192] whitespace-nowrap">
                    {formatTicketCode(t.number)}
                  </td>

                  <td className="py-3.5 px-5 min-w-[240px]">
                    <div className="font-medium text-white leading-snug">
                      {t.title}
                    </div>
                    <div className="text-xs text-[#8e9192] mt-0.5 flex items-center gap-1.5">
                      <span>{category?.name || 'Geral'}</span>
                      <span>·</span>
                      <span>{requester?.name || 'Usuário'}</span>
                      <span>·</span>
                      <span>{formatDateTime(t.createdAt)}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <StatusBadge status={t.status} />
                  </td>

                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <PriorityBadge priority={t.priority} />
                  </td>

                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <SlaBadge health={sla.health} text={sla.badgeText} />
                  </td>

                  <td className="py-3.5 px-5 whitespace-nowrap">
                    {assignee ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#242424] border border-[#444748]/60 text-white flex items-center justify-center text-[10px] font-mono">
                          {getInitials(assignee.name)}
                        </div>
                        <span className="text-xs text-[#e2e2e2]">
                          {assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#8e9192]">Não atribuído</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
