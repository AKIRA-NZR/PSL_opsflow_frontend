import type { RoleName, TicketPriority, TicketStatus } from '../types/domain.types';

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em Atendimento',
  WAITING_USER: 'Aguardando',
  RESOLVED: 'Resolvido',
  CLOSED: 'Concluído',
  CANCELLED: 'Cancelado',
};

export const STATUS_ACTION_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Reabrir',
  IN_PROGRESS: 'Iniciar Atendimento',
  WAITING_USER: 'Aguardar Retorno',
  RESOLVED: 'Resolver Chamado',
  CLOSED: 'Concluir',
  CANCELLED: 'Cancelar',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  CRITICAL: 'Crítica',
};

export const ROLE_LABELS: Record<RoleName, string> = {
  ADMIN: 'Admin',
  TECHNICIAN: 'Técnico',
  EMPLOYEE: 'Colaborador',
};

export const SLA_HOURS_BY_PRIORITY: Record<TicketPriority, number> = {
  LOW: 72,
  MEDIUM: 24,
  HIGH: 8,
  CRITICAL: 4,
};

export const ALLOWED_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['WAITING_USER', 'RESOLVED', 'CANCELLED'],
  WAITING_USER: ['IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
  CANCELLED: [],
};
