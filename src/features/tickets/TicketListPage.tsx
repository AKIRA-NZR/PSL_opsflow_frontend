import React, { useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import type { TicketFilterState } from '../../core/types/service.types';
import { formatTicketCode } from '../../core/utils/date.utils';
import { evaluateTicketSla } from '../../core/utils/sla.utils';
import { TicketFilterBar } from './TicketFilterBar';
import { TicketSummaryCards } from './TicketSummaryCards';
import { TicketTable } from './TicketTable';

interface TicketListPageProps {
  filters: TicketFilterState;
  onUpdateFilters: (next: Partial<TicketFilterState>) => void;
  onSelectTicket: (ticketId: string) => void;
}

export const TicketListPage: React.FC<TicketListPageProps> = ({
  filters,
  onUpdateFilters,
  onSelectTicket,
}) => {
  const { currentUser, tenantTickets, tenantCategories, tenantUsers } =
    useWorkspace();

  const filteredTickets = useMemo(() => {
    return tenantTickets.filter((t) => {
      if (
        filters.scope === 'ASSIGNED_TO_ME' &&
        t.assigneeId !== currentUser.id
      ) {
        return false;
      }
      if (
        filters.scope === 'CREATED_BY_ME' &&
        t.requesterId !== currentUser.id
      ) {
        return false;
      }
      if (filters.scope === 'SLA_ATTENTION') {
        const sla = evaluateTicketSla(t);
        if (sla.health !== 'BREACHED' && sla.health !== 'AT_RISK') {
          return false;
        }
      }
      if (filters.status !== 'ALL' && t.status !== filters.status) {
        return false;
      }
      if (filters.priority !== 'ALL' && t.priority !== filters.priority) {
        return false;
      }
      if (filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        const code = formatTicketCode(t.number).toLowerCase();
        if (!t.title.toLowerCase().includes(q) && !code.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [tenantTickets, filters, currentUser.id]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <TicketSummaryCards tickets={tenantTickets} />
      <TicketFilterBar filters={filters} onChange={onUpdateFilters} />
      <TicketTable
        tickets={filteredTickets}
        categories={tenantCategories}
        users={tenantUsers}
        onSelectTicket={onSelectTicket}
      />
    </div>
  );
};
