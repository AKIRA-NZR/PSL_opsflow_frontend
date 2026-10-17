import React from 'react';
import {
  ChartBar,
  ClockCountdown,
  ClockCounterClockwise,
  Folders,
  PlusCircle,
  SidebarSimple,
  Tray,
  UserCheck,
  UsersThree,
  X,
} from '@phosphor-icons/react';
import { useWorkspace } from '../../context/WorkspaceContext';
import type { TicketScope } from '../../core/types/service.types';
import { evaluateTicketSla } from '../../core/utils/sla.utils';
import { Button } from '../ui/Button';
import { OpsFlowLogo } from '../ui/OpsFlowLogo';
import { ProfileSwitcher } from './ProfileSwitcher';

export type NavigationSection =
  | 'dashboard'
  | 'tickets'
  | 'categories'
  | 'team'
  | 'activity';

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
  const { activeCompany, currentUser, activeRole, tenantTickets } =
    useWorkspace();

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
    `group w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
      isActive
        ? 'tactile-surface text-white'
        : 'text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100'
    }`;

  const iconClass = (isActive: boolean) =>
    `w-4 h-4 shrink-0 transition-colors ${
      isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'
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
      <div className="h-full flex flex-col justify-between glass-sidebar select-none">
        <div className="p-3.5 space-y-5">
          {/* Top Brand Header */}
          <div
            className={`flex items-center ${
              collapsedMode ? 'justify-center' : 'justify-between'
            }`}
          >
            <div
              onClick={() => {
                if (isStaff) {
                  onNavigateSection('dashboard');
                } else {
                  onNavigateTickets('ALL');
                }
                onCloseMobile();
              }}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer group/brand"
            >
              <OpsFlowLogo size={34} />
              {!collapsedMode && (
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-zinc-100 group-hover/brand:text-white tracking-tight truncate">
                    OpsFlow
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate">
                    {activeCompany.name}
                  </div>
                </div>
              )}
            </div>

            {!collapsedMode && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:inline-flex p-1.5 rounded-lg text-zinc-400 hover:text-white tactile-surface transition-colors cursor-pointer"
                title="Recolher"
              >
                <SidebarSimple className="w-4 h-4" weight="duotone" />
              </button>
            )}

            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white tactile-surface cursor-pointer"
            >
              <X className="w-4 h-4" weight="bold" />
            </button>
          </div>

          {collapsedMode && (
            <div className="hidden lg:flex justify-center">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-2 rounded-lg text-zinc-400 hover:text-white tactile-surface transition-colors cursor-pointer"
                title="Expandir"
              >
                <SidebarSimple className="w-4 h-4" weight="duotone" />
              </button>
            </div>
          )}

          {/* Employee Prominent Action */}
          {!isStaff && !collapsedMode && (
            <Button
              variant="primary"
              size="sm"
              icon={<PlusCircle className="w-3.5 h-3.5" weight="fill" />}
              className="w-full justify-center py-2"
              onClick={() => {
                onOpenNewTicket();
                onCloseMobile();
              }}
            >
              Novo Chamado
            </Button>
          )}

          {/* Group 1: Main Navigation */}
          <div className="space-y-1">
            {!collapsedMode && (
              <div className="px-3 pb-1 text-[11px] font-medium text-zinc-500">
                {isStaff ? 'Operação' : 'Menu'}
              </div>
            )}

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
                    weight={isDashboardActive ? 'fill' : 'duotone'}
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
                  weight={isAllActive ? 'fill' : 'duotone'}
                />
                {!collapsedMode && (
                  <span>{isStaff ? 'Chamados' : 'Meus Chamados'}</span>
                )}
              </span>
              {!collapsedMode && (
                <span className="px-2 py-0.5 rounded-md text-[11px] text-zinc-400 font-mono neumorphic-inset">
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
                title="Atribuídos a mim"
              >
                <span className="flex items-center gap-2.5">
                  <UserCheck
                    className={iconClass(isAssignedActive)}
                    weight={isAssignedActive ? 'fill' : 'duotone'}
                  />
                  {!collapsedMode && <span>Atribuídos</span>}
                </span>
                {!collapsedMode && assignedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] text-zinc-300 font-mono neumorphic-inset">
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
                    weight={isSlaActive ? 'fill' : 'duotone'}
                  />
                  {!collapsedMode && <span>SLA Crítico</span>}
                </span>
                {!collapsedMode && attentionCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono neumorphic-inset text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    {attentionCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Group 2: Governance & Administration */}
          {isStaff && (
            <div className="space-y-1 pt-3 border-t border-white/[0.06]">
              {!collapsedMode && (
                <div className="px-3 pb-1 text-[11px] font-medium text-zinc-500">
                  Gestão
                </div>
              )}

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
                    weight={activeSection === 'categories' ? 'fill' : 'duotone'}
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
                        weight={activeSection === 'team' ? 'fill' : 'duotone'}
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
                          activeSection === 'activity' ? 'fill' : 'duotone'
                        }
                      />
                      {!collapsedMode && <span>Atividades</span>}
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Bottom Profile & Logout Menu */}
        <div className="p-3 border-t border-white/[0.06]">
          <ProfileSwitcher collapsed={collapsedMode} />
        </div>
      </div>
    );
  };

  return (
    <>
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {renderSidebarContent(isCollapsed)}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#06080D]/70 backdrop-blur-md"
            onClick={onCloseMobile}
          />
          <aside className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl">
            {renderSidebarContent(false)}
          </aside>
        </div>
      )}
    </>
  );
};

