import type { SlaHealth, Ticket } from '../types/domain.types';

export interface SlaDescriptor {
  health: SlaHealth;
  badgeText: string;
  wasRecalculated: boolean;
}

export function evaluateTicketSla(ticket: Ticket): SlaDescriptor {
  const createdMs = new Date(ticket.createdAt).getTime();
  const dueMs = new Date(ticket.dueAt).getTime();
  const origDueMs = new Date(ticket.originalDueAt).getTime();
  const wasRecalculated = Math.abs(dueMs - origDueMs) > 60_000;

  const isCompleted =
    ticket.status === 'RESOLVED' ||
    ticket.status === 'CLOSED' ||
    ticket.status === 'CANCELLED';

  if (isCompleted) {
    const finishIso =
      ticket.resolvedAt || ticket.closedAt || ticket.cancelledAt || ticket.updatedAt;
    const finishMs = new Date(finishIso).getTime();
    const finishedLate = finishMs > dueMs;

    return {
      health: finishedLate ? 'BREACHED' : 'COMPLETED',
      badgeText: finishedLate ? 'Concluído com atraso' : 'Concluído no prazo',
      wasRecalculated,
    };
  }

  const nowMs = Date.now();
  const diffMs = dueMs - nowMs;
  const totalWindowMs = Math.max(1, dueMs - createdMs);
  const remainingRatio = diffMs / totalWindowMs;

  const totalMinutes = Math.round(Math.abs(diffMs) / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  if (diffMs < 0) {
    return {
      health: 'BREACHED',
      badgeText: `Atrasado há ${timeText}`,
      wasRecalculated,
    };
  }

  if (remainingRatio <= 0.25) {
    return {
      health: 'AT_RISK',
      badgeText: `Vence em ${timeText}`,
      wasRecalculated,
    };
  }

  return {
    health: 'ON_TIME',
    badgeText: `Restam ${timeText}`,
    wasRecalculated,
  };
}

