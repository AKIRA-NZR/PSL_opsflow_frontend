import React from 'react';
import { Calendar, Clock, UserCheck } from 'lucide-react';
import { SlaBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  ALLOWED_STATUS_TRANSITIONS,
  STATUS_ACTION_LABELS,
} from '../../core/constants/ticket.constants';
import type {
  RoleName,
  Ticket,
  TicketPriority,
  TicketStatus,
  User,
} from '../../core/types/domain.types';
import { formatDateTime } from '../../core/utils/date.utils';
import { evaluateTicketSla } from '../../core/utils/sla.utils';

interface TicketActionPanelProps {
  ticket: Ticket;
  currentUser: User;
  activeRole: RoleName;
  technicians: User[];
  onTransitionStatus: (targetStatus: TicketStatus) => void;
  onAssign: (assigneeId: string | null) => void;
  onChangePriority: (priority: TicketPriority) => void;
}

export const TicketActionPanel: React.FC<TicketActionPanelProps> = ({
  ticket,
  currentUser,
  activeRole,
  technicians,
  onTransitionStatus,
  onAssign,
  onChangePriority,
}) => {
  const sla = evaluateTicketSla(ticket);
  const allowedNext = ALLOWED_STATUS_TRANSITIONS[ticket.status];
  const isTerminal =
    ticket.status === 'CLOSED' || ticket.status === 'CANCELLED';

  const canAssignToSelf =
    !isTerminal &&
    activeRole !== 'EMPLOYEE' &&
    ticket.assigneeId !== currentUser.id;

  return (
    <div className="space-y-5">
      {/* Card 1: Next Actions */}
      <div className="rounded-2xl bg-[#1B202B] border border-[#2A3140] p-5 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
          Andamento do Chamado
        </h3>

        {isTerminal ? (
          <p className="text-sm text-[#94A3B8] leading-relaxed">
            Este chamado já foi finalizado e encontra-se arquivado para consulta.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {allowedNext.map((nextStatus) => {
              const variant =
                nextStatus === 'RESOLVED' || nextStatus === 'CLOSED'
                  ? 'success'
                  : nextStatus === 'CANCELLED'
                    ? 'danger'
                    : 'primary';

              return (
                <Button
                  key={nextStatus}
                  variant={variant}
                  size="md"
                  className="w-full justify-center"
                  onClick={() => onTransitionStatus(nextStatus)}
                >
                  {STATUS_ACTION_LABELS[nextStatus]}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Card 2: Assignee */}
      <div className="rounded-2xl bg-[#1B202B] border border-[#2A3140] p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Responsável pelo Atendimento
          </h3>
          <UserCheck className="w-4 h-4 text-[#64748B]" />
        </div>

        <select
          disabled={isTerminal || activeRole === 'EMPLOYEE'}
          value={ticket.assigneeId || ''}
          onChange={(e) => onAssign(e.target.value || null)}
          className="w-full rounded-xl bg-[#13161C] border border-[#2A3140] px-3.5 py-2.5 text-sm text-[#F1F5F9] focus:outline-none focus:border-[#5865F2] disabled:opacity-55 cursor-pointer"
        >
          <option value="">Aguardando atribuição</option>
          {technicians.map((tech) => (
            <option key={tech.id} value={tech.id}>
              {tech.name} · {tech.department}
            </option>
          ))}
        </select>

        {canAssignToSelf && (
          <button
            type="button"
            onClick={() => onAssign(currentUser.id)}
            className="text-xs font-medium text-[#93C5FD] hover:text-white transition-colors cursor-pointer"
          >
            Assumir este atendimento →
          </button>
        )}
      </div>

      {/* Card 3: Priority & SLA Target */}
      <div className="rounded-2xl bg-[#1B202B] border border-[#2A3140] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
            Prioridade e Prazo (SLA)
          </h3>
          <Clock className="w-4 h-4 text-[#64748B]" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-[#94A3B8] block">
            Nível de prioridade
          </label>
          <select
            disabled={isTerminal || activeRole === 'EMPLOYEE'}
            value={ticket.priority}
            onChange={(e) =>
              onChangePriority(e.target.value as TicketPriority)
            }
            className="w-full rounded-xl bg-[#13161C] border border-[#2A3140] px-3.5 py-2.5 text-sm text-[#F1F5F9] focus:outline-none focus:border-[#5865F2] disabled:opacity-55 cursor-pointer"
          >
            <option value="LOW">Baixa (Meta: 72 horas)</option>
            <option value="MEDIUM">Média (Meta: 24 horas)</option>
            <option value="HIGH">Alta (Meta: 8 horas)</option>
            <option value="CRITICAL">Crítica (Meta: 4 horas)</option>
          </select>
        </div>

        <div className="rounded-xl bg-[#13161C] border border-[#2A3140] p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#94A3B8]">Situação do prazo</span>
            <SlaBadge health={sla.health} text={sla.badgeText} />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#2A3140]/70">
            <span className="text-[#94A3B8] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
              Prazo limite
            </span>
            <span className="text-[#F1F5F9] font-medium">
              {formatDateTime(ticket.dueAt)}
            </span>
          </div>

          {sla.wasRecalculated && (
            <div className="flex items-center justify-between text-[#64748B]">
              <span>Meta inicial de abertura</span>
              <span>{formatDateTime(ticket.originalDueAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
