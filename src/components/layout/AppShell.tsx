import React, { useEffect, useState } from 'react';
import type { RoleName } from '../../core/types/domain.types';
import type { TicketScope } from '../../core/types/service.types';
import { ToastContainer } from '../ui/ToastContainer';
import { CommandModal } from './CommandModal';
import { type NavigationSection, Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';

interface AppShellProps {
  title: string;
  subtitle?: string;
  activeRole: RoleName;
  activeSection: NavigationSection;
  activeTicketScope: TicketScope;
  onNavigateTickets: (scope: TicketScope) => void;
  onNavigateSection: (section: NavigationSection) => void;
  onSelectTicket: (ticketId: string) => void;
  onOpenNewTicket: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  title,
  subtitle,
  activeRole,
  activeSection,
  activeTicketScope,
  onNavigateTickets,
  onNavigateSection,
  onSelectTicket,
  onOpenNewTicket,
  children,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden flex spatial-canvas text-[#e2e2e2]">
      <Sidebar
        activeSection={activeSection}
        activeTicketScope={activeTicketScope}
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onNavigateTickets={onNavigateTickets}
        onNavigateSection={onNavigateSection}
        onOpenNewTicket={onOpenNewTicket}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopHeader
          title={title}
          subtitle={subtitle}
          activeRole={activeRole}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenCommandModal={() => setIsCommandOpen(true)}
          onOpenNewTicket={onOpenNewTicket}
        />

        <main className="flex-1 overflow-y-auto p-5 lg:p-8">{children}</main>
      </div>

      <CommandModal
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onSelectTicket={onSelectTicket}
      />

      <ToastContainer />
    </div>
  );
};
