import {
  ALLOWED_STATUS_TRANSITIONS,
  PRIORITY_LABELS,
  SLA_HOURS_BY_PRIORITY,
  STATUS_LABELS,
} from '../core/constants/ticket.constants';
import type {
  RoleName,
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  User,
} from '../core/types/domain.types';
import type { CreateTicketDTO, ServiceResult } from '../core/types/service.types';

export function validateAndBuildTicket(params: {
  dto: CreateTicketDTO;
  companyId: string;
  requesterId: string;
  nextNumber: number;
  categories: TicketCategory[];
}): ServiceResult<Ticket> {
  const { dto, companyId, requesterId, nextNumber, categories } = params;

  const title = dto.title.trim();
  if (title.length < 5) {
    return {
      ok: false,
      error: {
        title: 'Assunto muito curto',
        message: 'Informe um título descritivo com pelo menos 5 caracteres.',
        field: 'title',
      },
    };
  }

  const category = categories.find(
    (c) => c.id === dto.categoryId && c.companyId === companyId
  );

  if (!category || !category.active || category.deletedAt) {
    return {
      ok: false,
      error: {
        title: 'Categoria indisponível',
        message: 'Escolha uma categoria ativa para registrar este chamado.',
        field: 'categoryId',
      },
    };
  }

  const nowIso = new Date().toISOString();
  const slaHours = SLA_HOURS_BY_PRIORITY[dto.priority];
  const dueIso = new Date(Date.now() + slaHours * 3600_000).toISOString();

  const ticket: Ticket = {
    id: `tkt-${crypto.randomUUID().slice(0, 8)}`,
    companyId,
    number: nextNumber,
    title,
    description: dto.description.trim() || 'Sem descrição complementar informada.',
    status: 'OPEN',
    priority: dto.priority,
    categoryId: category.id,
    requesterId,
    assigneeId: null,
    dueAt: dueIso,
    originalDueAt: dueIso,
    resolvedAt: null,
    closedAt: null,
    cancelledAt: null,
    resolutionSummary: null,
    version: 0,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  return {
    ok: true,
    data: ticket,
    message: `Chamado #${String(nextNumber).padStart(5, '0')} registrado com sucesso.`,
  };
}

export function validateStatusTransition(params: {
  ticket: Ticket;
  targetStatus: TicketStatus;
  actor: User;
  activeRole: RoleName;
  resolutionSummary?: string;
}): ServiceResult<{ updatedTicket: Ticket; historySummary: string; historyDetail?: string }> {
  const { ticket, targetStatus, actor, activeRole, resolutionSummary } = params;

  if (ticket.status === 'CLOSED' || ticket.status === 'CANCELLED') {
    return {
      ok: false,
      error: {
        title: 'Chamado já finalizado',
        message: 'Chamados concluídos ou cancelados não podem mais ser alterados.',
      },
    };
  }

  const allowed = ALLOWED_STATUS_TRANSITIONS[ticket.status];
  if (!allowed.includes(targetStatus)) {
    return {
      ok: false,
      error: {
        title: 'Ação não permitida nesta etapa',
        message: `Não é possível mudar diretamente de "${STATUS_LABELS[ticket.status]}" para "${STATUS_LABELS[targetStatus]}".`,
      },
    };
  }

  if (activeRole === 'EMPLOYEE') {
    const isOwner = ticket.requesterId === actor.id;
    const canEmployeeTransition =
      isOwner &&
      ((ticket.status === 'OPEN' && targetStatus === 'CANCELLED') ||
        (ticket.status === 'RESOLVED' &&
          (targetStatus === 'CLOSED' || targetStatus === 'IN_PROGRESS')));

    if (!canEmployeeTransition) {
      return {
        ok: false,
        error: {
          title: 'Permissão insuficiente',
          message:
            'Como solicitante, você pode cancelar chamados ainda abertos ou confirmar/reabrir chamados resolvidos.',
        },
      };
    }
  }

  if (targetStatus === 'IN_PROGRESS' && !ticket.assigneeId) {
    return {
      ok: false,
      error: {
        title: 'Responsável necessário',
        message: 'Atribua um técnico responsável antes de iniciar o atendimento.',
      },
    };
  }

  const cleanResolution = resolutionSummary?.trim() || ticket.resolutionSummary;
  if (targetStatus === 'RESOLVED' && (!cleanResolution || cleanResolution.length < 10)) {
    return {
      ok: false,
      error: {
        title: 'Descreva a solução aplicada',
        message: 'Informe um resumo da solução com pelo menos 10 caracteres para resolver o chamado.',
        field: 'resolutionSummary',
      },
    };
  }

  const nowIso = new Date().toISOString();
  const updatedTicket: Ticket = {
    ...ticket,
    status: targetStatus,
    resolutionSummary: targetStatus === 'RESOLVED' ? cleanResolution! : ticket.resolutionSummary,
    resolvedAt:
      targetStatus === 'RESOLVED'
        ? nowIso
        : targetStatus === 'IN_PROGRESS' && ticket.status === 'RESOLVED'
          ? null
          : ticket.resolvedAt,
    closedAt: targetStatus === 'CLOSED' ? nowIso : ticket.closedAt,
    cancelledAt: targetStatus === 'CANCELLED' ? nowIso : ticket.cancelledAt,
    version: ticket.version + 1,
    updatedAt: nowIso,
  };

  return {
    ok: true,
    data: {
      updatedTicket,
      historySummary: `Status alterado de ${STATUS_LABELS[ticket.status]} para ${STATUS_LABELS[targetStatus]}`,
      historyDetail:
        targetStatus === 'RESOLVED' ? `Solução: ${cleanResolution}` : undefined,
    },
    message: `Status atualizado para "${STATUS_LABELS[targetStatus]}".`,
  };
}

export function applyPriorityChange(
  ticket: Ticket,
  newPriority: TicketPriority,
  activeRole: RoleName
): ServiceResult<{ updatedTicket: Ticket; historySummary: string }> {
  if (activeRole === 'EMPLOYEE') {
    return {
      ok: false,
      error: {
        title: 'Acesso restrito',
        message: 'Apenas a equipe técnica pode reclassificar a prioridade do chamado.',
      },
    };
  }

  if (ticket.status === 'CLOSED' || ticket.status === 'CANCELLED') {
    return {
      ok: false,
      error: {
        title: 'Chamado finalizado',
        message: 'Não é possível alterar a prioridade de um chamado encerrado.',
      },
    };
  }

  const createdMs = new Date(ticket.createdAt).getTime();
  const slaHours = SLA_HOURS_BY_PRIORITY[newPriority];
  const newDueAt = new Date(createdMs + slaHours * 3600_000).toISOString();

  const updatedTicket: Ticket = {
    ...ticket,
    priority: newPriority,
    dueAt: newDueAt,
    version: ticket.version + 1,
    updatedAt: new Date().toISOString(),
  };

  return {
    ok: true,
    data: {
      updatedTicket,
      historySummary: `Prioridade alterada de ${PRIORITY_LABELS[ticket.priority]} para ${PRIORITY_LABELS[newPriority]}`,
    },
    message: `Prioridade atualizada para ${PRIORITY_LABELS[newPriority]}.`,
  };
}
