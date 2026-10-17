import React from 'react';
import {
  ClockCountdown,
  Folders,
  ClockCounterClockwise,
  Tray,
  SidebarSimple,
  UserCheck,
  UsersThree,
  X,
} from '@phosphor-icons/react';
import { useWorkspace } from '../../context/WorkspaceContext';
import type { TicketScope } from '../../core/types/service.types';
import { evaluateTicketSla } from '../../core/utils/sla.utils';
import { OpsFlowLogo } from '../ui/OpsFlowLogo';
import { ProfileSwitcher } from './ProfileSwitcher';

export type NavigationSection = 'tickets' | 'categories' | 'team' | 'activity';

interface SidebarProps {
  activeSection: NavigationSection;
  activeTicketScope: TicketScope;
  isCollapsed: boolean;
  isMobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
  onNavigateTickets: (scope: TicketScope) => void;
  onNavigateSection: (section: NavigationSection) => void;
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
}) => {
  const { activeCompany, currentUser, activeRole, tenantTickets } =
    useWorkspace();

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
    `w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${
      isActive
        ? 'bg-[#232936] text-[#F1F5F9] font-medium'
        : 'text-[#94A3B8] hover:bg-[#1E2430] hover:text-[#F1F5F9]'
    }`;

  const renderSidebarContent = (collapsedMode: boolean) => {
    const isAllActive =
      activeSection === 'tickets' && activeTicketScope === 'ALL';
    const isAssignedActive =
      activeSection === 'tickets' && activeTicketScope === 'ASSIGNED_TO_ME';
    const isSlaActive =
      activeSection === 'tickets' && activeTicketScope === 'SLA_ATTENTION';

    return (
      <div className="h-full flex flex-col justify-between bg-[#161A22] border-r border-[#2A3140] select-none">
        <div className="p-4 space-y-6">
          {/* Top Brand & Organization Header */}
          <div
            className={`flex items-center ${
              collapsedMode ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <OpsFlowLogo size={36} />
              {!collapsedMode && (
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#F1F5F9] tracking-tight truncate">
                    OpsFlow
                  </div>
                  <div className="text-xs text-[#94A3B8] truncate">
                    {activeCompany.name}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Collapse Button */}
            {!collapsedMode && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:inline-flex p-1.5 rounded-lg text-[#64748B] hover:text-[#F1F5F9] hover:bg-[#232936] transition-colors cursor-pointer"
                title="Recolher barra lateral"
              >
                <SidebarSimple className="w-4 h-4" weight="duotone" />
              </button>
            )}

            {/* Mobile Close Button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#232936] cursor-pointer"
            >
              <X className="w-5 h-5" weight="bold" />
            </button>
          </div>

          {collapsedMode && (
            <div className="hidden lg:flex justify-center">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#232936] transition-colors cursor-pointer"
                title="Expandir barra lateral"
              >
                <SidebarSimple className="w-4 h-4" weight="duotone" />
              </button>
            </div>
          )}

          {/* Group 1: Service Desk Views */}
          <div className="space-y-1">
            {!collapsedMode && (
              <div className="px-3 pb-1 text-xs font-medium text-[#64748B]">
                Atendimento
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                onNavigateTickets('ALL');
                onCloseMobile();
              }}
              className={navItemClass(isAllActive)}
              title="Todos os Chamados"
            >
              <span className="flex items-center gap-3">
                <Tray
                  className="w-4 h-4 text-[#93C5FD] shrink-0"
                  weight={isAllActive ? 'fill' : 'duotone'}
                />
                {!collapsedMode && (
                  <span>
                    {activeRole === 'EMPLOYEE'
                      ? 'Meus Chamados'
                      : 'Todos os Chamados'}
                  </span>
                )}
              </span>
              {!collapsedMode && (
                <span className="text-xs text-[#64748B] font-mono">
                  {tenantTickets.length}
                </span>
              )}
            </button>

            {activeRole !== 'EMPLOYEE' && (
              <button
                type="button"
                onClick={() => {
                  onNavigateTickets('ASSIGNED_TO_ME');
                  onCloseMobile();
                }}
                className={navItemClass(isAssignedActive)}
                title="Atribuídos a mim"
              >
                <span className="flex items-center gap-3">
                  <UserCheck
                    className="w-4 h-4 text-[#6EE7B7] shrink-0"
                    weight={isAssignedActive ? 'fill' : 'duotone'}
                  />
                  {!collapsedMode && <span>Atribuídos a mim</span>}
                </span>
                {!collapsedMode && assignedCount > 0 && (
                  <span className="text-xs text-[#94A3B8] font-mono">
                    {assignedCount}
                  </span>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onNavigateTickets('SLA_ATTENTION');
                onCloseMobile();
              }}
              className={navItemClass(isSlaActive)}
              title="Atenção no Prazo"
            >
              <span className="flex items-center gap-3">
                <ClockCountdown
                  className="w-4 h-4 text-[#FDA4AF] shrink-0"
                  weight={isSlaActive ? 'fill' : 'duotone'}
                />
                {!collapsedMode && <span>Atenção no Prazo</span>}
              </span>
              {!collapsedMode && attentionCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/15 text-rose-300">
                  {attentionCount}
                </span>
              )}
            </button>
          </div>

          {/* Group 2: Organization & Management */}
          <div className="space-y-1 pt-4 border-t border-[#2A3140]">
            {!collapsedMode && (
              <div className="px-3 pb-1 text-xs font-medium text-[#64748B]">
                Organização
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                onNavigateSection('categories');
                onCloseMobile();
              }}
              className={navItemClass(activeSection === 'categories')}
              title="Categorias de Atendimento"
            >
              <span className="flex items-center gap-3">
                <Folders
                  className="w-4 h-4 text-[#FCD34D] shrink-0"
                  weight={activeSection === 'categories' ? 'fill' : 'duotone'}
                />
                {!collapsedMode && <span>Categorias</span>}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigateSection('team');
                onCloseMobile();
              }}
              className={navItemClass(activeSection === 'team')}
              title="Membros da Equipe"
            >
              <span className="flex items-center gap-3">
                <UsersThree
                  className="w-4 h-4 text-[#A5B4FC] shrink-0"
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
              title="Registro de Atividades"
            >
              <span className="flex items-center gap-3">
                <ClockCounterClockwise
                  className="w-4 h-4 text-[#94A3B8] shrink-0"
                  weight={activeSection === 'activity' ? 'fill' : 'duotone'}
                />
                {!collapsedMode && <span>Atividades</span>}
              </span>
            </button>
          </div>
        </div>

        {/* Bottom Profile & Tenant Switcher */}
        <div className="p-3 border-t border-[#2A3140]">
          <ProfileSwitcher collapsed={collapsedMode} />
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar (Collapsible: w-64 or w-18) */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 ${
          isCollapsed ? 'w-18' : 'w-64'
        }`}
      >
        {renderSidebarContent(isCollapsed)}
      </aside>

      {/* Mobile & Tablet Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/65 backdrop-blur-xs"
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
