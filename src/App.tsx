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
  const { isAuthenticated, activeCompany, activeRole, currentUser } =
    useWorkspace();

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

  const getHeaderMeta = (): { title: string; subtitle: string } => {
    if (selectedTicketId) {
      return {
        title: 'Atendimento do Chamado',
        subtitle: `Acompanhamento detalhado · ${activeCompany.name}`,
      };
    }
    if (activeSection === 'dashboard') {
      return {
        title: 'Visão Geral de Operações',
        subtitle: `Indicadores de resolução, fila de triagem e SLA · ${activeCompany.name}`,
      };
    }
    if (activeSection === 'categories') {
      return {
        title: 'Categorias de Atendimento',
        subtitle: `Catálogo de filas · ${activeCompany.name}`,
      };
    }
    if (activeSection === 'team') {
      return {
        title: 'Equipe e Permissões',
        subtitle: `Gestão de membros · ${activeCompany.name}`,
      };
    }
    if (activeSection === 'activity') {
      return {
        title: 'Registro de Atividades',
        subtitle: `Histórico administrativo · ${activeCompany.name}`,
      };
    }
    return {
      title:
        activeRole === 'EMPLOYEE'
          ? 'Minhas Solicitações de Suporte'
          : filters.scope === 'ASSIGNED_TO_ME'
            ? 'Meus Atendimentos'
            : filters.scope === 'SLA_ATTENTION'
              ? 'Chamados com Atenção no Prazo'
              : 'Fila de Chamados',
      subtitle:
        activeRole === 'EMPLOYEE'
          ? `Portal do Solicitante · ${activeCompany.name}`
          : `Console de Atendimento · ${activeCompany.name}`,
    };
  };

  const { title, subtitle } = getHeaderMeta();

  return (
    <AppShell
      title={title}
      subtitle={subtitle}
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
