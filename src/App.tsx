import React, { useEffect, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import type { NavigationSection } from './components/layout/Sidebar';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import type { TicketFilterState, TicketScope } from './core/types/service.types';
import { ActivityLogPage } from './features/audit/ActivityLogPage';
import { LoginPage } from './features/auth/LoginPage';
import { CategoriesPage } from './features/categories/CategoriesPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { CreateTicketModal } from './features/tickets/CreateTicketModal';
import { TicketDetailPage } from './features/tickets/TicketDetailPage';
import { TicketListPage } from './features/tickets/TicketListPage';
import { TeamMembersPage } from './features/users/TeamMembersPage';

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

  return (
    <AppShell
      title={getHeaderTitle()}
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
