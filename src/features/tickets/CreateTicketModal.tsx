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
        icon: <Folders className="w-4 h-4 text-zinc-400" weight="duotone" />,
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
    <Modal isOpen={isOpen} onClose={onClose} title="Novo Chamado">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300 block">
            Assunto
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Acesso à VPN ou lentidão no sistema"
            className="w-full rounded-xl neumorphic-inset px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300 block">
            Categoria
          </label>
          <DropdownSelect
            value={categoryId}
            options={categoryOptions}
            onChange={setCategoryId}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300 block">
            Prioridade
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRIORITIES.map((p) => {
              const isSelected = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex flex-col items-start gap-1 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'tactile-surface border-white/25 ring-1 ring-white/15'
                      : 'neumorphic-inset hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <PrioritySignalIcon priority={p} />
                    <span className="text-xs font-semibold text-zinc-100">
                      {PRIORITY_LABELS[p]}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    SLA {SLA_HOURS_BY_PRIORITY[p]}h
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-300 block">
            Descrição
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes do chamado..."
            className="w-full rounded-xl neumorphic-inset p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Criar Chamado
          </Button>
        </div>
      </form>
    </Modal>
  );
};
