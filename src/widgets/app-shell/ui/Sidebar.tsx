import React from 'react';
import {
  ChartBar,
  ClockCountdown,
  ClockCounterClockwise,
  Folders,
  Plus,
  SidebarSimple,
  Tray,
  UserCheck,
  UserCircle,
  UsersThree,
  X,
} from '@phosphor-icons/react';
import { evaluateTicketSla, type TicketScope } from '@opsflow/domain';
import { useWorkspace } from '@entities/session';
import { ProfileSwitcher } from '@features/switch-profile';

export type NavigationSection =
  | 'dashboard'
  | 'tickets'
  | 'categories'
  | 'team'
  | 'activity'
  | 'profile';

interface SidebarProps {
  activeSection: NavigationSection;
  activeTicketScope: TicketScope;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onNavigateTickets: (scope: TicketScope) => void;
  onNavigateSection: (section: NavigationSection) => void;
  onOpenNewTicket: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  activeTicketScope,
  isCollapsed,
  isMobileOpen,
  onToggleCollapse,
  onCloseMobile,
  onNavigateTickets,
  onNavigateSection,
  onOpenNewTicket,
}) => {
  const { currentUser, activeRole, tenantTickets } = useWorkspace();

  const isStaff = activeRole === 'ADMIN' || activeRole === 'TECHNICIAN';

  const assignedCount = tenantTickets.filter(
    (t) =>
      t.assigneeId === currentUser.id &&
      t.status !== 'CLOSED' &&
      t.status !== 'CANCELLED'
  ).length;

  const attentionCount = tenantTickets.filter((t) => {
    const sla = evaluateTicketSla(t);
    return sla.health === 'BREACHED' || sla.health === 'AT_RISK';
  }).length;

  const navItemClass = (isActive: boolean) =>
    `group w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium border transition-colors duration-150 cursor-pointer ${
      isActive
        ? 'bg-[#1b1b1b] text-white border-[#444748]/80 border-l-2 border-l-white'
        : 'bg-transparent text-[#8e9192] border-transparent hover:bg-[#161616] hover:text-[#e2e2e2]'
    }`;

  const iconClass = (isActive: boolean) =>
    `w-4 h-4 shrink-0 transition-colors ${
      isActive ? 'text-white' : 'text-[#8e9192] group-hover:text-[#e2e2e2]'
    }`;

  const renderSidebarContent = (collapsedMode: boolean) => {
    const isDashboardActive = activeSection === 'dashboard';
    const isAllActive =
      activeSection === 'tickets' && activeTicketScope === 'ALL';
    const isAssignedActive =
      activeSection === 'tickets' && activeTicketScope === 'ASSIGNED_TO_ME';
    const isSlaActive =
      activeSection === 'tickets' && activeTicketScope === 'SLA_ATTENTION';

    return (
      <div className="h-full flex flex-col justify-between bg-[#0e0e0e] border-r border-[#444748]/40 select-none">
        <div>
          {/* Top Brand Bar */}
          <div
            className={`h-14 px-4 border-b border-[#444748]/40 flex items-center ${
              collapsedMode ? 'justify-center' : 'justify-between'
            }`}
          >
            <button
              type="button"
              onClick={() => {
                if (isStaff) {
                  onNavigateSection('dashboard');
                } else {
                  onNavigateTickets('ALL');
                }
                onCloseMobile();
              }}
              className="flex items-center min-w-0 cursor-pointer text-left"
            >
              <span className="font-display text-sm font-bold text-white tracking-[0.14em] uppercase truncate">
                {collapsedMode ? 'OF' : 'OPSFLOW'}
              </span>
            </button>

            {!collapsedMode && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:inline-flex p-1.5 text-[#8e9192] hover:text-white hover:bg-[#1b1b1b] transition-colors cursor-pointer"
                title="Recolher menu"
              >
                <SidebarSimple className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-[#8e9192] hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" weight="bold" />
            </button>
          </div>

          <div className="p-3 space-y-4">
            {collapsedMode && (
              <div className="hidden lg:flex justify-center">
                <button
                  type="button"
                  onClick={onToggleCollapse}
                  className="p-2 text-[#8e9192] hover:text-white hover:bg-[#1b1b1b] transition-colors cursor-pointer"
                  title="Expandir menu"
                >
                  <SidebarSimple className="w-4 h-4" />
                </button>
              </div>
            )}

            {!isStaff && !collapsedMode && (
              <button
                type="button"
                onClick={() => {
                  onOpenNewTicket();
                  onCloseMobile();
                }}
                className="w-full py-2 px-3 bg-white text-[#131313] font-mono text-[11px] font-bold uppercase tracking-[0.12em] hover:bg-[#c6c6c6] transition-colors flex items-center justify-between cursor-pointer"
              >
                <span>NOVO CHAMADO</span>
                <Plus className="w-3.5 h-3.5" weight="bold" />
              </button>
            )}

            <nav className="space-y-1" aria-label="Navegação principal">
              {isStaff && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigateSection('dashboard');
                    onCloseMobile();
                  }}
                  className={navItemClass(isDashboardActive)}
                  title="Visão Geral"
                >
                  <span className="flex items-center gap-2.5">
                    <ChartBar
                      className={iconClass(isDashboardActive)}
                      weight={isDashboardActive ? 'fill' : 'regular'}
                    />
                    {!collapsedMode && <span>Visão Geral</span>}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onNavigateTickets('ALL');
                  onCloseMobile();
                }}
                className={navItemClass(isAllActive)}
                title="Chamados"
              >
                <span className="flex items-center gap-2.5">
                  <Tray
                    className={iconClass(isAllActive)}
                    weight={isAllActive ? 'fill' : 'regular'}
                  />
                  {!collapsedMode && <span>Chamados</span>}
                </span>
                {!collapsedMode && (
                  <span className="font-mono text-[10px] text-[#8e9192]">
                    {tenantTickets.length}
                  </span>
                )}
              </button>

              {isStaff && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigateTickets('ASSIGNED_TO_ME');
                    onCloseMobile();
                  }}
                  className={navItemClass(isAssignedActive)}
                  title="Atribuídos"
                >
                  <span className="flex items-center gap-2.5">
                    <UserCheck
                      className={iconClass(isAssignedActive)}
                      weight={isAssignedActive ? 'fill' : 'regular'}
                    />
                    {!collapsedMode && <span>Atribuídos</span>}
                  </span>
                  {!collapsedMode && assignedCount > 0 && (
                    <span className="font-mono text-[10px] text-[#7dd3fc]">
                      {assignedCount}
                    </span>
                  )}
                </button>
              )}

              {isStaff && (
                <button
                  type="button"
                  onClick={() => {
                    onNavigateTickets('SLA_ATTENTION');
                    onCloseMobile();
                  }}
                  className={navItemClass(isSlaActive)}
                  title="SLA Crítico"
                >
                  <span className="flex items-center gap-2.5">
                    <ClockCountdown
                      className={iconClass(isSlaActive)}
                      weight={isSlaActive ? 'fill' : 'regular'}
                    />
                    {!collapsedMode && <span>SLA Crítico</span>}
                  </span>
                  {!collapsedMode && attentionCount > 0 && (
                    <span className="font-mono text-[10px] text-[#fda4af]">
                      {attentionCount}
                    </span>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onNavigateSection('profile');
                  onCloseMobile();
                }}
                className={navItemClass(activeSection === 'profile')}
                title="Meu Perfil"
              >
                <span className="flex items-center gap-2.5">
                  <UserCircle
                    className={iconClass(activeSection === 'profile')}
                    weight={activeSection === 'profile' ? 'fill' : 'regular'}
                  />
                  {!collapsedMode && <span>Meu Perfil</span>}
                </span>
              </button>
            </nav>

            {isStaff && (
              <nav
                className="space-y-1 pt-3 border-t border-[#444748]/35"
                aria-label="Gestão"
              >
                <button
                  type="button"
                  onClick={() => {
                    onNavigateSection('categories');
                    onCloseMobile();
                  }}
                  className={navItemClass(activeSection === 'categories')}
                  title="Categorias"
                >
                  <span className="flex items-center gap-2.5">
                    <Folders
                      className={iconClass(activeSection === 'categories')}
                      weight={
                        activeSection === 'categories' ? 'fill' : 'regular'
                      }
                    />
                    {!collapsedMode && <span>Categorias</span>}
                  </span>
                </button>

                {activeRole === 'ADMIN' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onNavigateSection('team');
                        onCloseMobile();
                      }}
                      className={navItemClass(activeSection === 'team')}
                      title="Equipe"
                    >
                      <span className="flex items-center gap-2.5">
                        <UsersThree
                          className={iconClass(activeSection === 'team')}
                          weight={activeSection === 'team' ? 'fill' : 'regular'}
                        />
                        {!collapsedMode && <span>Equipe</span>}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onNavigateSection('activity');
                        onCloseMobile();
                      }}
                      className={navItemClass(activeSection === 'activity')}
                      title="Atividades"
                    >
                      <span className="flex items-center gap-2.5">
                        <ClockCounterClockwise
                          className={iconClass(activeSection === 'activity')}
                          weight={
                            activeSection === 'activity' ? 'fill' : 'regular'
                          }
                        />
                        {!collapsedMode && <span>Atividades</span>}
                      </span>
                    </button>
                  </>
                )}
              </nav>
            )}
          </div>
        </div>

        <div className="p-3 border-t border-[#444748]/40">
          <ProfileSwitcher
            collapsed={collapsedMode}
            onNavigateProfile={() => {
              onNavigateSection('profile');
              onCloseMobile();
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-150 ${
          isCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        {renderSidebarContent(isCollapsed)}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/75"
            onClick={onCloseMobile}
          />
          <aside className="relative w-60 max-w-[85vw] h-full z-10">
            {renderSidebarContent(false)}
          </aside>
        </div>
      )}
    </>
  );
};

