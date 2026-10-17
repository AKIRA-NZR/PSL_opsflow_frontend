import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react';
import { PriorityBadge, StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useWorkspace } from '../../context/WorkspaceContext';
import type { TicketStatus } from '../../core/types/domain.types';
import { formatDateTime, formatTicketCode } from '../../core/utils/date.utils';
import { ResolveTicketModal } from './ResolveTicketModal';
import { TicketActionPanel } from './TicketActionPanel';
import { TicketConversation } from './TicketConversation';

interface TicketDetailPageProps {
  ticketId: string;
  onBack: () => void;
}

export const TicketDetailPage: React.FC<TicketDetailPageProps> = ({
  ticketId,
  onBack,
}) => {
  const {
    currentUser,
    activeRole,
    tenantUsers,
    tenantCategories,
    getTicketDetails,
    changeTicketStatus,
    assignTicket,
    changePriority,
    addComment,
  } = useWorkspace();

  const [isResolveOpen, setIsResolveOpen] = useState(false);

  const { ticket, comments, history } = getTicketDetails(ticketId);

  if (!ticket) {
    return (
      <div className="max-w-xl mx-auto mt-12 rounded-2xl glass-panel p-8 text-center space-y-4">
        <h2 className="text-base font-semibold text-zinc-100">
          Chamado não encontrado
        </h2>
        <div>
          <Button
            variant="secondary"
            icon={<ArrowLeft className="w-4 h-4" weight="bold" />}
            onClick={onBack}
          >
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  const category = tenantCategories.find((c) => c.id === ticket.categoryId);
  const requester = tenantUsers.find((u) => u.id === ticket.requesterId);
  const technicians = tenantUsers.filter(
    (u) =>
      u.active &&
      !u.deletedAt &&
      (u.roles.includes('TECHNICIAN') || u.roles.includes('ADMIN'))
  );

  const handleStatusTransition = (targetStatus: TicketStatus) => {
    if (targetStatus === 'RESOLVED') {
      setIsResolveOpen(true);
      return;
    }
    changeTicketStatus(ticket.id, targetStatus);
  };

  const handleConfirmResolution = (summary: string) => {
    const ok = changeTicketStatus(ticket.id, 'RESOLVED', summary);
    if (ok) {
      setIsResolveOpen(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowLeft className="w-3.5 h-3.5" weight="bold" />}
            onClick={onBack}
          >
            Voltar
          </Button>
          <span className="font-mono text-xs font-medium text-zinc-200 neumorphic-inset px-2.5 py-1 rounded-lg">
            {formatTicketCode(ticket.number)}
          </span>
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="rounded-2xl glass-panel p-6 space-y-4">
            <h1 className="text-lg font-semibold text-zinc-100 leading-snug">
              {ticket.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-400 pb-3.5 border-b border-white/[0.08]">
              <span>
                <strong className="text-zinc-200">
                  {requester?.name || 'Usuário'}
                </strong>
              </span>
              <span>·</span>
              <span className="text-zinc-300">{category?.name || 'Geral'}</span>
              <span>·</span>
              <span>{formatDateTime(ticket.createdAt)}</span>
            </div>

            <div className="text-sm text-zinc-200 leading-relaxed whitespace-pre-line pt-1">
              {ticket.description}
            </div>

            {ticket.resolutionSummary && (
              <div className="mt-4 rounded-xl glass-pill bg-white/[0.03] border-white/[0.10] p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-zinc-200">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-[#10B981]" weight="fill" />
                    Solução
                  </span>
                  {ticket.resolvedAt && (
                    <span className="text-zinc-500">{formatDateTime(ticket.resolvedAt)}</span>
                  )}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {ticket.resolutionSummary}
                </p>
              </div>
            )}
          </div>

          <TicketConversation
            activeRole={activeRole}
            users={tenantUsers}
            comments={comments}
            history={history}
            onAddComment={(content, internal) =>
              addComment(ticket.id, content, internal)
            }
          />
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4">
          <TicketActionPanel
            ticket={ticket}
            currentUser={currentUser}
            activeRole={activeRole}
            technicians={technicians}
            onTransitionStatus={handleStatusTransition}
            onAssign={(assigneeId) => assignTicket(ticket.id, assigneeId)}
            onChangePriority={(priority) => changePriority(ticket.id, priority)}
          />
        </div>
      </div>

      <ResolveTicketModal
        isOpen={isResolveOpen}
        initialSummary={ticket.resolutionSummary}
        onClose={() => setIsResolveOpen(false)}
        onConfirm={handleConfirmResolution}
      />
    </div>
  );
};
