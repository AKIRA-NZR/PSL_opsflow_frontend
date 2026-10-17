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
    `group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-150 cursor-pointer ${
      isActive
        ? 'tactile-surface text-[#F4F7FB] font-medium'
        : 'text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#F4F7FB]'
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
        <div className="p-4 space-y-6">
          {/* Top Brand & Organization Header */}
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
              className="flex items-center gap-3 min-w-0 cursor-pointer group/brand"
            >
              <OpsFlowLogo size={38} />
              {!collapsedMode && (
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#F4F7FB] group-hover/brand:text-white tracking-tight truncate transition-colors">
                    OpsFlow
                  </div>
                  <div className="text-xs text-[#94A3B8] truncate">
                    {isStaff ? 'Console de Operações' : 'Portal do Colaborador'}
                  </div>
                </div>
              )}
            </div>

            {!collapsedMode && (
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden lg:inline-flex p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F4F7FB] tactile-surface transition-colors cursor-pointer"
                title="Recolher barra lateral"
              >
                <SidebarSimple className="w-4 h-4" weight="duotone" />
              </button>
            )}

            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F4F7FB] tactile-surface cursor-pointer"
            >
              <X className="w-5 h-5" weight="bold" />
            </button>
          </div>

          {collapsedMode && (
            <div className="hidden lg:flex justify-center">
              <button
                type="button"
                onClick={onToggleCollapse}
                className="p-2 rounded-lg text-[#94A3B8] hover:text-[#F4F7FB] tactile-surface transition-colors cursor-pointer"
                title="Expandir barra lateral"
              >
                <SidebarSimple className="w-4 h-4" weight="duotone" />
              </button>
            </div>
          )}

          {/* Employee Prominent Action: Request Support */}
          {!isStaff && !collapsedMode && (
            <Button
              variant="primary"
              size="md"
              icon={<PlusCircle className="w-4 h-4" weight="fill" />}
              className="w-full justify-center"
              onClick={() => {
                onOpenNewTicket();
                onCloseMobile();
              }}
            >
              Solicitar Suporte
            </Button>
          )}

          {/* Group 1: Role-Tailored Main Navigation */}
          <div className="space-y-1.5">
            {!collapsedMode && (
              <div className="px-3 pb-1 text-xs font-medium text-[#64748B]">
                {isStaff ? 'Central de Atendimento' : 'Minhas Solicitações'}
              </div>
            )}

            {/* Dashboard is exclusively for ADMIN and TECHNICIAN */}
            {isStaff && (
              <button
                type="button"
                onClick={() => {
                  onNavigateSection('dashboard');
                  onCloseMobile();
                }}
                className={navItemClass(isDashboardActive)}
                title="Visão Geral & Indicadores"
              >
                <span className="flex items-center gap-3">
                  <ChartBar
                    className="w-4 h-4 text-[#A5B4FC] shrink-0"
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
              title={isStaff ? 'Fila de Chamados' : 'Meus Chamados'}
            >
              <span className="flex items-center gap-3">
                <Tray
                  className="w-4 h-4 text-[#93C5FD] shrink-0"
                  weight={isAllActive ? 'fill' : 'duotone'}
                />
                {!collapsedMode && (
                  <span>
                    {isStaff ? 'Fila de Chamados' : 'Meus Chamados'}
                  </span>
                )}
              </span>
              {!collapsedMode && (
                <span className="px-2 py-0.5 rounded-md text-xs text-[#94A3B8] font-mono neumorphic-inset">
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
                title="Meus Atendimentos"
              >
                <span className="flex items-center gap-3">
                  <UserCheck
                    className="w-4 h-4 text-[#6EE7B7] shrink-0"
                    weight={isAssignedActive ? 'fill' : 'duotone'}
                  />
                  {!collapsedMode && <span>Meus Atendimentos</span>}
                </span>
                {!collapsedMode && assignedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-md text-xs text-[#A7F3D0] font-mono neumorphic-inset">
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
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium glass-pill bg-rose-500/12 text-[#FECDD3] border-rose-400/25">
                    {attentionCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Group 2: Governance & Administration (ADMIN & TECHNICIAN) */}
          {isStaff && (
            <div className="space-y-1.5 pt-4 border-t border-white/[0.07]">
              {!collapsedMode && (
                <div className="px-3 pb-1 text-xs font-medium text-[#64748B]">
                  {activeRole === 'ADMIN' ? 'Administração' : 'Catálogo'}
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

              {activeRole === 'ADMIN' && (
                <>
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

          {/* Organization info card for Employee */}
          {!isStaff && !collapsedMode && (
            <div className="rounded-xl neumorphic-inset p-3.5 space-y-1 text-xs">
              <div className="font-medium text-[#E2E8F0]">
                {activeCompany.name}
              </div>
              <p className="text-[#94A3B8] leading-relaxed">
                Acompanhe aqui o andamento das suas solicitações junto à equipe técnica.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Profile & Logout Menu */}
        <div className="p-3 border-t border-white/[0.07]">
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

