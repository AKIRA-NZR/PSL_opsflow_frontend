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
    <Modal isOpen={isOpen} onClose={onClose} title="Resolver Chamado">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192] block">
            SOLUÇÃO APLICADA
          </label>
          <textarea
            rows={4}
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Descreva o que foi feito para solucionar o chamado..."
            className="w-full neumorphic-inset p-3.5 text-sm text-white placeholder-[#8e9192] focus:outline-none transition-colors"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#444748]/35">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Confirmar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
