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
      label: 'NA TRIAGEM',
      value: stats.open,
      iconBox: 'bg-[#14222e] border-[#223a4e] text-[#7dd3fc]',
      icon: <Tray className="w-4 h-4" weight="fill" />,
    },
    {
      label: 'EM ATENDIMENTO',
      value: stats.inProgress,
      iconBox: 'bg-[#1c1d33] border-[#2e3154] text-[#a5b4fc]',
      icon: <Clock className="w-4 h-4" weight="fill" />,
    },
    {
      label: 'SLA CRÍTICO',
      value: stats.attentionSla,
      iconBox: 'bg-[#291518] border-[#452126] text-[#fda4af]',
      icon: <WarningOctagon className="w-4 h-4" weight="fill" />,
    },
    {
      label: 'CONCLUÍDOS',
      value: stats.completed,
      iconBox: 'bg-[#12261e] border-[#1d3d31] text-[#6ee7b7]',
      icon: <CheckCircle className="w-4 h-4" weight="fill" />,
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="glass-panel p-4 sm:p-5 flex items-center justify-between"
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192]">
              {c.label}
            </p>
            <p className="text-2xl font-semibold text-white mt-1">
              {c.value}
            </p>
          </div>
          <div className={`p-2.5 border ${c.iconBox}`}>{c.icon}</div>
        </div>
      ))}
    </div>
  );
};
