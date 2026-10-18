import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from '@phosphor-icons/react';
import {
  formatDateTime,
  formatTicketCode,
  type TicketStatus,
} from '@opsflow/domain';
import { Button } from '@opsflow/ui';
import { PriorityBadge, StatusBadge } from '@entities/ticket';
import { useWorkspace } from '@entities/session';
import { ResolveTicketModal } from '@features/resolve-ticket';
import { TicketActionPanel } from '@widgets/ticket-action-panel';
import { TicketConversation } from '@widgets/ticket-conversation';

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
      <div className="max-w-xl mx-auto mt-12 glass-panel p-8 text-center space-y-4">
        <h2 className="text-base font-semibold text-white">
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
          <span className="font-mono text-xs text-[#e2e2e2] neumorphic-inset px-2.5 py-1">
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
          <div className="glass-panel p-6 space-y-4">
            <h1 className="text-lg font-semibold text-white leading-snug">
              {ticket.title}
            </h1>

            <div className="flex flex-wrap items-center gap-2.5 text-xs text-[#8e9192] pb-3.5 border-b border-[#444748]/35">
              <strong className="text-[#e2e2e2]">
                {requester?.name || 'Usuário'}
              </strong>
              <span>·</span>
              <span className="text-[#c4c7c8]">{category?.name || 'Geral'}</span>
              <span>·</span>
              <span className="font-mono text-[11px]">
                {formatDateTime(ticket.createdAt)}
              </span>
            </div>

            <div className="text-sm text-[#e2e2e2] leading-relaxed whitespace-pre-line pt-1">
              {ticket.description}
            </div>

            {ticket.resolutionSummary && (
              <div className="mt-4 bg-[#12261e] border border-[#1d3d31] p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-[#6ee7b7]">
                  <span className="flex items-center gap-1.5 font-mono uppercase tracking-wider text-[11px]">
                    <CheckCircle className="w-4 h-4" weight="fill" />
                    Solução Registrada
                  </span>
                  {ticket.resolvedAt && (
                    <span className="font-mono text-[11px]">
                      {formatDateTime(ticket.resolvedAt)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#e2e2e2] leading-relaxed">
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
