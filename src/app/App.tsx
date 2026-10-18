import React, { useEffect, useState } from 'react';
import type { TicketFilterState, TicketScope } from '@opsflow/domain';
import { updateDocumentMeta } from '@shared/index';
import { WorkspaceProvider, useWorkspace } from '@entities/session';
import { CreateTicketModal } from '@features/create-ticket';
import { AppShell, type NavigationSection } from '@widgets/app-shell';
import { ActivityLogPage } from '@pages/activity-log';
import { CategoriesPage } from '@pages/categories';
import { DashboardPage } from '@pages/dashboard';
import { LoginPage } from '@pages/login';
import { TeamMembersPage } from '@pages/team-members';
import { TicketDetailPage } from '@pages/ticket-detail';
import { TicketListPage } from '@pages/ticket-list';

const WorkspaceRouter: React.FC = () => {
  const { isAuthenticated, activeRole, currentUser } = useWorkspace();

  const isStaff = activeRole === 'ADMIN' || activeRole === 'TECHNICIAN';

  const [activeSection, setActiveSection] = useState<NavigationSection>(
    isStaff ? 'dashboard' : 'tickets'
  );
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);

  const [filters, setFilters] = useState<TicketFilterState>({
    scope: 'ALL',
    status: 'ALL',
    priority: 'ALL',
    search: '',
  });

  // When switching between Staff (Admin/Technician) and Employee, land on the natural home view for that role
  useEffect(() => {
    setSelectedTicketId(null);
    setFilters({
      scope: 'ALL',
      status: 'ALL',
      priority: 'ALL',
      search: '',
    });
    setActiveSection(
      activeRole === 'ADMIN' || activeRole === 'TECHNICIAN'
        ? 'dashboard'
        : 'tickets'
    );
  }, [currentUser.id, activeRole]);

  const getHeaderTitle = (): string => {
    if (selectedTicketId) return 'Detalhes do Chamado';
    if (activeSection === 'dashboard') return 'Visão Geral';
    if (activeSection === 'categories') return 'Categorias';
    if (activeSection === 'team') return 'Equipe';
    if (activeSection === 'activity') return 'Atividades';
    if (activeRole === 'EMPLOYEE') return 'Meus Chamados';
    if (filters.scope === 'ASSIGNED_TO_ME') return 'Atribuídos a mim';
    if (filters.scope === 'SLA_ATTENTION') return 'SLA Crítico';
    return 'Chamados';
  };

  const currentTitle = isAuthenticated ? getHeaderTitle() : 'Login';

  useEffect(() => {
    updateDocumentMeta({
      title: currentTitle,
      description: isAuthenticated
        ? `OPSFLOW — ${currentTitle}: controle de chamados, fila de triagem e conformidade de SLA.`
        : 'OPSFLOW — Acesso à plataforma corporativa de gestão de ativos e operações em escala.',
    });
  }, [currentTitle, isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const handleNavigateTickets = (scope: TicketScope) => {
    setActiveSection('tickets');
    setSelectedTicketId(null);
    setFilters((prev) => ({ ...prev, scope }));
  };

  const handleNavigateSection = (section: NavigationSection) => {
    setSelectedTicketId(null);
    setActiveSection(section);
  };

  return (
    <AppShell
      title={currentTitle}
      activeRole={activeRole}
      activeSection={activeSection}
      activeTicketScope={filters.scope}
      onNavigateTickets={handleNavigateTickets}
      onNavigateSection={handleNavigateSection}
      onSelectTicket={(id) => {
        setActiveSection('tickets');
        setSelectedTicketId(id);
      }}
      onOpenNewTicket={() => setIsNewTicketOpen(true)}
    >
      {selectedTicketId ? (
        <TicketDetailPage
          ticketId={selectedTicketId}
          onBack={() => setSelectedTicketId(null)}
        />
      ) : activeSection === 'dashboard' && isStaff ? (
        <DashboardPage
          onSelectTicket={(id) => setSelectedTicketId(id)}
          onNavigateQueue={() => handleNavigateTickets('ALL')}
        />
      ) : activeSection === 'categories' && isStaff ? (
        <CategoriesPage />
      ) : activeSection === 'team' && activeRole === 'ADMIN' ? (
        <TeamMembersPage />
      ) : activeSection === 'activity' && activeRole === 'ADMIN' ? (
        <ActivityLogPage />
      ) : (
        <TicketListPage
          filters={filters}
          onUpdateFilters={(next) =>
            setFilters((prev) => ({ ...prev, ...next }))
          }
          onSelectTicket={(id) => setSelectedTicketId(id)}
        />
      )}

      <CreateTicketModal
        isOpen={isNewTicketOpen}
        onClose={() => setIsNewTicketOpen(false)}
        onCreated={(id) => {
          setActiveSection('tickets');
          setSelectedTicketId(id);
        }}
      />
    </AppShell>
  );
};

export function App() {
  return (
    <WorkspaceProvider>
      <WorkspaceRouter />
    </WorkspaceProvider>
  );
}

export default App;
