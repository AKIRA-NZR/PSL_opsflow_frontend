import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {
  applyPriorityChange,
  validateAndBuildCategory,
  validateAndBuildTicket,
  validateAndBuildUser,
  validateStatusTransition,
  type ActivityLogItem,
  type Company,
  type CreateCategoryDTO,
  type CreateTicketDTO,
  type CreateUserDTO,
  type RoleName,
  type Ticket,
  type TicketCategory,
  type TicketComment,
  type TicketHistoryItem,
  type TicketPriority,
  type TicketStatus,
  type ToastNotification,
  type User,
} from '@opsflow/domain';
import {
  SEED_ACTIVITY_LOGS,
  SEED_CATEGORIES,
  SEED_COMMENTS,
  SEED_COMPANIES,
  SEED_HISTORY,
  SEED_TICKETS,
  SEED_USERS,
} from '@shared/index';

export interface WorkspaceContextValue {
  isAuthenticated: boolean;
  companies: Company[];
  activeCompany: Company;
  currentUser: User;
  activeRole: RoleName;
  allUsers: User[];

  tenantUsers: User[];
  tenantCategories: TicketCategory[];
  tenantTickets: Ticket[];
  tenantActivityLogs: ActivityLogItem[];

  toasts: ToastNotification[];
  dismissToast: (id: string) => void;

  loginWithEmail: (email: string) => boolean;
  logout: () => void;
  switchUserSession: (userId: string) => void;
  switchCompanyTenant: (companyId: string) => void;

  createTicket: (dto: CreateTicketDTO) => Ticket | null;
  changeTicketStatus: (
    ticketId: string,
    targetStatus: TicketStatus,
    resolutionSummary?: string
  ) => boolean;
  assignTicket: (ticketId: string, assigneeId: string | null) => boolean;
  assumeAndStartTicket: (ticketId: string) => boolean;
  changePriority: (ticketId: string, newPriority: TicketPriority) => boolean;
  addComment: (ticketId: string, content: string, internal: boolean) => boolean;
  getTicketDetails: (ticketId: string) => {
    ticket: Ticket | null;
    comments: TicketComment[];
    history: TicketHistoryItem[];
  };

  createCategory: (dto: CreateCategoryDTO) => boolean;
  toggleCategoryStatus: (categoryId: string) => void;
  archiveCategory: (categoryId: string) => void;

  createMember: (dto: CreateUserDTO) => boolean;
  deactivateMember: (userId: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [companies] = useState<Company[]>(SEED_COMPANIES);
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [categories, setCategories] = useState<TicketCategory[]>(SEED_CATEGORIES);
  const [tickets, setTickets] = useState<Ticket[]>(SEED_TICKETS);
  const [comments, setComments] = useState<TicketComment[]>(SEED_COMMENTS);
  const [history, setHistory] = useState<TicketHistoryItem[]>(SEED_HISTORY);
  const [activityLogs, setActivityLogs] =
    useState<ActivityLogItem[]>(SEED_ACTIVITY_LOGS);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string>('usr-acme-admin');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const notify = useCallback(
    (variant: ToastNotification['variant'], title: string, message: string) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [{ id, variant, title, message }, ...prev.slice(0, 3)]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4500);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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

  const loginWithEmail = useCallback(
    (email: string): boolean => {
      const normalized = email.trim().toLowerCase();
      const target = users.find(
        (u) => u.email.toLowerCase() === normalized && u.active && !u.deletedAt
      );
      if (!target) {
        notify(
          'error',
          'Credenciais não encontradas',
          'Verifique o e-mail informado.'
        );
        return false;
      }
      setCurrentUserId(target.id);
      setIsAuthenticated(true);
      notify('success', `Bem-vindo(a), ${target.name}`, 'Sessão iniciada.');
      return true;
    },
    [users, notify]
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
  }, []);

  const recordActivity = useCallback(
    (actionLabel: string, targetLabel: string, detail: string) => {
      const item: ActivityLogItem = {
        id: `act-${crypto.randomUUID().slice(0, 8)}`,
        companyId: activeCompany.id,
        actorName: currentUser.name,
        actorEmail: currentUser.email,
        actionLabel,
        targetLabel,
        detail,
        createdAt: new Date().toISOString(),
      };
      setActivityLogs((prev) => [item, ...prev]);
    },
    [activeCompany.id, currentUser]
  );

  const recordTicketHistory = useCallback(
    (ticketId: string, summary: string, detail?: string) => {
      const item: TicketHistoryItem = {
        id: `hist-${crypto.randomUUID().slice(0, 8)}`,
        companyId: activeCompany.id,
        ticketId,
        actorId: currentUser.id,
        summary,
        detail,
        createdAt: new Date().toISOString(),
      };
      setHistory((prev) => [item, ...prev]);
    },
    [activeCompany.id, currentUser.id]
  );

  const tenantUsers = useMemo(
    () => users.filter((u) => u.companyId === activeCompany.id),
    [users, activeCompany.id]
  );

  const tenantCategories = useMemo(
    () =>
      categories.filter(
        (c) => c.companyId === activeCompany.id && c.deletedAt === null
      ),
    [categories, activeCompany.id]
  );

  const tenantTickets = useMemo(() => {
    const companyTickets = tickets.filter(
      (t) => t.companyId === activeCompany.id
    );
    if (activeRole === 'EMPLOYEE') {
      return companyTickets.filter((t) => t.requesterId === currentUser.id);
    }
    return companyTickets;
  }, [tickets, activeCompany.id, activeRole, currentUser.id]);

  const tenantActivityLogs = useMemo(
    () => activityLogs.filter((a) => a.companyId === activeCompany.id),
    [activityLogs, activeCompany.id]
  );

  const switchUserSession = useCallback(
    (userId: string) => {
      const target = users.find((u) => u.id === userId);
      if (!target || !target.active || !isAuthenticated || target.deletedAt) {
        return;
      }
      setCurrentUserId(target.id);
      notify('info', `Conectado como ${target.name}`, '');
    },
    [users, isAuthenticated, notify]
  );

  const switchCompanyTenant = useCallback(
    (companyId: string) => {
      const firstActive = users.find(
        (u) => u.companyId === companyId && u.active && !u.deletedAt
      );
      if (firstActive) {
        setCurrentUserId(firstActive.id);
        const comp = companies.find((c) => c.id === companyId);
        if (comp) {
          notify('info', `Organização: ${comp.name}`, '');
        }
      }
    },
    [users, companies, notify]
  );

  const createTicket = useCallback(
    (dto: CreateTicketDTO): Ticket | null => {
      const maxNumber = tickets
        .filter((t) => t.companyId === activeCompany.id)
        .reduce((max, t) => Math.max(max, t.number), 100);

      const result = validateAndBuildTicket({
        dto,
        companyId: activeCompany.id,
        requesterId: currentUser.id,
        nextNumber: maxNumber + 1,
        categories,
      });

      if (!result.ok) {
        notify('error', result.error.title, result.error.message);
        return null;
      }

      const created = result.data;
      setTickets((prev) => [created, ...prev]);
      recordTicketHistory(created.id, 'Chamado aberto', created.title);
      recordActivity(
        'Novo chamado aberto',
        `Chamado #${String(created.number).padStart(5, '0')}`,
        created.title
      );
      notify('success', 'Chamado criado', result.message!);
      return created;
    },
    [
      tickets,
      activeCompany.id,
      currentUser.id,
      categories,
      notify,
      recordTicketHistory,
      recordActivity,
    ]
  );

  const changeTicketStatus = useCallback(
    (
      ticketId: string,
      targetStatus: TicketStatus,
      resolutionSummary?: string
    ): boolean => {
      const ticket = tickets.find(
        (t) => t.id === ticketId && t.companyId === activeCompany.id
      );
      if (!ticket) return false;

      const result = validateStatusTransition({
        ticket,
        targetStatus,
        actor: currentUser,
        activeRole,
        resolutionSummary,
      });

      if (!result.ok) {
        notify('error', result.error.title, result.error.message);
        return false;
      }

      const { updatedTicket, historySummary, historyDetail } = result.data;
      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? updatedTicket : t))
      );
      recordTicketHistory(ticket.id, historySummary, historyDetail);
      recordActivity(
        'Status atualizado',
        `Chamado #${String(ticket.number).padStart(5, '0')}`,
        historySummary
      );
      notify('success', 'Status atualizado', result.message!);
      return true;
    },
    [
      tickets,
      activeCompany.id,
      currentUser,
      activeRole,
      notify,
      recordTicketHistory,
      recordActivity,
    ]
  );

  const assignTicket = useCallback(
    (ticketId: string, assigneeId: string | null): boolean => {
      if (activeRole === 'EMPLOYEE') {
        notify('error', 'Acesso restrito', '');
        return false;
      }

      const ticket = tickets.find(
        (t) => t.id === ticketId && t.companyId === activeCompany.id
      );
      if (!ticket) return false;

      const assignee = assigneeId
        ? tenantUsers.find((u) => u.id === assigneeId)
        : null;

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticket.id
            ? {
                ...t,
                assigneeId,
                version: t.version + 1,
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );

      const summary = assignee
        ? `Responsável atribuído para ${assignee.name}`
        : 'Chamado devolvido para a fila geral';

      recordTicketHistory(ticket.id, summary);
      notify('success', 'Responsável atualizado', summary);
      return true;
    },
    [activeRole, tickets, activeCompany.id, tenantUsers, recordTicketHistory, notify]
  );

  const assumeAndStartTicket = useCallback(
    (ticketId: string): boolean => {
      if (activeRole === 'EMPLOYEE') return false;
      const ticket = tickets.find(
        (t) => t.id === ticketId && t.companyId === activeCompany.id
      );
      if (!ticket) return false;

      const nowIso = new Date().toISOString();
      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticket.id
            ? {
                ...t,
                assigneeId: currentUser.id,
                status: t.status === 'OPEN' ? 'IN_PROGRESS' : t.status,
                version: t.version + 1,
                updatedAt: nowIso,
              }
            : t
        )
      );

      recordTicketHistory(
        ticket.id,
        `Atendimento assumido e iniciado por ${currentUser.name}`
      );
      recordActivity(
        'Atendimento iniciado',
        `Chamado #${String(ticket.number).padStart(5, '0')}`,
        `${currentUser.name} assumiu o chamado na fila de triagem.`
      );
      notify(
        'success',
        `Chamado #${String(ticket.number).padStart(5, '0')} assumido`,
        ''
      );
      return true;
    },
    [
      activeRole,
      tickets,
      activeCompany.id,
      currentUser,
      recordTicketHistory,
      recordActivity,
      notify,
    ]
  );

  const changePriority = useCallback(
    (ticketId: string, newPriority: TicketPriority): boolean => {
      const ticket = tickets.find(
        (t) => t.id === ticketId && t.companyId === activeCompany.id
      );
      if (!ticket || ticket.priority === newPriority) return false;

      const result = applyPriorityChange(ticket, newPriority, activeRole);
      if (!result.ok) {
        notify('error', result.error.title, result.error.message);
        return false;
      }

      setTickets((prev) =>
        prev.map((t) => (t.id === ticket.id ? result.data.updatedTicket : t))
      );
      recordTicketHistory(ticket.id, result.data.historySummary);
      recordActivity(
        'Prioridade alterada',
        `Chamado #${String(ticket.number).padStart(5, '0')}`,
        result.data.historySummary
      );
      notify('success', 'Prioridade atualizada', result.message!);
      return true;
    },
    [tickets, activeCompany.id, activeRole, notify, recordTicketHistory, recordActivity]
  );

  const addComment = useCallback(
    (ticketId: string, content: string, internal: boolean): boolean => {
      const clean = content.trim();
      if (!clean) return false;

      const newComment: TicketComment = {
        id: `cmt-${crypto.randomUUID().slice(0, 8)}`,
        companyId: activeCompany.id,
        ticketId,
        authorId: currentUser.id,
        content: clean,
        internal: activeRole === 'EMPLOYEE' ? false : internal,
        createdAt: new Date().toISOString(),
      };

      setComments((prev) => [...prev, newComment]);
      return true;
    },
    [activeCompany.id, currentUser.id, activeRole]
  );

  const getTicketDetails = useCallback(
    (ticketId: string) => {
      const ticket = tenantTickets.find((t) => t.id === ticketId) || null;
      if (!ticket) {
        return { ticket: null, comments: [], history: [] };
      }

      const visibleComments = comments.filter(
        (c) =>
          c.ticketId === ticketId &&
          c.companyId === activeCompany.id &&
          (activeRole !== 'EMPLOYEE' || !c.internal)
      );

      const ticketHistory = history.filter(
        (h) => h.ticketId === ticketId && h.companyId === activeCompany.id
      );

      return { ticket, comments: visibleComments, history: ticketHistory };
    },
    [tenantTickets, comments, activeCompany.id, activeRole, history]
  );

  const createCategory = useCallback(
    (dto: CreateCategoryDTO): boolean => {
      const result = validateAndBuildCategory({
        dto,
        companyId: activeCompany.id,
        activeRole,
        existingCategories: categories,
      });

      if (!result.ok) {
        notify('error', result.error.title, result.error.message);
        return false;
      }

      setCategories((prev) => [result.data, ...prev]);
      recordActivity(
        'Nova categoria criada',
        result.data.name,
        result.data.description
      );
      notify('success', 'Categoria adicionada', result.message!);
      return true;
    },
    [activeCompany.id, activeRole, categories, notify, recordActivity]
  );

  const toggleCategoryStatus = useCallback(
    (categoryId: string) => {
      if (activeRole !== 'ADMIN') return;
      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? { ...c, active: !c.active } : c))
      );
      notify('info', 'Categoria atualizada', '');
    },
    [activeRole, notify]
  );

  const archiveCategory = useCallback(
    (categoryId: string) => {
      if (activeRole !== 'ADMIN') return;
      const target = categories.find((c) => c.id === categoryId);
      if (!target) return;

      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, active: false, deletedAt: new Date().toISOString() }
            : c
        )
      );
      recordActivity('Categoria arquivada', target.name, '');
      notify('success', 'Categoria arquivada', '');
    },
    [activeRole, categories, recordActivity, notify]
  );

  const createMember = useCallback(
    (dto: CreateUserDTO): boolean => {
      const result = validateAndBuildUser({
        dto,
        companyId: activeCompany.id,
        activeRole,
        existingUsers: users,
      });

      if (!result.ok) {
        notify('error', result.error.title, result.error.message);
        return false;
      }

      setUsers((prev) => [...prev, result.data]);
      recordActivity('Novo membro adicionado', result.data.name, '');
      notify('success', 'Membro cadastrado', '');
      return true;
    },
    [activeCompany.id, activeRole, users, notify, recordActivity]
  );

  const deactivateMember = useCallback(
    (userId: string) => {
      if (activeRole !== 'ADMIN' || userId === currentUser.id) return;

      const target = users.find((u) => u.id === userId);
      if (!target) return;

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                name: `${u.name} (Desativado)`,
                active: false,
                deletedAt: new Date().toISOString(),
              }
            : u
        )
      );
      recordActivity('Acesso de membro revogado', target.name, '');
      notify('info', 'Conta desativada', '');
    },
    [activeRole, currentUser.id, users, recordActivity, notify]
  );

  const value: WorkspaceContextValue = {
    isAuthenticated,
    companies,
    activeCompany,
    currentUser,
    activeRole,
    allUsers: users,
    tenantUsers,
    tenantCategories,
    tenantTickets,
    tenantActivityLogs,
    toasts,
    dismissToast,
    loginWithEmail,
    logout,
    switchUserSession,
    switchCompanyTenant,
    createTicket,
    changeTicketStatus,
    assignTicket,
    assumeAndStartTicket,
    changePriority,
    addComment,
    getTicketDetails,
    createCategory,
    toggleCategoryStatus,
    archiveCategory,
    createMember,
    deactivateMember,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return ctx;
}

