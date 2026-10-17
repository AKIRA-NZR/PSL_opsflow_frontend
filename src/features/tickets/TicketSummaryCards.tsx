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
      label: 'Aguardando Triagem',
      value: stats.open,
      icon: <Tray className="w-5 h-5 text-[#8BA3BE]" weight="duotone" />,
      iconBg: 'bg-[#19202B] border-[#2B3646]',
    },
    {
      label: 'Em Atendimento',
      value: stats.inProgress,
      icon: <Clock className="w-5 h-5 text-[#969ECA]" weight="duotone" />,
      iconBg: 'bg-[#1D2030] border-[#323854]',
    },
    {
      label: 'Atenção no Prazo',
      value: stats.attentionSla,
      icon: (
        <WarningOctagon className="w-5 h-5 text-[#C4A676]" weight="duotone" />
      ),
      iconBg: 'bg-[#231F19] border-[#3A3226]',
    },
    {
      label: 'Resolvidos e Concluídos',
      value: stats.completed,
      icon: (
        <CheckCircle className="w-5 h-5 text-[#7FA998]" weight="duotone" />
      ),
      iconBg: 'bg-[#17231F] border-[#263B34]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl bg-[#1B202B] border border-[#2A3140] p-5 flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium text-[#94A3B8]">{c.label}</p>
            <p className="text-2xl font-semibold text-[#F1F5F9] mt-1">
              {c.value}
            </p>
          </div>
          <div className={`p-3 rounded-xl border ${c.iconBg}`}>{c.icon}</div>
        </div>
      ))}
    </div>
  );
};
