/**
 * OpsFlow Domain & API Contracts (aligned with docs/OPSFLOW.md & docs/data-dictionary.md)
 */

export type RoleName = 'ADMIN' | 'TECHNICIAN' | 'EMPLOYEE';

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_USER'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type SlaState = 'ON_TIME' | 'AT_RISK' | 'BREACHED' | 'COMPLETED';

export type TicketEventType =
  | 'TICKET_CREATED'
  | 'STATUS_CHANGED'
  | 'PRIORITY_CHANGED'
  | 'ASSIGNEE_CHANGED'
  | 'CATEGORY_CHANGED'
  | 'COMMENT_ADDED';

/**
 * 1. companies (Root Tenant Aggregate)
 */
export interface Company {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 2 & 3. users + user_roles (Composite PK: company_id, id)
 */
export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  roles: RoleName[];
  active: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 4. refresh_tokens (Token Rotation + Reuse Detection Family)
 */
export interface RefreshTokenSession {
  id: string;
  userId: string;
  companyId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: string;
  revokedAt: string | null;
  replacedByTokenId: string | null;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

/**
 * 5. ticket_categories (Partial Unique Index on deleted_at IS NULL)
 */
export interface TicketCategory {
  id: string;
  companyId: string;
  name: string;
  description: string | null;
  active: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * 6. ticket_counters (Atomic per-tenant sequential counter)
 */
export interface TicketCounter {
  companyId: string;
  lastNumber: number;
  updatedAt: string;
}

/**
 * 7. tickets (Aggregate Root with @Version Optimistic Locking + Composite Tenant FKs)
 */
export interface Ticket {
  id: string;
  companyId: string;
  number: number; // Formatted as #000142 in UI
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  categoryId: string;
  requesterId: string;
  assigneeId: string | null;
  dueAt: string;
  originalDueAt: string; // DEC-06: Preserved when priority changes recalculate dueAt
  resolvedAt: string | null;
  closedAt: string | null;
  cancelledAt: string | null;
  resolutionSummary: string | null;
  version: number; // @Version for Optimistic Locking (409 Conflict)
  createdAt: string;
  updatedAt: string;
}

/**
 * 8. ticket_comments (Append-only with internal visibility RN-020)
 */
export interface TicketComment {
  id: string;
  companyId: string;
  ticketId: string;
  authorId: string;
  content: string;
  internal: boolean; // RN-020: Hidden from EMPLOYEE when true
  createdAt: string;
}

/**
 * 9. ticket_history (Append-only operational timeline)
 */
export interface TicketHistoryEntry {
  id: string;
  companyId: string;
  ticketId: string;
  actorId: string;
  eventType: TicketEventType;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  note: string | null;
  createdAt: string;
}

/**
 * 10. audit_logs (Append-only compliance & security trail with JSONB metadata)
 */
export interface AuditLogEntry {
  id: string;
  companyId: string;
  actorUserId: string | null;
  actorEmail: string | null;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  correlationId: string;
  createdAt: string;
}

/**
 * RFC 9457 Problem Details (application/problem+json)
 */
export interface ProblemFieldError {
  field: string;
  message: string;
  rejectedValue?: unknown;
}

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  timestamp: string;
  traceId: string;
  errorCode: string;
  ruleRef?: string;
  errors?: ProblemFieldError[];
}

/**
 * SLA Matrix (RN-018)
 */
export const SLA_HOURS_BY_PRIORITY: Record<TicketPriority, number> = {
  LOW: 72,
  MEDIUM: 24,
  HIGH: 8,
  CRITICAL: 4,
};

/**
 * Allowed State Machine Transitions (RN-012)
 */
export const ALLOWED_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  OPEN: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['WAITING_USER', 'RESOLVED', 'CANCELLED'],
  WAITING_USER: ['IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
  CANCELLED: [],
};
