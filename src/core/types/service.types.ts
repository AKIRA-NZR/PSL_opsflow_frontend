import type { RoleName, TicketPriority, TicketStatus } from './domain.types';

export interface AppError {
  title: string;
  message: string;
  field?: string;
}

export type ServiceResult<T> =
  | { ok: true; data: T; message?: string }
  | { ok: false; error: AppError };

export interface ToastNotification {
  id: string;
  variant: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

export interface CreateTicketDTO {
  title: string;
  description: string;
  priority: TicketPriority;
  categoryId: string;
}

export interface CreateCategoryDTO {
  name: string;
  description: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  department: string;
  roles: RoleName[];
}

export type TicketScope = 'ALL' | 'ASSIGNED_TO_ME' | 'CREATED_BY_ME' | 'SLA_ATTENTION';

export interface TicketFilterState {
  scope: TicketScope;
  status: TicketStatus | 'ALL';
  priority: TicketPriority | 'ALL';
  search: string;
}

