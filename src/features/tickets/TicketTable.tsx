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
      <div className="rounded-2xl glass-panel py-14 px-6 text-center">
        <div className="w-11 h-11 rounded-2xl neumorphic-inset flex items-center justify-center mx-auto text-zinc-400">
          <Tray className="w-5 h-5" weight="duotone" />
        </div>
        <h3 className="text-sm font-medium text-zinc-200 mt-3">
          Nenhum chamado encontrado
        </h3>
      </div>
    );
  }

  return (
    <div className="rounded-2xl glass-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02] text-xs font-medium text-zinc-400">
              <th className="py-3 px-5 w-24">Código</th>
              <th className="py-3 px-5">Assunto</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5">Prioridade</th>
              <th className="py-3 px-5">SLA</th>
              <th className="py-3 px-5">Responsável</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06] text-sm">
            {tickets.map((t) => {
              const category = categories.find((c) => c.id === t.categoryId);
              const requester = users.find((u) => u.id === t.requesterId);
              const assignee = users.find((u) => u.id === t.assigneeId);
              const sla = evaluateTicketSla(t);

              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectTicket(t.id)}
                  className="hover:bg-white/[0.035] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-5 font-mono text-xs text-zinc-400 whitespace-nowrap">
                    {formatTicketCode(t.number)}
                  </td>

                  <td className="py-3.5 px-5 min-w-[240px]">
                    <div className="font-medium text-zinc-100 group-hover:text-white leading-snug">
                      {t.title}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5">
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
                        <div className="w-6 h-6 rounded-full neumorphic-inset text-zinc-300 flex items-center justify-center text-[11px] font-medium">
                          {getInitials(assignee.name)}
                        </div>
                        <span className="text-xs text-zinc-200">
                          {assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-500">Não atribuído</span>
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


