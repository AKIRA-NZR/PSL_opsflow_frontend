import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import {
  ALLOWED_TRANSITIONS,
  SLA_HOURS_BY_PRIORITY,
  type AuditLogEntry,
  type Company,
  type ProblemDetail,
  type RefreshTokenSession,
  type RoleName,
  type SlaState,
  type Ticket,
  type TicketCategory,
  type TicketComment,
  type TicketCounter,
  type TicketHistoryEntry,
  type TicketPriority,
  type TicketStatus,
  type User,
} from '../types/opsflow';

/**
 * Initial Seed Data representing 2 isolated Multi-Tenant organizations (Acme Corp & Globex Logistics)
 * across all 10 MVP PostgreSQL tables.
 */
const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();
const hoursFromNow = (h: number) => new Date(now + h * 3600_000).toISOString();

const INITIAL_COMPANIES: Company[] = [
  {
    id: 'comp-acme-001',
    name: 'Acme Cloud Solutions',
    slug: 'acme-cloud',
    active: true,
    createdAt: hoursAgo(720),
    updatedAt: hoursAgo(24),
  },
  {
    id: 'comp-globex-002',
    name: 'Globex FinTech S.A.',
    slug: 'globex-fintech',
    active: true,
    createdAt: hoursAgo(480),
    updatedAt: hoursAgo(12),
  },
];

const INITIAL_USERS: User[] = [
  // Tenant A: Acme Cloud Solutions
  {
    id: 'usr-acme-admin',
    companyId: 'comp-acme-001',
    name: 'Kauã Almeida',
    email: 'kaua.admin@acme.io',
    roles: ['ADMIN', 'TECHNICIAN'],
    active: true,
    deletedAt: null,
    createdAt: hoursAgo(720),
    updatedAt: hoursAgo(48),
  },
  {
    id: 'usr-acme-tech1',
    companyId: 'comp-acme-001',
    name: 'Marina Costa (SRE)',
    email: 'marina.sre@acme.io',
    roles: ['TECHNICIAN'],
    active: true,
    deletedAt: null,
    createdAt: hoursAgo(650),
    updatedAt: hoursAgo(20),
  },
  {
    id: 'usr-acme-tech2',
    companyId: 'comp-acme-001',
    name: 'Lucas Ferreira (NetOps)',
    email: 'lucas.netops@acme.io',
    roles: ['TECHNICIAN'],
    active: true,
    deletedAt: null,
    createdAt: hoursAgo(500),
    updatedAt: hoursAgo(15),
  },
  {
    id: 'usr-acme-emp1',
    companyId: 'comp-acme-001',
    name: 'Beatriz Ribeiro (Financeiro)',
    email: 'beatriz.fin@acme.io',
    roles: ['EMPLOYEE'],
    active: true,
    deletedAt: null,
    createdAt: hoursAgo(400),
    updatedAt: hoursAgo(10),
  },
  {
    id: 'usr-acme-emp2',
    companyId: 'comp-acme-001',
    name: 'Rafael Mendes (Comercial)',
    email: 'rafael.sales@acme.io',
    roles: ['EMPLOYEE'],
    active: true,
    deletedAt: null,
    createdAt: hoursAgo(320),
    updatedAt: hoursAgo(5),
  },

  // Tenant B: Globex FinTech S.A. (Isolated Tenant for BOLA/IDOR Testing)
  {
    id: 'usr-globex-admin',
    companyId: 'comp-globex-002',
    name: 'Helena Vance (CTO Globex)',
    email: 'helena@globex.com',
    roles: ['ADMIN', 'TECHNICIAN'],
    active: true,
    deletedAt: null,
    createdAt: hoursAgo(480),
    updatedAt: hoursAgo(12),
  },
  {
    id: 'usr-globex-emp1',
    companyId: 'comp-globex-002',
    name: 'Carlos Eduardo (Compliance)',
    email: 'carlos@globex.com',
    roles: ['EMPLOYEE'],
    active: true,
    deletedAt: null,
    createdAt: hoursAgo(300),
    updatedAt: hoursAgo(8),
  },
];

const INITIAL_CATEGORIES: TicketCategory[] = [
  {
    id: 'cat-acme-infra',
    companyId: 'comp-acme-001',
    name: 'Infraestrutura & Cloud',
    description: 'Servidores AWS, Kubernetes, VPN, DNS e banco de dados PostgreSQL',
    active: true,
    deletedAt: null,
    createdAt: hoursAgo(700),
    updatedAt: hoursAgo(100),
  },
  {
    id: 'cat-acme-sec',
    companyId: 'comp-acme-001',
    name: 'Acesso & Segurança (IAM)',
    description: 'Provisionamento de credenciais, MFA, RBAC, SSO e VPN corporativa',
    active: true,
    deletedAt: null,
    createdAt: hoursAgo(700),
    updatedAt: hoursAgo(80),
  },
  {
    id: 'cat-acme-hw',
    companyId: 'comp-acme-001',
    name: 'Hardware & Estações',
    description: 'MacBooks, monitores Dell, periféricos e manutenção física',
    active: true,
    deletedAt: null,
    createdAt: hoursAgo(680),
    updatedAt: hoursAgo(60),
  },
  {
    id: 'cat-acme-erp',
    companyId: 'comp-acme-001',
    name: 'Sistemas Internos & ERP',
    description: 'Integrações de faturamento, relatórios contábeis e webhooks',
    active: true,
    deletedAt: null,
    createdAt: hoursAgo(640),
    updatedAt: hoursAgo(40),
  },
  {
    id: 'cat-acme-legacy',
    companyId: 'comp-acme-001',
    name: 'Telefonia PABX Legada',
    description: 'Categoria descontinuada mantida via Soft Delete (RN-010)',
    active: false,
    deletedAt: hoursAgo(120),
    createdAt: hoursAgo(700),
    updatedAt: hoursAgo(120),
  },
  // Globex Categories
  {
    id: 'cat-globex-core',
    companyId: 'comp-globex-002',
    name: 'Core Banking & PIX',
    description: 'Liquidação SPB, mensageria ISO-20022 e conciliação',
    active: true,
    deletedAt: null,
    createdAt: hoursAgo(480),
    updatedAt: hoursAgo(24),
  },
];

const INITIAL_COUNTERS: TicketCounter[] = [
  { companyId: 'comp-acme-001', lastNumber: 145, updatedAt: hoursAgo(1) },
  { companyId: 'comp-globex-002', lastNumber: 42, updatedAt: hoursAgo(3) },
];

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'tkt-acme-145',
    companyId: 'comp-acme-001',
    number: 145,
    title: 'Pool HikariCP exaurindo conexões no cluster PostgreSQL primário',
    description:
      'Durante o fechamento de folha às 14h, observamos picos de `SQLTransientConnectionException: HikariPool-1 - Connection is not available, request timed out after 30000ms`.\n\nSuspeitamos de transação longa segurando lock em `tickets` ou ausência de índice composto `(company_id, status, created_at DESC)`.',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    categoryId: 'cat-acme-infra',
    requesterId: 'usr-acme-emp1',
    assigneeId: 'usr-acme-tech1',
    dueAt: hoursFromNow(1.2), // At risk (< 25% of 4h window remaining)
    originalDueAt: hoursFromNow(21.2), // Originally MEDIUM (24h), upgraded to CRITICAL (4h)
    resolvedAt: null,
    closedAt: null,
    cancelledAt: null,
    resolutionSummary: null,
    version: 3,
    createdAt: hoursAgo(2.8),
    updatedAt: hoursAgo(0.4),
  },
  {
    id: 'tkt-acme-144',
    companyId: 'comp-acme-001',
    number: 144,
    title: 'Revogação emergencial de credenciais VPN e rotação de chaves SSH',
    description:
      'Solicito revisão das permissões de acesso ao ambiente de staging e emissão de novo certificado OpenVPN para a equipe financeira após troca de notebook corporativo.',
    status: 'OPEN',
    priority: 'HIGH',
    categoryId: 'cat-acme-sec',
    requesterId: 'usr-acme-emp1',
    assigneeId: null,
    dueAt: hoursAgo(1.5), // SLA Breached!
    originalDueAt: hoursAgo(1.5),
    resolvedAt: null,
    closedAt: null,
    cancelledAt: null,
    resolutionSummary: null,
    version: 0,
    createdAt: hoursAgo(9.5),
    updatedAt: hoursAgo(9.5),
  },
  {
    id: 'tkt-acme-143',
    companyId: 'comp-acme-001',
    number: 143,
    title: 'Divergência no webhook de conciliação de notas fiscais (Erro 422)',
    description:
      'O integrador do ERP está recebendo `422 Unprocessable Content` ao enviar lotes com mais de 50 RPS. Precisamos validar os limites do Bucket4j e o payload enviado.',
    status: 'WAITING_USER',
    priority: 'MEDIUM',
    categoryId: 'cat-acme-erp',
    requesterId: 'usr-acme-emp2',
    assigneeId: 'usr-acme-tech2',
    dueAt: hoursFromNow(14),
    originalDueAt: hoursFromNow(14),
    resolvedAt: null,
    closedAt: null,
    cancelledAt: null,
    resolutionSummary: null,
    version: 2,
    createdAt: hoursAgo(10),
    updatedAt: hoursAgo(2),
  },
  {
    id: 'tkt-acme-142',
    companyId: 'comp-acme-001',
    number: 142,
    title: 'Provisionamento de MacBook Pro M3 para novo engenheiro backend',
    description:
      'Configurar perfil MDM, criptografia FileVault, Docker Desktop, IntelliJ IDEA Ultimate e acesso ao repositório `PSL_opsflow_backend`.',
    status: 'RESOLVED',
    priority: 'LOW',
    categoryId: 'cat-acme-hw',
    requesterId: 'usr-acme-emp2',
    assigneeId: 'usr-acme-tech1',
    dueAt: hoursFromNow(40),
    originalDueAt: hoursFromNow(40),
    resolvedAt: hoursAgo(3),
    closedAt: null,
    cancelledAt: null,
    resolutionSummary:
      'Estação configurada com perfil MDM corporativo, FileVault ativo e chaves GPG/SSH registradas. Entregue mediante termo assinado.',
    version: 4,
    createdAt: hoursAgo(32),
    updatedAt: hoursAgo(3),
  },
  {
    id: 'tkt-acme-141',
    companyId: 'comp-acme-001',
    number: 141,
    title: 'Migração de DNS interno para Route53 Private Hosted Zone',
    description:
      'Consolidar zonas privadas do cluster de homologação com TTL de 60s e health checks automáticos.',
    status: 'CLOSED',
    priority: 'MEDIUM',
    categoryId: 'cat-acme-infra',
    requesterId: 'usr-acme-admin',
    assigneeId: 'usr-acme-tech2',
    dueAt: hoursAgo(24),
    originalDueAt: hoursAgo(24),
    resolvedAt: hoursAgo(30),
    closedAt: hoursAgo(26),
    cancelledAt: null,
    resolutionSummary:
      'Zonas migradas via Terraform sem downtime. Propagação validada em todas as VPCs.',
    version: 5,
    createdAt: hoursAgo(48),
    updatedAt: hoursAgo(26),
  },
  // Tenant B Ticket (Globex FinTech) — Used to demonstrate Cross-Tenant 404 Isolation
  {
    id: 'tkt-globex-042',
    companyId: 'comp-globex-002',
    number: 42,
    title: 'Latência acima de 800ms na fila de liquidação PIX Bacen (SPI)',
    description:
      'Monitoramento Prometheus disparou alerta de p99 elevado no consumidor Kafka de liquidação interbancária.',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    categoryId: 'cat-globex-core',
    requesterId: 'usr-globex-emp1',
    assigneeId: 'usr-globex-admin',
    dueAt: hoursFromNow(2.5),
    originalDueAt: hoursFromNow(2.5),
    resolvedAt: null,
    closedAt: null,
    cancelledAt: null,
    resolutionSummary: null,
    version: 1,
    createdAt: hoursAgo(1.5),
    updatedAt: hoursAgo(0.8),
  },
];

const INITIAL_COMMENTS: TicketComment[] = [
  {
    id: 'cmt-1',
    companyId: 'comp-acme-001',
    ticketId: 'tkt-acme-145',
    authorId: 'usr-acme-emp1',
    content:
      'Pessoal, o painel de faturamento travou duas vezes agora à tarde. Segue o traceId do erro: `9f8b2a1c4d7e6012`.',
    internal: false,
    createdAt: hoursAgo(2.6),
  },
  {
    id: 'cmt-2',
    companyId: 'comp-acme-001',
    ticketId: 'tkt-acme-145',
    authorId: 'usr-acme-tech1',
    content:
      '[NOTA INTERNA SRE] Analisando `pg_stat_activity`: encontrei 14 sessões em `idle in transaction` originadas do worker legado. Além disso, ativei `fillfactor = 80` na tabela `tickets` para habilitar HOT Updates no PostgreSQL 17.',
    internal: true, // RN-020: Must NEVER be visible when current user is EMPLOYEE!
    createdAt: hoursAgo(1.8),
  },
  {
    id: 'cmt-3',
    companyId: 'comp-acme-001',
    ticketId: 'tkt-acme-145',
    authorId: 'usr-acme-tech1',
    content:
      'Beatriz, identificamos a causa raiz no pool de conexões e já aplicamos o ajuste de timeout. Estamos monitorando a estabilidade pelos próximos 30 minutos.',
    internal: false,
    createdAt: hoursAgo(0.5),
  },
  {
    id: 'cmt-4',
    companyId: 'comp-acme-001',
    ticketId: 'tkt-acme-143',
    authorId: 'usr-acme-tech2',
    content:
      'Rafael, poderia anexar o JSON de exemplo que falhou no lote das 11h? Precisamos validar o campo `company_id` no payload.',
    internal: false,
    createdAt: hoursAgo(2),
  },
];

const INITIAL_HISTORY: TicketHistoryEntry[] = [
  {
    id: 'hist-1',
    companyId: 'comp-acme-001',
    ticketId: 'tkt-acme-145',
    actorId: 'usr-acme-emp1',
    eventType: 'TICKET_CREATED',
    fieldName: 'status',
    oldValue: null,
    newValue: 'OPEN',
    note: 'Chamado aberto com prioridade inicial MEDIUM (SLA 24h)',
    createdAt: hoursAgo(2.8),
  },
  {
    id: 'hist-2',
    companyId: 'comp-acme-001',
    ticketId: 'tkt-acme-145',
    actorId: 'usr-acme-tech1',
    eventType: 'ASSIGNEE_CHANGED',
    fieldName: 'assignee_id',
    oldValue: null,
    newValue: 'Marina Costa (SRE)',
    note: 'Atribuição técnica assumida pela fila SRE',
    createdAt: hoursAgo(2.4),
  },
  {
    id: 'hist-3',
    companyId: 'comp-acme-001',
    ticketId: 'tkt-acme-145',
    actorId: 'usr-acme-tech1',
    eventType: 'STATUS_CHANGED',
    fieldName: 'status',
    oldValue: 'OPEN',
    newValue: 'IN_PROGRESS',
    note: 'Iniciado diagnóstico no cluster PostgreSQL',
    createdAt: hoursAgo(2.3),
  },
  {
    id: 'hist-4',
    companyId: 'comp-acme-001',
    ticketId: 'tkt-acme-145',
    actorId: 'usr-acme-admin',
    eventType: 'PRIORITY_CHANGED',
    fieldName: 'priority',
    oldValue: 'MEDIUM',
    newValue: 'CRITICAL',
    note: 'DEC-06: due_at recalculado a partir de created_at (+4h); original_due_at preservado',
    createdAt: hoursAgo(1.2),
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-1',
    companyId: 'comp-acme-001',
    actorUserId: 'usr-acme-admin',
    actorEmail: 'kaua.admin@acme.io',
    action: 'TENANT_ONBOARDED',
    resourceType: 'COMPANY',
    resourceId: 'comp-acme-001',
    metadata: {
      slug: 'acme-cloud',
      atomicOnboarding: true,
      initialCounterSeeded: 0,
    },
    ipAddress: '189.40.112.84',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36',
    correlationId: '4f91a2c8-011b-4e92-887a-12d8301bc901',
    createdAt: hoursAgo(720),
  },
  {
    id: 'aud-2',
    companyId: 'comp-acme-001',
    actorUserId: 'usr-acme-admin',
    actorEmail: 'kaua.admin@acme.io',
    action: 'CATEGORY_SOFT_DELETED',
    resourceType: 'TICKET_CATEGORY',
    resourceId: 'cat-acme-legacy',
    metadata: {
      categoryName: 'Telefonia PABX Legada',
      rule: 'RN-010',
      partialUniqueIndexReleased: true,
    },
    ipAddress: '189.40.112.84',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36',
    correlationId: '7b31e0a4-921c-4d11-a014-88219f01aa22',
    createdAt: hoursAgo(120),
  },
  {
    id: 'aud-3',
    companyId: 'comp-acme-001',
    actorUserId: 'usr-acme-admin',
    actorEmail: 'kaua.admin@acme.io',
    action: 'TICKET_PRIORITY_ESCALATED',
    resourceType: 'TICKET',
    resourceId: 'tkt-acme-145',
    metadata: {
      ticketNumber: 145,
      oldPriority: 'MEDIUM',
      newPriority: 'CRITICAL',
      decisionRef: 'DEC-06',
    },
    ipAddress: '189.40.112.84',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/131.0.0.0',
    correlationId: 'c189f4e2-3310-4b88-991a-55412098ab34',
    createdAt: hoursAgo(1.2),
  },
];

const INITIAL_REFRESH_SESSIONS: RefreshTokenSession[] = [
  {
    id: 'rt-01-rotated',
    userId: 'usr-acme-admin',
    companyId: 'comp-acme-001',
    tokenHash: 'sha256:8f9d2a7e4b1c...e901 (ROTATED)',
    familyId: 'fam-acme-admin-01',
    expiresAt: hoursFromNow(140),
    revokedAt: hoursAgo(2),
    replacedByTokenId: 'rt-02-active',
    ipAddress: '189.40.112.84',
    userAgent: 'Chrome 131 / Windows 11 (Workstation Principal)',
    createdAt: hoursAgo(26),
  },
  {
    id: 'rt-02-active',
    userId: 'usr-acme-admin',
    companyId: 'comp-acme-001',
    tokenHash: 'sha256:3c7a11f09d82...44b2 (ACTIVE)',
    familyId: 'fam-acme-admin-01',
    expiresAt: hoursFromNow(166),
    revokedAt: null,
    replacedByTokenId: null,
    ipAddress: '189.40.112.84',
    userAgent: 'Chrome 131 / Windows 11 (Workstation Principal)',
    createdAt: hoursAgo(2),
  },
  {
    id: 'rt-03-mobile',
    userId: 'usr-acme-tech1',
    companyId: 'comp-acme-001',
    tokenHash: 'sha256:9a4e61c88b31...71d9 (ACTIVE)',
    familyId: 'fam-acme-tech1-99',
    expiresAt: hoursFromNow(150),
    revokedAt: null,
    replacedByTokenId: null,
    ipAddress: '177.92.14.201',
    userAgent: 'Safari / macOS Sequoia (MacBook SRE)',
    createdAt: hoursAgo(18),
  },
];

/**
 * Helper to compute SLA status from Ticket (`RN-018`)
 */
export function computeSlaState(ticket: Ticket): {
  state: SlaState;
  label: string;
  remainingText: string;
  breachedByRecalculation: boolean;
} {
  const createdMs = new Date(ticket.createdAt).getTime();
  const dueMs = new Date(ticket.dueAt).getTime();
  const origDueMs = new Date(ticket.originalDueAt).getTime();

  // If ticket is already completed (RESOLVED, CLOSED, CANCELLED)
  if (
    ticket.status === 'RESOLVED' ||
    ticket.status === 'CLOSED' ||
    ticket.status === 'CANCELLED'
  ) {
    const finishIso = ticket.resolvedAt || ticket.closedAt || ticket.cancelledAt || ticket.updatedAt;
    const finishMs = new Date(finishIso).getTime();
    const wasLate = finishMs > dueMs;
    return {
      state: wasLate ? 'BREACHED' : 'COMPLETED',
      label: wasLate ? 'Concluído fora do SLA' : 'SLA Cumprido',
      remainingText: wasLate ? 'Estourado na conclusão' : 'Dentro do prazo',
      breachedByRecalculation: dueMs !== origDueMs && wasLate,
    };
  }

  const currentMs = Date.now();
  const diffMs = dueMs - currentMs;
  const totalWindowMs = Math.max(1, dueMs - createdMs);
  const ratioRemaining = diffMs / totalWindowMs;

  const absMinutes = Math.round(Math.abs(diffMs) / 60_000);
  const hours = Math.floor(absMinutes / 60);
  const mins = absMinutes % 60;
  const formattedDuration = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  if (diffMs < 0) {
    return {
      state: 'BREACHED',
      label: 'SLA Estourado',
      remainingText: `Atrasado há ${formattedDuration}`,
      breachedByRecalculation: dueMs !== origDueMs,
    };
  }

  if (ratioRemaining <= 0.25) {
    return {
      state: 'AT_RISK',
      label: 'SLA em Risco',
      remainingText: `Restam ${formattedDuration}`,
      breachedByRecalculation: false,
    };
  }

  return {
    state: 'ON_TIME',
    label: 'No Prazo',
    remainingText: `Restam ${formattedDuration}`,
    breachedByRecalculation: false,
  };
}

interface CreateTicketInput {
  title: string;
  description: string;
  priority: TicketPriority;
  categoryId: string;
}

interface OnboardingInput {
  companyName: string;
  companySlug: string;
  adminName: string;
  adminEmail: string;
}

interface OpsFlowContextValue {
  // Active Session & Tenant Context
  companies: Company[];
  activeCompany: Company;
  currentUser: User;
  activeRole: RoleName; // Primary active persona for testing RBAC

  // Tenant-scoped collections (or cross-tenant inspection)
  tenantUsers: User[];
  tenantCategories: TicketCategory[];
  tenantTickets: Ticket[];
  allTicketsUnfiltered: Ticket[]; // Used only to let user click a foreign ticket in Demo Bar to see 404 Anti-IDOR
  tenantCounters: TicketCounter[];
  tenantAuditLogs: AuditLogEntry[];
  tenantRefreshSessions: RefreshTokenSession[];

  // RFC 9457 Problem Details Toast Queue
  problems: ProblemDetail[];
  dismissProblem: (traceId: string) => void;
  pushProblem: (problem: Omit<ProblemDetail, 'timestamp' | 'traceId'>) => ProblemDetail;

  // Interactive Switchers (Demo Bar)
  switchPersona: (userId: string) => void;
  switchTenant: (companyId: string) => void;

  // Domain Operations enforcing RN-001 through RN-020 + DEC-01 through DEC-15
  createTicket: (input: CreateTicketInput) => Ticket | null;
  transitionTicketStatus: (
    ticketId: string,
    targetStatus: TicketStatus,
    expectedVersion: number,
    options?: { resolutionSummary?: string; note?: string }
  ) => boolean;
  assignTicketTechnician: (
    ticketId: string,
    assigneeId: string | null,
    expectedVersion: number
  ) => boolean;
  changeTicketPriority: (
    ticketId: string,
    newPriority: TicketPriority,
    expectedVersion: number
  ) => boolean;
  simulateConcurrentVersionBump: (ticketId: string) => number | null;
  addTicketComment: (ticketId: string, content: string, internal: boolean) => boolean;
  getTicketByIdForCurrentTenant: (ticketId: string) => {
    ticket: Ticket | null;
    isCrossTenantIdorBlocked: boolean;
  };
  getCommentsForTicket: (ticketId: string) => TicketComment[];
  getHistoryForTicket: (ticketId: string) => TicketHistoryEntry[];

  // Categories (RN-009, RN-010 + Partial Unique Index)
  createCategory: (name: string, description: string) => boolean;
  toggleCategoryActive: (categoryId: string) => boolean;
  softDeleteCategory: (categoryId: string) => boolean;

  // Users, LGPD Anonymization (DEC-03) & Refresh Token Reuse Detection (T-04)
  createUser: (name: string, email: string, roles: RoleName[]) => boolean;
  anonymizeUserLgpd: (userId: string) => boolean;
  simulateRefreshTokenReuseAttack: (sessionId: string) => void;

  // Atomic Tenant Onboarding (RN-001 + ticket_counters seed)
  onboardNewTenant: (input: OnboardingInput) => Company | null;
}

const OpsFlowContext = createContext<OpsFlowContextValue | null>(null);

export const OpsFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [categories, setCategories] = useState<TicketCategory[]>(INITIAL_CATEGORIES);
  const [counters, setCounters] = useState<TicketCounter[]>(INITIAL_COUNTERS);
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [comments, setComments] = useState<TicketComment[]>(INITIAL_COMMENTS);
  const [history, setHistory] = useState<TicketHistoryEntry[]>(INITIAL_HISTORY);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [refreshSessions, setRefreshSessions] = useState<RefreshTokenSession[]>(
    INITIAL_REFRESH_SESSIONS
  );

  const [currentUserId, setCurrentUserId] = useState<string>('usr-acme-admin');
  const [problems, setProblems] = useState<ProblemDetail[]>([]);

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) || users[0],
    [users, currentUserId]
  );

  const activeCompany = useMemo(
    () => companies.find((c) => c.id === currentUser.companyId) || companies[0],
    [companies, currentUser]
  );

  const activeRole: RoleName = useMemo(() => {
    if (currentUser.roles.includes('ADMIN')) return 'ADMIN';
    if (currentUser.roles.includes('TECHNICIAN')) return 'TECHNICIAN';
    return 'EMPLOYEE';
  }, [currentUser]);

  const pushProblem = useCallback(
    (partial: Omit<ProblemDetail, 'timestamp' | 'traceId'>): ProblemDetail => {
      const full: ProblemDetail = {
        ...partial,
        timestamp: new Date().toISOString(),
        traceId: crypto.randomUUID().replace(/-/g, '').slice(0, 16),
      };
      setProblems((prev) => [full, ...prev.slice(0, 4)]);
      return full;
    },
    []
  );

  const dismissProblem = useCallback((traceId: string) => {
    setProblems((prev) => prev.filter((p) => p.traceId !== traceId));
  }, []);

  const appendAuditLog = useCallback(
    (
      action: string,
      resourceType: string,
      resourceId: string,
      metadata: Record<string, unknown>,
      overrideCompanyId?: string,
      overrideActor?: User
    ) => {
      const actor = overrideActor || currentUser;
      const entry: AuditLogEntry = {
        id: `aud-${crypto.randomUUID().slice(0, 8)}`,
        companyId: overrideCompanyId || activeCompany.id,
        actorUserId: actor.id,
        actorEmail: actor.email,
        action,
        resourceType,
        resourceId,
        metadata,
        ipAddress: '189.40.112.84',
        userAgent: navigator.userAgent.slice(0, 80),
        correlationId: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      setAuditLogs((prev) => [entry, ...prev]);
    },
    [activeCompany.id, currentUser]
  );

  const appendHistory = useCallback(
    (
      ticketId: string,
      eventType: TicketHistoryEntry['eventType'],
      fieldName: string | null,
      oldValue: string | null,
      newValue: string | null,
      note: string | null
    ) => {
      const entry: TicketHistoryEntry = {
        id: `hist-${crypto.randomUUID().slice(0, 8)}`,
        companyId: activeCompany.id,
        ticketId,
        actorId: currentUser.id,
        eventType,
        fieldName,
        oldValue,
        newValue,
        note,
        createdAt: new Date().toISOString(),
      };
      setHistory((prev) => [entry, ...prev]);
    },
    [activeCompany.id, currentUser.id]
  );

  // Switch Persona or Tenant
  const switchPersona = useCallback(
    (userId: string) => {
      const target = users.find((u) => u.id === userId);
      if (!target) return;
      if (!target.active || target.deletedAt) {
        pushProblem({
          type: 'https://opsflow.dev/problems/account-disabled',
          title: 'Account Deactivated or Anonymized',
          status: 403,
          detail: `O usuário "${target.name}" está inativo ou foi anonimizado via LGPD (DEC-03) e não pode autenticar.`,
          instance: '/api/v1/auth/login',
          errorCode: 'AUTH_ACCOUNT_DISABLED',
          ruleRef: 'RN-006 / DEC-03',
        });
        return;
      }
      setCurrentUserId(target.id);
    },
    [users, pushProblem]
  );

  const switchTenant = useCallback(
    (companyId: string) => {
      const firstActiveUser = users.find(
        (u) => u.companyId === companyId && u.active && !u.deletedAt
      );
      if (firstActiveUser) {
        setCurrentUserId(firstActiveUser.id);
      }
    },
    [users]
  );

  // Tenant-filtered views (RN-003: Strict Company Isolation)
  const tenantUsers = useMemo(
    () => users.filter((u) => u.companyId === activeCompany.id),
    [users, activeCompany.id]
  );

  const tenantCategories = useMemo(
    () => categories.filter((c) => c.companyId === activeCompany.id),
    [categories, activeCompany.id]
  );

  const tenantTickets = useMemo(() => {
    const companyTickets = tickets.filter((t) => t.companyId === activeCompany.id);
    // RN-007: EMPLOYEE only sees tickets where requester_id == currentUser.id
    if (activeRole === 'EMPLOYEE') {
      return companyTickets.filter((t) => t.requesterId === currentUser.id);
    }
    return companyTickets;
  }, [tickets, activeCompany.id, activeRole, currentUser.id]);

  const tenantAuditLogs = useMemo(
    () => auditLogs.filter((a) => a.companyId === activeCompany.id),
    [auditLogs, activeCompany.id]
  );

  const tenantRefreshSessions = useMemo(
    () => refreshSessions.filter((s) => s.companyId === activeCompany.id),
    [refreshSessions, activeCompany.id]
  );

  // Create Ticket with Atomic Per-Tenant Counter (`ticket_counters`) + SLA Calculation (`RN-018`)
  const createTicket = useCallback(
    (input: CreateTicketInput): Ticket | null => {
      const cat = categories.find(
        (c) => c.id === input.categoryId && c.companyId === activeCompany.id
      );

      // RN-010: Inactive or soft-deleted categories cannot receive new tickets
      if (!cat || !cat.active || cat.deletedAt) {
        pushProblem({
          type: 'https://opsflow.dev/problems/inactive-category',
          title: 'Unprocessable Entity — Inactive Category',
          status: 422,
          detail:
            'Categorias inativas ou removidas via Soft Delete não podem receber novos chamados (RN-010).',
          instance: '/api/v1/tickets',
          errorCode: 'TICKET_CATEGORY_INACTIVE',
          ruleRef: 'RN-010',
          errors: [
            {
              field: 'categoryId',
              message: 'A categoria selecionada está inativa ou arquivada.',
              rejectedValue: input.categoryId,
            },
          ],
        });
        return null;
      }

      if (input.title.trim().length < 5) {
        pushProblem({
          type: 'https://opsflow.dev/problems/validation-error',
          title: 'Validation Failed',
          status: 422,
          detail: 'O título do chamado deve possuir entre 5 e 200 caracteres.',
          instance: '/api/v1/tickets',
          errorCode: 'VALIDATION_ERROR',
          errors: [
            {
              field: 'title',
              message: 'Tamanho mínimo de 5 caracteres obrigatório.',
              rejectedValue: input.title,
            },
          ],
        });
        return null;
      }

      // Atomic UPSERT simulation on ticket_counters
      const currentCounter = counters.find((c) => c.companyId === activeCompany.id);
      const nextNumber = (currentCounter?.lastNumber ?? 0) + 1;
      const createdIso = new Date().toISOString();
      const slaHours = SLA_HOURS_BY_PRIORITY[input.priority];
      const dueIso = new Date(Date.now() + slaHours * 3600_000).toISOString();

      setCounters((prev) =>
        prev.map((c) =>
          c.companyId === activeCompany.id
            ? { ...c, lastNumber: nextNumber, updatedAt: createdIso }
            : c
        )
      );

      const newTicket: Ticket = {
        id: `tkt-${activeCompany.slug}-${nextNumber}`,
        companyId: activeCompany.id,
        number: nextNumber,
        title: input.title.trim(),
        description: input.description.trim(),
        status: 'OPEN',
        priority: input.priority,
        categoryId: cat.id,
        requesterId: currentUser.id,
        assigneeId: null,
        dueAt: dueIso,
        originalDueAt: dueIso,
        resolvedAt: null,
        closedAt: null,
        cancelledAt: null,
        resolutionSummary: null,
        version: 0,
        createdAt: createdIso,
        updatedAt: createdIso,
      };

      setTickets((prev) => [newTicket, ...prev]);
      appendHistory(
        newTicket.id,
        'TICKET_CREATED',
        'status',
        null,
        'OPEN',
        `Chamado #${String(nextNumber).padStart(6, '0')} aberto com SLA de ${slaHours}h (${input.priority})`
      );
      appendAuditLog('TICKET_CREATED', 'TICKET', newTicket.id, {
        number: nextNumber,
        priority: input.priority,
        dueAt: dueIso,
      });

      return newTicket;
    },
    [
      categories,
      activeCompany,
      counters,
      currentUser.id,
      pushProblem,
      appendHistory,
      appendAuditLog,
    ]
  );

  // Transition Ticket Status (RN-012, RN-013, RN-014, RN-015, RN-016 + @Version Optimistic Locking)
  const transitionTicketStatus = useCallback(
    (
      ticketId: string,
      targetStatus: TicketStatus,
      expectedVersion: number,
      options?: { resolutionSummary?: string; note?: string }
    ): boolean => {
      const ticket = tickets.find(
        (t) => t.id === ticketId && t.companyId === activeCompany.id
      );
      if (!ticket) {
        pushProblem({
          type: 'https://opsflow.dev/problems/resource-not-found',
          title: 'Resource Not Found',
          status: 404,
          detail: `Chamado não encontrado no escopo do tenant atual (RN-003).`,
          instance: `/api/v1/tickets/${ticketId}/status`,
          errorCode: 'RESOURCE_NOT_FOUND',
          ruleRef: 'RN-003',
        });
        return false;
      }

      // 1. Check Optimistic Locking (@Version) -> 409 Conflict
      if (ticket.version !== expectedVersion) {
        pushProblem({
          type: 'https://opsflow.dev/problems/optimistic-lock-conflict',
          title: 'Concurrent Modification Detected (@Version Conflict)',
          status: 409,
          detail: `Conflito de concorrência detectado no registro #${String(ticket.number).padStart(6, '0')}: sua tela enviou version=${expectedVersion}, mas o banco já está na version=${ticket.version} (ObjectOptimisticLockingFailureException).`,
          instance: `/api/v1/tickets/${ticketId}/status`,
          errorCode: 'OPTIMISTIC_LOCK_CONFLICT',
          ruleRef: 'ADR-008 / @Version',
        });
        return false;
      }

      // 2. Check Terminal State (RN-013)
      if (ticket.status === 'CLOSED' || ticket.status === 'CANCELLED') {
        pushProblem({
          type: 'https://opsflow.dev/problems/terminal-ticket-state',
          title: 'Immutable Terminal State',
          status: 409,
          detail: `O chamado está em estado terminal (${ticket.status}) e não aceita novas mutações (RN-013).`,
          instance: `/api/v1/tickets/${ticketId}/status`,
          errorCode: 'TICKET_TERMINAL_STATE',
          ruleRef: 'RN-013',
        });
        return false;
      }

      // 3. Check State Machine Allowed Transitions (RN-012)
      const allowed = ALLOWED_TRANSITIONS[ticket.status];
      if (!allowed.includes(targetStatus)) {
        pushProblem({
          type: 'https://opsflow.dev/problems/invalid-state-transition',
          title: 'Invalid State Transition',
          status: 409,
          detail: `Transição inválida de ${ticket.status} para ${targetStatus}. Transições permitidas: [${allowed.join(', ')}] (RN-012).`,
          instance: `/api/v1/tickets/${ticketId}/status`,
          errorCode: 'INVALID_STATUS_TRANSITION',
          ruleRef: 'RN-012',
        });
        return false;
      }

      // 4. Role Authorization checks (RN-007, RN-016)
      if (activeRole === 'EMPLOYEE') {
        const isRequester = ticket.requesterId === currentUser.id;
        const canEmployeeAct =
          isRequester &&
          ((ticket.status === 'OPEN' && targetStatus === 'CANCELLED') ||
            (ticket.status === 'RESOLVED' &&
              (targetStatus === 'CLOSED' || targetStatus === 'IN_PROGRESS')));

        if (!canEmployeeAct) {
          pushProblem({
            type: 'https://opsflow.dev/problems/forbidden-transition',
            title: 'Access Denied for Role EMPLOYEE',
            status: 403,
            detail:
              'Colaboradores (EMPLOYEE) só podem cancelar chamados próprios ainda em OPEN ou aprovar/reabrir chamados em RESOLVED (RN-007 / RN-016).',
            instance: `/api/v1/tickets/${ticketId}/status`,
            errorCode: 'INSUFFICIENT_ROLE_PRIVILEGES',
            ruleRef: 'RN-007 / RN-016',
          });
          return false;
        }
      }

      // 5. RN-014: IN_PROGRESS requires an assigned technician
      if (targetStatus === 'IN_PROGRESS' && !ticket.assigneeId) {
        pushProblem({
          type: 'https://opsflow.dev/problems/missing-assignee',
          title: 'Technician Assignment Required',
          status: 422,
          detail:
            'Um chamado não pode entrar em IN_PROGRESS sem um técnico responsável atribuído (assignee_id IS NOT NULL — RN-014).',
          instance: `/api/v1/tickets/${ticketId}/status`,
          errorCode: 'ASSIGNEE_REQUIRED_FOR_IN_PROGRESS',
          ruleRef: 'RN-014',
        });
        return false;
      }

      // 6. RN-015: RESOLVED requires resolutionSummary
      const summary = options?.resolutionSummary?.trim() || ticket.resolutionSummary;
      if (targetStatus === 'RESOLVED' && (!summary || summary.length < 10)) {
        pushProblem({
          type: 'https://opsflow.dev/problems/missing-resolution-summary',
          title: 'Resolution Summary Required',
          status: 422,
          detail:
            'A transição para RESOLVED exige um resumo técnico da solução (resolution_summary com mínimo de 10 caracteres — RN-015).',
          instance: `/api/v1/tickets/${ticketId}/status`,
          errorCode: 'RESOLUTION_SUMMARY_REQUIRED',
          ruleRef: 'RN-015',
          errors: [
            {
              field: 'resolutionSummary',
              message: 'Descreva a causa raiz e a solução aplicada (mín. 10 caracteres).',
            },
          ],
        });
        return false;
      }

      const nowIso = new Date().toISOString();
      const oldStatus = ticket.status;

      setTickets((prev) =>
        prev.map((t) => {
          if (t.id !== ticket.id) return t;
          return {
            ...t,
            status: targetStatus,
            resolutionSummary: targetStatus === 'RESOLVED' ? summary! : t.resolutionSummary,
            resolvedAt:
              targetStatus === 'RESOLVED'
                ? nowIso
                : targetStatus === 'IN_PROGRESS' && oldStatus === 'RESOLVED'
                  ? null // Reopened ticket clears resolvedAt
                  : t.resolvedAt,
            closedAt: targetStatus === 'CLOSED' ? nowIso : t.closedAt,
            cancelledAt: targetStatus === 'CANCELLED' ? nowIso : t.cancelledAt,
            version: t.version + 1,
            updatedAt: nowIso,
          };
        })
      );

      appendHistory(
        ticket.id,
        'STATUS_CHANGED',
        'status',
        oldStatus,
        targetStatus,
        options?.note ||
          (targetStatus === 'RESOLVED' ? `Solução: ${summary}` : `Transição ${oldStatus} → ${targetStatus}`)
      );

      appendAuditLog('TICKET_STATUS_CHANGED', 'TICKET', ticket.id, {
        ticketNumber: ticket.number,
        from: oldStatus,
        to: targetStatus,
        newVersion: ticket.version + 1,
      });

      return true;
    },
    [
      tickets,
      activeCompany.id,
      activeRole,
      currentUser.id,
      pushProblem,
      appendHistory,
      appendAuditLog,
    ]
  );

  // Assign Technician (RN-014 + Composite FK validation)
  const assignTicketTechnician = useCallback(
    (ticketId: string, assigneeId: string | null, expectedVersion: number): boolean => {
      if (activeRole === 'EMPLOYEE') {
        pushProblem({
          type: 'https://opsflow.dev/problems/forbidden',
          title: 'Forbidden Action',
          status: 403,
          detail: 'Apenas TECHNICIAN ou ADMIN podem atribuir responsáveis a um chamado (RN-007).',
          instance: `/api/v1/tickets/${ticketId}/assign`,
          errorCode: 'FORBIDDEN_ASSIGNMENT',
          ruleRef: 'RN-007',
        });
        return false;
      }

      const ticket = tickets.find(
        (t) => t.id === ticketId && t.companyId === activeCompany.id
      );
      if (!ticket) return false;

      if (ticket.version !== expectedVersion) {
        pushProblem({
          type: 'https://opsflow.dev/problems/optimistic-lock-conflict',
          title: 'Concurrent Modification Detected (@Version Conflict)',
          status: 409,
          detail: `A versão enviada (${expectedVersion}) diverge da versão atual no banco (${ticket.version}). Recarregue os dados antes de atribuir.`,
          instance: `/api/v1/tickets/${ticketId}/assign`,
          errorCode: 'OPTIMISTIC_LOCK_CONFLICT',
          ruleRef: 'ADR-008 / @Version',
        });
        return false;
      }

      if (ticket.status === 'CLOSED' || ticket.status === 'CANCELLED') {
        pushProblem({
          type: 'https://opsflow.dev/problems/terminal-ticket-state',
          title: 'Immutable Terminal State',
          status: 409,
          detail: 'Não é permitido alterar o responsável de um chamado encerrado ou cancelado (RN-013).',
          instance: `/api/v1/tickets/${ticketId}/assign`,
          errorCode: 'TICKET_TERMINAL_STATE',
          ruleRef: 'RN-013',
        });
        return false;
      }

      const assigneeUser = assigneeId
        ? users.find((u) => u.id === assigneeId && u.companyId === activeCompany.id)
        : null;

      if (
        assigneeId &&
        (!assigneeUser ||
          (!assigneeUser.roles.includes('TECHNICIAN') && !assigneeUser.roles.includes('ADMIN')))
      ) {
        pushProblem({
          type: 'https://opsflow.dev/problems/invalid-assignee',
          title: 'Invalid Technician Assignee',
          status: 422,
          detail:
            'O responsável deve pertencer ao mesmo tenant (FK Composta company_id, assignee_id) e possuir perfil TECHNICIAN ou ADMIN.',
          instance: `/api/v1/tickets/${ticketId}/assign`,
          errorCode: 'INVALID_ASSIGNEE_ROLE',
          ruleRef: 'DEC-01 / RN-008',
        });
        return false;
      }

      const oldUser = users.find((u) => u.id === ticket.assigneeId);
      const nowIso = new Date().toISOString();

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticket.id
            ? {
                ...t,
                assigneeId,
                version: t.version + 1,
                updatedAt: nowIso,
              }
            : t
        )
      );

      appendHistory(
        ticket.id,
        'ASSIGNEE_CHANGED',
        'assignee_id',
        oldUser?.name ?? 'Não atribuído',
        assigneeUser?.name ?? 'Não atribuído',
        'Atribuição de responsável atualizada'
      );

      return true;
    },
    [activeRole, tickets, activeCompany.id, users, pushProblem, appendHistory]
  );

  // Change Ticket Priority & Recalculate SLA preserving original_due_at (DEC-06 / RN-018)
  const changeTicketPriority = useCallback(
    (ticketId: string, newPriority: TicketPriority, expectedVersion: number): boolean => {
      if (activeRole === 'EMPLOYEE') {
        pushProblem({
          type: 'https://opsflow.dev/problems/forbidden',
          title: 'Forbidden Priority Change',
          status: 403,
          detail: 'Apenas TECHNICIAN ou ADMIN podem reclassificar a prioridade de um chamado.',
          instance: `/api/v1/tickets/${ticketId}`,
          errorCode: 'FORBIDDEN_PRIORITY_CHANGE',
          ruleRef: 'RN-007',
        });
        return false;
      }

      const ticket = tickets.find(
        (t) => t.id === ticketId && t.companyId === activeCompany.id
      );
      if (!ticket || ticket.priority === newPriority) return false;

      if (ticket.version !== expectedVersion) {
        pushProblem({
          type: 'https://opsflow.dev/problems/optimistic-lock-conflict',
          title: 'Concurrent Modification Detected (@Version Conflict)',
          status: 409,
          detail: `Versão esperada (${expectedVersion}) difere da versão persistida (${ticket.version}).`,
          instance: `/api/v1/tickets/${ticketId}`,
          errorCode: 'OPTIMISTIC_LOCK_CONFLICT',
          ruleRef: 'ADR-008 / @Version',
        });
        return false;
      }

      // DEC-06: Recalculate due_at from created_at + new SLA window, preserving original_due_at
      const createdMs = new Date(ticket.createdAt).getTime();
      const newSlaHours = SLA_HOURS_BY_PRIORITY[newPriority];
      const recalculatedDueAt = new Date(createdMs + newSlaHours * 3600_000).toISOString();
      const nowIso = new Date().toISOString();
      const oldPriority = ticket.priority;

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticket.id
            ? {
                ...t,
                priority: newPriority,
                dueAt: recalculatedDueAt,
                version: t.version + 1,
                updatedAt: nowIso,
              }
            : t
        )
      );

      appendHistory(
        ticket.id,
        'PRIORITY_CHANGED',
        'priority',
        oldPriority,
        newPriority,
        `DEC-06: Prazo SLA recalculado a partir de created_at (${newSlaHours}h). original_due_at preservado.`
      );

      appendAuditLog('TICKET_PRIORITY_CHANGED', 'TICKET', ticket.id, {
        ticketNumber: ticket.number,
        oldPriority,
        newPriority,
        newDueAt: recalculatedDueAt,
        originalDueAt: ticket.originalDueAt,
      });

      return true;
    },
    [activeRole, tickets, activeCompany.id, pushProblem, appendHistory, appendAuditLog]
  );

  // Simulate another technician editing the same ticket in the background (bumps @Version in DB)
  const simulateConcurrentVersionBump = useCallback(
    (ticketId: string): number | null => {
      let bumpedVersion: number | null = null;
      setTickets((prev) =>
        prev.map((t) => {
          if (t.id !== ticketId) return t;
          bumpedVersion = t.version + 1;
          return {
            ...t,
            version: bumpedVersion,
            updatedAt: new Date().toISOString(),
          };
        })
      );
      if (bumpedVersion !== null) {
        appendHistory(
          ticketId,
          'COMMENT_ADDED',
          'version',
          String(bumpedVersion - 1),
          String(bumpedVersion),
          '⚡ Simulação: Outro técnico atualizou o registro concorrentemente no banco (@Version incrementado)'
        );
      }
      return bumpedVersion;
    },
    [appendHistory]
  );

  // Add Comment with Internal Note Isolation (RN-020)
  const addTicketComment = useCallback(
    (ticketId: string, content: string, internal: boolean): boolean => {
      const ticket = tickets.find(
        (t) => t.id === ticketId && t.companyId === activeCompany.id
      );
      if (!ticket) return false;

      if (activeRole === 'EMPLOYEE' && internal) {
        pushProblem({
          type: 'https://opsflow.dev/problems/forbidden-internal-comment',
          title: 'Forbidden Internal Comment',
          status: 403,
          detail: 'Colaboradores (EMPLOYEE) não podem criar notas técnicas internas (RN-020).',
          instance: `/api/v1/tickets/${ticketId}/comments`,
          errorCode: 'INTERNAL_COMMENT_FORBIDDEN',
          ruleRef: 'RN-020',
        });
        return false;
      }

      if (!content.trim()) return false;

      const comment: TicketComment = {
        id: `cmt-${crypto.randomUUID().slice(0, 8)}`,
        companyId: activeCompany.id,
        ticketId,
        authorId: currentUser.id,
        content: content.trim(),
        internal,
        createdAt: new Date().toISOString(),
      };

      setComments((prev) => [...prev, comment]);
      appendHistory(
        ticketId,
        'COMMENT_ADDED',
        'comment',
        null,
        internal ? 'Nota Interna (Restrita)' : 'Comentário Público',
        internal ? 'Visível apenas para TECHNICIAN e ADMIN (RN-020)' : null
      );
      return true;
    },
    [tickets, activeCompany.id, activeRole, currentUser.id, pushProblem, appendHistory]
  );

  // Anti-IDOR / BOLA Check (T-01 & RN-003): Returns 404 ProblemDetail if ticket belongs to another tenant
  const getTicketByIdForCurrentTenant = useCallback(
    (
      ticketId: string
    ): {
      ticket: Ticket | null;
      isCrossTenantIdorBlocked: boolean;
    } => {
      const rawTicket = tickets.find((t) => t.id === ticketId);
      if (!rawTicket) {
        return { ticket: null, isCrossTenantIdorBlocked: false };
      }
      if (rawTicket.companyId !== activeCompany.id) {
        return { ticket: null, isCrossTenantIdorBlocked: true };
      }
      if (activeRole === 'EMPLOYEE' && rawTicket.requesterId !== currentUser.id) {
        return { ticket: null, isCrossTenantIdorBlocked: true };
      }
      return { ticket: rawTicket, isCrossTenantIdorBlocked: false };
    },
    [tickets, activeCompany.id, activeRole, currentUser.id]
  );

  // RN-020: Never serialize internal comments when activeRole === 'EMPLOYEE'
  const getCommentsForTicket = useCallback(
    (ticketId: string): TicketComment[] => {
      return comments.filter(
        (c) =>
          c.ticketId === ticketId &&
          c.companyId === activeCompany.id &&
          (activeRole !== 'EMPLOYEE' || !c.internal)
      );
    },
    [comments, activeCompany.id, activeRole]
  );

  const getHistoryForTicket = useCallback(
    (ticketId: string): TicketHistoryEntry[] => {
      return history.filter(
        (h) => h.ticketId === ticketId && h.companyId === activeCompany.id
      );
    },
    [history, activeCompany.id]
  );

  // Category Management with Partial Unique Index (`WHERE deleted_at IS NULL`)
  const createCategory = useCallback(
    (name: string, description: string): boolean => {
      if (activeRole !== 'ADMIN') {
        pushProblem({
          type: 'https://opsflow.dev/problems/forbidden',
          title: 'Admin Role Required',
          status: 403,
          detail: 'Apenas usuários ADMIN podem criar ou gerenciar categorias do tenant (RN-009).',
          instance: '/api/v1/categories',
          errorCode: 'ADMIN_REQUIRED',
          ruleRef: 'RN-009',
        });
        return false;
      }

      const normalized = name.trim().toLowerCase();
      // Partial Unique Index: uk_ticket_categories_company_name_active WHERE deleted_at IS NULL
      const duplicateActive = categories.find(
        (c) =>
          c.companyId === activeCompany.id &&
          c.deletedAt === null &&
          c.name.trim().toLowerCase() === normalized
      );

      if (duplicateActive) {
        pushProblem({
          type: 'https://opsflow.dev/problems/duplicate-category-name',
          title: 'Unique Constraint Violation (Partial Index)',
          status: 409,
          detail: `Já existe uma categoria não-deletada com o nome "${name.trim()}" neste tenant (Índice Único Parcial: uk_ticket_categories_company_name_active WHERE deleted_at IS NULL).`,
          instance: '/api/v1/categories',
          errorCode: 'CATEGORY_NAME_CONFLICT',
          ruleRef: 'RN-009 / DEC-02',
        });
        return false;
      }

      const nowIso = new Date().toISOString();
      const newCat: TicketCategory = {
        id: `cat-${crypto.randomUUID().slice(0, 8)}`,
        companyId: activeCompany.id,
        name: name.trim(),
        description: description.trim() || null,
        active: true,
        deletedAt: null,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      setCategories((prev) => [newCat, ...prev]);
      appendAuditLog('CATEGORY_CREATED', 'TICKET_CATEGORY', newCat.id, {
        name: newCat.name,
      });
      return true;
    },
    [activeRole, categories, activeCompany.id, pushProblem, appendAuditLog]
  );

  const toggleCategoryActive = useCallback(
    (categoryId: string): boolean => {
      if (activeRole !== 'ADMIN') return false;
      const nowIso = new Date().toISOString();
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId && c.companyId === activeCompany.id && !c.deletedAt
            ? { ...c, active: !c.active, updatedAt: nowIso }
            : c
        )
      );
      return true;
    },
    [activeRole, activeCompany.id]
  );

  const softDeleteCategory = useCallback(
    (categoryId: string): boolean => {
      if (activeRole !== 'ADMIN') return false;
      const target = categories.find(
        (c) => c.id === categoryId && c.companyId === activeCompany.id
      );
      if (!target || target.deletedAt) return false;

      const nowIso = new Date().toISOString();
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, active: false, deletedAt: nowIso, updatedAt: nowIso }
            : c
        )
      );

      appendAuditLog('CATEGORY_SOFT_DELETED', 'TICKET_CATEGORY', target.id, {
        categoryName: target.name,
        partialIndexSlotFreed: true,
      });
      return true;
    },
    [activeRole, categories, activeCompany.id, appendAuditLog]
  );

  // Create User + Roles
  const createUser = useCallback(
    (name: string, email: string, roles: RoleName[]): boolean => {
      if (activeRole !== 'ADMIN') {
        pushProblem({
          type: 'https://opsflow.dev/problems/forbidden',
          title: 'Admin Role Required',
          status: 403,
          detail: 'Apenas ADMIN pode cadastrar novos usuários no tenant.',
          instance: '/api/v1/users',
          errorCode: 'ADMIN_REQUIRED',
          ruleRef: 'RN-009',
        });
        return false;
      }

      const normalizedEmail = email.trim().toLowerCase();
      const duplicate = users.find(
        (u) =>
          u.companyId === activeCompany.id &&
          u.deletedAt === null &&
          u.email.toLowerCase() === normalizedEmail
      );

      if (duplicate) {
        pushProblem({
          type: 'https://opsflow.dev/problems/duplicate-email',
          title: 'Email Already Registered in Tenant',
          status: 409,
          detail: `O e-mail "${normalizedEmail}" já está em uso ativo neste tenant (uk_users_company_email_active WHERE deleted_at IS NULL — RN-004).`,
          instance: '/api/v1/users',
          errorCode: 'USER_EMAIL_CONFLICT',
          ruleRef: 'RN-004',
        });
        return false;
      }

      const nowIso = new Date().toISOString();
      const newUser: User = {
        id: `usr-${crypto.randomUUID().slice(0, 8)}`,
        companyId: activeCompany.id,
        name: name.trim(),
        email: normalizedEmail,
        roles: roles.length > 0 ? roles : ['EMPLOYEE'],
        active: true,
        deletedAt: null,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      setUsers((prev) => [...prev, newUser]);
      appendAuditLog('USER_CREATED', 'USER', newUser.id, {
        email: newUser.email,
        roles: newUser.roles,
      });
      return true;
    },
    [activeRole, users, activeCompany.id, pushProblem, appendAuditLog]
  );

  // LGPD User Anonymization (DEC-03): Preserves FK integrity on tickets/history while scrubbing PII
  const anonymizeUserLgpd = useCallback(
    (userId: string): boolean => {
      if (activeRole !== 'ADMIN') return false;
      if (userId === currentUser.id) {
        pushProblem({
          type: 'https://opsflow.dev/problems/self-anonymization-blocked',
          title: 'Cannot Anonymize Active Admin Session',
          status: 422,
          detail: 'Você não pode anonimizar sua própria conta enquanto autenticado.',
          instance: `/api/v1/users/${userId}/anonymize`,
          errorCode: 'SELF_ANONYMIZATION_FORBIDDEN',
          ruleRef: 'DEC-03',
        });
        return false;
      }

      const target = users.find(
        (u) => u.id === userId && u.companyId === activeCompany.id
      );
      if (!target || target.deletedAt) return false;

      const nowIso = new Date().toISOString();
      const shortHash = userId.slice(-6);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                name: 'Usuário Removido (LGPD)',
                email: `deleted+${shortHash}@anonymized.local`,
                active: false,
                deletedAt: nowIso,
                updatedAt: nowIso,
              }
            : u
        )
      );

      // Revoke all refresh tokens of that user
      setRefreshSessions((prev) =>
        prev.map((s) =>
          s.userId === userId && !s.revokedAt ? { ...s, revokedAt: nowIso } : s
        )
      );

      appendAuditLog('USER_LGPD_ANONYMIZED', 'USER', userId, {
        decisionRef: 'DEC-03',
        previousEmailRedacted: true,
        foreignKeysPreserved: ['tickets.requester_id', 'ticket_comments.author_id', 'ticket_history.actor_id'],
      });
      return true;
    },
    [activeRole, currentUser.id, users, activeCompany.id, pushProblem, appendAuditLog]
  );

  // Simulate Refresh Token Reuse Attack (T-04): Using an already-rotated token revokes the ENTIRE family_id!
  const simulateRefreshTokenReuseAttack = useCallback(
    (sessionId: string) => {
      const target = refreshSessions.find((s) => s.id === sessionId);
      if (!target) return;

      const nowIso = new Date().toISOString();
      // Revoke every token sharing the same familyId
      setRefreshSessions((prev) =>
        prev.map((s) =>
          s.familyId === target.familyId && !s.revokedAt
            ? { ...s, revokedAt: nowIso }
            : s
        )
      );

      appendAuditLog('REFRESH_TOKEN_REUSE_DETECTED', 'AUTH_SESSION', target.familyId, {
        threatRef: 'T-04',
        reusedTokenId: target.id,
        revokedEntireFamilyId: target.familyId,
        actionTaken: 'ALL_FAMILY_TOKENS_REVOKED_IMMEDIATELY',
      });

      pushProblem({
        type: 'https://opsflow.dev/problems/refresh-token-reuse-detected',
        title: 'Security Alert: Refresh Token Reuse Detected (T-04)',
        status: 401,
        detail: `Tentativa de reuso do token já rotacionado (${target.id}) detectada! Por segurança, TODA a família de sessões (${target.familyId}) foi revogada imediatamente no PostgreSQL.`,
        instance: '/api/v1/auth/refresh',
        errorCode: 'AUTH_TOKEN_REUSE_BREACH',
        ruleRef: 'T-04 / ADR-004',
      });
    },
    [refreshSessions, appendAuditLog, pushProblem]
  );

  // Atomic Tenant Onboarding (`POST /api/v1/onboarding`)
  const onboardNewTenant = useCallback(
    (input: OnboardingInput): Company | null => {
      const normalizedSlug = input.companySlug
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-');

      if (companies.some((c) => c.slug === normalizedSlug)) {
        pushProblem({
          type: 'https://opsflow.dev/problems/duplicate-company-slug',
          title: 'Company Slug Already Exists',
          status: 409,
          detail: `O slug "${normalizedSlug}" já está registrado na constraint uk_companies_slug (RN-002).`,
          instance: '/api/v1/onboarding',
          errorCode: 'COMPANY_SLUG_CONFLICT',
          ruleRef: 'RN-002',
        });
        return null;
      }

      const nowIso = new Date().toISOString();
      const companyId = `comp-${normalizedSlug}-${crypto.randomUUID().slice(0, 4)}`;
      const adminId = `usr-${normalizedSlug}-admin`;
      const defaultCatId = `cat-${normalizedSlug}-general`;

      const newCompany: Company = {
        id: companyId,
        name: input.companyName.trim(),
        slug: normalizedSlug,
        active: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const newAdmin: User = {
        id: adminId,
        companyId,
        name: input.adminName.trim(),
        email: input.adminEmail.trim().toLowerCase(),
        roles: ['ADMIN', 'TECHNICIAN'],
        active: true,
        deletedAt: null,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const newCounter: TicketCounter = {
        companyId,
        lastNumber: 0,
        updatedAt: nowIso,
      };

      const defaultCategory: TicketCategory = {
        id: defaultCatId,
        companyId,
        name: 'Suporte Técnico Geral',
        description: 'Categoria padrão inicializada atomicamente no onboarding do tenant',
        active: true,
        deletedAt: null,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      setCompanies((prev) => [...prev, newCompany]);
      setUsers((prev) => [...prev, newAdmin]);
      setCounters((prev) => [...prev, newCounter]);
      setCategories((prev) => [...prev, defaultCategory]);
      setCurrentUserId(newAdmin.id);

      appendAuditLog(
        'TENANT_ONBOARDED',
        'COMPANY',
        companyId,
        {
          slug: normalizedSlug,
          adminEmail: newAdmin.email,
          seededTables: ['companies', 'users', 'user_roles', 'ticket_counters', 'ticket_categories'],
        },
        companyId,
        newAdmin
      );

      return newCompany;
    },
    [companies, pushProblem, appendAuditLog]
  );

  const value: OpsFlowContextValue = {
    companies,
    activeCompany,
    currentUser,
    activeRole,
    tenantUsers,
    tenantCategories,
    tenantTickets,
    allTicketsUnfiltered: tickets,
    tenantCounters: counters.filter((c) => c.companyId === activeCompany.id),
    tenantAuditLogs,
    tenantRefreshSessions,
    problems,
    dismissProblem,
    pushProblem,
    switchPersona,
    switchTenant,
    createTicket,
    transitionTicketStatus,
    assignTicketTechnician,
    changeTicketPriority,
    simulateConcurrentVersionBump,
    addTicketComment,
    getTicketByIdForCurrentTenant,
    getCommentsForTicket,
    getHistoryForTicket,
    createCategory,
    toggleCategoryActive,
    softDeleteCategory,
    createUser,
    anonymizeUserLgpd,
    simulateRefreshTokenReuseAttack,
    onboardNewTenant,
  };

  return <OpsFlowContext.Provider value={value}>{children}</OpsFlowContext.Provider>;
};

export function useOpsFlow(): OpsFlowContextValue {
  const ctx = useContext(OpsFlowContext);
  if (!ctx) {
    throw new Error('useOpsFlow must be used within an OpsFlowProvider');
  }
  return ctx;
}
