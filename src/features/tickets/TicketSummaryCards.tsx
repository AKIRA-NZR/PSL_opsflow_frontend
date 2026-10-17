import React, { useMemo } from 'react';
import {
  CheckCircle,
  Clock,
  Tray,
  WarningOctagon,
} from '@phosphor-icons/react';
import type { Ticket } from '../../core/types/domain.types';
import { evaluateTicketSla } from '../../core/utils/sla.utils';

interface TicketSummaryCardsProps {
  tickets: Ticket[];
}

export const TicketSummaryCards: React.FC<TicketSummaryCardsProps> = ({
  tickets,
}) => {
  const stats = useMemo(() => {
    let open = 0;
    let inProgress = 0;
    let attentionSla = 0;
    let completed = 0;

    for (const t of tickets) {
      if (t.status === 'OPEN') open++;
      if (t.status === 'IN_PROGRESS' || t.status === 'WAITING_USER') {
        inProgress++;
      }
      if (t.status === 'RESOLVED' || t.status === 'CLOSED') {
        completed++;
      }
      const sla = evaluateTicketSla(t);
      if (sla.health === 'BREACHED' || sla.health === 'AT_RISK') {
        attentionSla++;
      }
    }

    return { open, inProgress, attentionSla, completed };
  }, [tickets]);

  const cards = [
    {
      label: 'Na Triagem',
      value: stats.open,
      icon: <Tray className="w-4 h-4 text-zinc-300" weight="duotone" />,
    },
    {
      label: 'Em Atendimento',
      value: stats.inProgress,
      icon: <Clock className="w-4 h-4 text-zinc-300" weight="duotone" />,
    },
    {
      label: 'SLA Crítico',
      value: stats.attentionSla,
      icon: (
        <WarningOctagon className="w-4 h-4 text-zinc-300" weight="duotone" />
      ),
    },
    {
      label: 'Concluídos',
      value: stats.completed,
      icon: (
        <CheckCircle className="w-4 h-4 text-zinc-300" weight="duotone" />
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl glass-panel p-4 sm:p-5 flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-zinc-400">{c.label}</p>
            <p className="text-2xl font-semibold text-white mt-1">
              {c.value}
            </p>
          </div>
          <div className="p-2.5 rounded-xl neumorphic-inset">{c.icon}</div>
        </div>
      ))}
    </div>
  );
};

