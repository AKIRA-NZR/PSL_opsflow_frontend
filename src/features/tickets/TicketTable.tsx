import React from 'react';
import { Inbox } from 'lucide-react';
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
      <div className="rounded-2xl bg-[#1B202B] border border-[#2A3140] py-16 px-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[#232936] flex items-center justify-center mx-auto text-[#64748B]">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-base font-medium text-[#F1F5F9] mt-4">
          Nenhum chamado encontrado
        </h3>
        <p className="text-sm text-[#94A3B8] mt-1 max-w-md mx-auto">
          Não há chamados correspondentes aos filtros selecionados no momento.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-[#1B202B] border border-[#2A3140] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#2A3140] bg-[#161A22]/60 text-xs font-medium text-[#94A3B8]">
              <th className="py-3.5 px-5 w-28">Código</th>
              <th className="py-3.5 px-5">Assunto</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5">Prioridade</th>
              <th className="py-3.5 px-5">Prazo de Atendimento</th>
              <th className="py-3.5 px-5">Responsável</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A3140]/70 text-sm">
            {tickets.map((t) => {
              const category = categories.find((c) => c.id === t.categoryId);
              const requester = users.find((u) => u.id === t.requesterId);
              const assignee = users.find((u) => u.id === t.assigneeId);
              const sla = evaluateTicketSla(t);

              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectTicket(t.id)}
                  className="hover:bg-[#232936]/75 transition-colors cursor-pointer group"
                >
                  <td className="py-4 px-5 font-mono text-xs font-medium text-[#93C5FD] whitespace-nowrap">
                    {formatTicketCode(t.number)}
                  </td>

                  <td className="py-4 px-5 min-w-[260px]">
                    <div className="font-medium text-[#F1F5F9] group-hover:text-white leading-snug">
                      {t.title}
                    </div>
                    <div className="text-xs text-[#94A3B8] mt-1 flex items-center gap-2">
                      <span>{category?.name || 'Geral'}</span>
                      <span>·</span>
                      <span>Solicitado por {requester?.name || 'Usuário'}</span>
                      <span>·</span>
                      <span>{formatDateTime(t.createdAt)}</span>
                    </div>
                  </td>

                  <td className="py-4 px-5 whitespace-nowrap">
                    <StatusBadge status={t.status} />
                  </td>

                  <td className="py-4 px-5 whitespace-nowrap">
                    <PriorityBadge priority={t.priority} />
                  </td>

                  <td className="py-4 px-5 whitespace-nowrap">
                    <SlaBadge health={sla.health} text={sla.badgeText} />
                  </td>

                  <td className="py-4 px-5 whitespace-nowrap">
                    {assignee ? (
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#232936] border border-[#2F3747] text-[#CBD5E1] flex items-center justify-center text-xs font-medium">
                          {getInitials(assignee.name)}
                        </div>
                        <span className="text-sm text-[#F1F5F9]">
                          {assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-[#64748B]">
                        Aguardando atribuição
                      </span>
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
