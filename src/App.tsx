import React, { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import type { NavigationSection } from './components/layout/Sidebar';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import type { TicketFilterState, TicketScope } from './core/types/service.types';
import { ActivityLogPage } from './features/audit/ActivityLogPage';
import { CategoriesPage } from './features/categories/CategoriesPage';
import { CreateTicketModal } from './features/tickets/CreateTicketModal';
import { TicketDetailPage } from './features/tickets/TicketDetailPage';
import { TicketListPage } from './features/tickets/TicketListPage';
import { TeamMembersPage } from './features/users/TeamMembersPage';

const WorkspaceRouter: React.FC = () => {
  const { activeCompany, activeRole } = useWorkspace();

  const [activeSection, setActiveSection] =
    useState<NavigationSection>('tickets');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);

  const [filters, setFilters] = useState<TicketFilterState>({
    scope: 'ALL',
    status: 'ALL',
    priority: 'ALL',
    search: '',
  });

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
        title: 'Detalhes do Chamado',
        subtitle: `Acompanhamento de atendimento · ${activeCompany.name}`,
      };
    }
    if (activeSection === 'categories') {
      return {
        title: 'Categorias de Atendimento',
        subtitle: `Gestão de filas · ${activeCompany.name}`,
      };
    }
    if (activeSection === 'team') {
      return {
        title: 'Equipe e Acessos',
        subtitle: `Membros da organização · ${activeCompany.name}`,
      };
    }
    if (activeSection === 'activity') {
      return {
        title: 'Histórico de Atividades',
        subtitle: `Registro operacional · ${activeCompany.name}`,
      };
    }
    return {
      title:
        activeRole === 'EMPLOYEE'
          ? 'Meus Chamados'
          : filters.scope === 'ASSIGNED_TO_ME'
            ? 'Chamados Atribuídos a Mim'
            : filters.scope === 'SLA_ATTENTION'
              ? 'Chamados com Atenção no Prazo'
              : 'Central de Chamados',
      subtitle: `Ambiente ${activeCompany.name}`,
    };
  };

  const { title, subtitle } = getHeaderMeta();

  return (
    <AppShell
      title={title}
      subtitle={subtitle}
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
      ) : activeSection === 'categories' ? (
        <CategoriesPage />
      ) : activeSection === 'team' ? (
        <TeamMembersPage />
      ) : activeSection === 'activity' ? (
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
