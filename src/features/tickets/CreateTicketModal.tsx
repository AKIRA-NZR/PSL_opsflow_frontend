import React, { useEffect, useMemo, useState } from 'react';
import { Folders } from '@phosphor-icons/react';
import { PrioritySignalIcon } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  DropdownSelect,
  type DropdownOption,
} from '../../components/ui/DropdownSelect';
import { Modal } from '../../components/ui/Modal';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  PRIORITY_LABELS,
  SLA_HOURS_BY_PRIORITY,
} from '../../core/constants/ticket.constants';
import type { TicketPriority } from '../../core/types/domain.types';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (ticketId: string) => void;
}

const PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { tenantCategories, createTicket } = useWorkspace();

  const activeCategories = useMemo(
    () => tenantCategories.filter((c) => c.active),
    [tenantCategories]
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    if (isOpen && activeCategories.length > 0 && !categoryId) {
      setCategoryId(activeCategories[0].id);
    }
  }, [isOpen, activeCategories, categoryId]);

  const categoryOptions: DropdownOption<string>[] = useMemo(
    () =>
      activeCategories.map((c) => ({
        value: c.id,
        label: c.name,
        description: c.description,
        icon: <Folders className="w-4 h-4 text-[#FCD34D]" weight="duotone" />,
      })),
    [activeCategories]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = createTicket({
      title,
      description,
      priority,
      categoryId,
    });
    if (created) {
      setTitle('');
      setDescription('');
      setPriority('MEDIUM');
      onClose();
      onCreated(created.id);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Abrir Novo Chamado"
      subtitle="Descreva sua solicitação ou incidente para direcionarmos à equipe responsável."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#F4F7FB] block">
            Assunto do chamado
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Liberação de acesso à VPN ou lentidão no sistema"
            className="w-full rounded-xl neumorphic-inset px-3.5 py-2.5 text-sm text-[#F4F7FB] placeholder-[#64748B] focus:outline-none transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#F4F7FB] block">
            Categoria de atendimento
          </label>
          <DropdownSelect
            value={categoryId}
            options={categoryOptions}
            onChange={setCategoryId}
          />
        </div>

        {/* Modern Visual Priority Selector Cards */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-[#F4F7FB] block">
            Nível de prioridade
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PRIORITIES.map((p) => {
              const isSelected = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex flex-col items-start gap-1.5 p-3 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'tactile-surface border-indigo-400/50 ring-2 ring-indigo-400/20'
                      : 'neumorphic-inset hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <PrioritySignalIcon priority={p} />
                    <span className="text-xs font-semibold text-[#F4F7FB]">
                      {PRIORITY_LABELS[p]}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#94A3B8]">
                    Meta: {SLA_HOURS_BY_PRIORITY[p]}h
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#F4F7FB] block">
            Descrição detalhada
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explique o que está acontecendo e informe detalhes que ajudem no atendimento..."
            className="w-full rounded-xl neumorphic-inset p-3.5 text-sm text-[#F4F7FB] placeholder-[#64748B] focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Registrar Chamado
          </Button>
        </div>
      </form>
    </Modal>
  );
};

