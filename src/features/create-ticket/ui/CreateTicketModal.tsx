import React, { useEffect, useMemo, useState } from 'react';
import { Folders } from '@phosphor-icons/react';
import { PRIORITY_LABELS, type TicketPriority } from '@opsflow/domain';
import {
  Button,
  DropdownSelect,
  Modal,
  type DropdownOption,
} from '@opsflow/ui';
import { PrioritySignalIcon } from '@entities/ticket';
import { useWorkspace } from '@entities/session';

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
        icon: <Folders className="w-4 h-4 text-[#7dd3fc]" weight="duotone" />,
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
          <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192] block">
            ASSUNTO
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Assunto do chamado..."
            className="w-full neumorphic-inset px-3.5 py-2.5 text-sm text-white placeholder-[#8e9192] focus:outline-none transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192] block">
            CATEGORIA
          </label>
          <DropdownSelect
            value={categoryId}
            options={categoryOptions}
            onChange={setCategoryId}
          />
        </div>

        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192] block">
            PRIORIDADE
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRIORITIES.map((p) => {
              const isSelected = priority === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-2 border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#242424] border-white text-white'
                      : 'bg-[#0e0e0e] border-[#444748]/45 hover:border-[#8e9192] text-[#c4c7c8]'
                  }`}
                >
                  <PrioritySignalIcon priority={p} />
                  <span className="text-xs font-medium">
                    {PRIORITY_LABELS[p]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192] block">
            DESCRIÇÃO
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalhes..."
            className="w-full neumorphic-inset p-3.5 text-sm text-white placeholder-[#8e9192] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#444748]/35">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Criar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
