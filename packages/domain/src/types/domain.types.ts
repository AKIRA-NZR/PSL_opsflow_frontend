export type RoleName = 'ADMIN' | 'TECHNICIAN' | 'EMPLOYEE';

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_USER'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SlaHealth = 'ON_TIME' | 'AT_RISK' | 'BREACHED' | 'COMPLETED';

export interface Company {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  department: string;
  roles: RoleName[];
  active: boolean;
  avatarUrl?: string;
  avatarBlurPlaceholder?: string;
  deletedAt: string | null;
  createdAt: string;
}

export interface TicketCategory {
  id: string;
  companyId: string;
  name: string;
  description: string;
  active: boolean;
  deletedAt: string | null;
  createdAt: string;
}

export interface Ticket {
  id: string;
  companyId: string;
  number: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  categoryId: string;
  requesterId: string;
  assigneeId: string | null;
  dueAt: string;
  originalDueAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  cancelledAt: string | null;
  resolutionSummary: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface TicketComment {
  id: string;
  companyId: string;
  ticketId: string;
  authorId: string;
  content: string;
  internal: boolean;
  createdAt: string;
}

export interface TicketHistoryItem {
  id: string;
  companyId: string;
  ticketId: string;
  actorId: string;
  summary: string;
  detail?: string;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  companyId: string;
  actorName: string;
  actorEmail: string;
  actionLabel: string;
  targetLabel: string;
  detail: string;
  createdAt: string;
}

