import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

interface ResolveTicketModalProps {
  isOpen: boolean;
  initialSummary?: string | null;
  onClose: () => void;
  onConfirm: (summary: string) => void;
}

export const ResolveTicketModal: React.FC<ResolveTicketModalProps> = ({
  isOpen,
  initialSummary,
  onClose,
  onConfirm,
}) => {
  const [summary, setSummary] = useState(initialSummary || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(summary);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Concluir Atendimento e Resolver Chamado"
      subtitle="Registre a solução aplicada para informar o solicitante e manter o histórico da equipe."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#F1F5F9] block">
            Resumo da solução aplicada
          </label>
          <textarea
            rows={4}
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Descreva de forma clara o que foi feito para solucionar o chamado..."
            className="w-full rounded-xl bg-[#13161C] border border-[#2A3140] p-3.5 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A3140]">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="success">
            Confirmar Resolução
          </Button>
        </div>
      </form>
    </Modal>
  );
};
