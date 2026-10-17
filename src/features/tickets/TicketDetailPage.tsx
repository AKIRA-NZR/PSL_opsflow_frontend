import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
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
      <div className="max-w-xl mx-auto mt-12 rounded-2xl bg-[#1B202B] border border-[#2A3140] p-8 text-center space-y-4">
        <h2 className="text-lg font-semibold text-[#F1F5F9]">
          Chamado não encontrado
        </h2>
        <p className="text-sm text-[#94A3B8] leading-relaxed">
          Este chamado não está disponível na sua visualização atual ou pertence a outra organização.
        </p>
        <div>
          <Button
            variant="secondary"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={onBack}
          >
            Voltar para a fila de chamados
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={onBack}
          >
            Voltar
          </Button>
          <span className="font-mono text-sm font-medium text-[#93C5FD] bg-[#1B202B] px-3 py-1 rounded-lg border border-[#2A3140]">
            {formatTicketCode(ticket.number)}
          </span>
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl bg-[#1B202B] border border-[#2A3140] p-6 space-y-4">
            <h1 className="text-xl font-semibold text-[#F1F5F9] leading-snug">
              {ticket.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8] pb-4 border-b border-[#2A3140]">
              <span>
                Solicitante:{' '}
                <strong className="text-[#F1F5F9]">
                  {requester?.name || 'Usuário'}
                </strong>
              </span>
              <span>·</span>
              <span>
                Categoria:{' '}
                <strong className="text-[#F1F5F9]">
                  {category?.name || 'Geral'}
                </strong>
              </span>
              <span>·</span>
              <span>Aberto em {formatDateTime(ticket.createdAt)}</span>
            </div>

            <div className="text-sm text-[#E2E8F0] leading-relaxed whitespace-pre-line pt-1">
              {ticket.description}
            </div>

            {ticket.resolutionSummary && (
              <div className="mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Solução Registrada
                  </span>
                  {ticket.resolvedAt && (
                    <span>{formatDateTime(ticket.resolvedAt)}</span>
                  )}
                </div>
                <p className="text-sm text-[#F1F5F9] leading-relaxed">
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

