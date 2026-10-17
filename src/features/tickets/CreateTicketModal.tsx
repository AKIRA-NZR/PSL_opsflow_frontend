import React, { useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useWorkspace } from '../../context/WorkspaceContext';
import type { TicketPriority } from '../../core/types/domain.types';

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (ticketId: string) => void;
}

export const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { tenantCategories, createTicket } = useWorkspace();

  const activeCategories = tenantCategories.filter((c) => c.active);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('MEDIUM');
  const [categoryId, setCategoryId] = useState('');

  useEffect(() => {
    if (isOpen && activeCategories.length > 0 && !categoryId) {
      setCategoryId(activeCategories[0].id);
    }
  }, [isOpen, activeCategories, categoryId]);

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#F1F5F9] block">
            Assunto do chamado
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Liberação de acesso à VPN ou lentidão no sistema"
            className="w-full rounded-xl bg-[#13161C] border border-[#2A3140] px-3.5 py-2.5 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#5865F2]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F1F5F9] block">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl bg-[#13161C] border border-[#2A3140] px-3.5 py-2.5 text-sm text-[#F1F5F9] focus:outline-none focus:border-[#5865F2] cursor-pointer"
            >
              {activeCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F1F5F9] block">
              Nível de urgência
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="w-full rounded-xl bg-[#13161C] border border-[#2A3140] px-3.5 py-2.5 text-sm text-[#F1F5F9] focus:outline-none focus:border-[#5865F2] cursor-pointer"
            >
              <option value="LOW">Baixa (Prazo estimado: 72h)</option>
              <option value="MEDIUM">Média (Prazo estimado: 24h)</option>
              <option value="HIGH">Alta (Prazo estimado: 8h)</option>
              <option value="CRITICAL">Crítica (Prazo estimado: 4h)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#F1F5F9] block">
            Descrição detalhada
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Explique o que está acontecendo e informe detalhes que ajudem no atendimento..."
            className="w-full rounded-xl bg-[#13161C] border border-[#2A3140] p-3.5 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#5865F2]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A3140]">
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

