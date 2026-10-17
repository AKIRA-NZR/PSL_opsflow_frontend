import React, { useState } from 'react';
import { Archive, Folders, PlusCircle } from '@phosphor-icons/react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { useWorkspace } from '../../context/WorkspaceContext';
import { formatShortDate } from '../../core/utils/date.utils';

export const CategoriesPage: React.FC = () => {
  const {
    activeRole,
    tenantCategories,
    tenantTickets,
    createCategory,
    toggleCategoryStatus,
    archiveCategory,
  } = useWorkspace();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = createCategory({ name, description });
    if (ok) {
      setName('');
      setDescription('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#F1F5F9]">
            Categorias de Atendimento
          </h2>
          <p className="text-sm text-[#94A3B8] mt-0.5">
            Organize as filas de solicitações para direcionar os chamados à equipe correta.
          </p>
        </div>

        {activeRole === 'ADMIN' && (
          <Button
            variant="primary"
            icon={<PlusCircle className="w-4 h-4" weight="fill" />}
            onClick={() => setIsModalOpen(true)}
          >
            Nova Categoria
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tenantCategories.map((cat) => {
          const linkedTickets = tenantTickets.filter(
            (t) => t.categoryId === cat.id
          ).length;

          return (
            <div
              key={cat.id}
              className="rounded-2xl bg-[#1B202B] border border-[#2A3140] p-6 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-[#232936] border border-[#2F3747] text-[#FCD34D]">
                      <Folders className="w-5 h-5" weight="duotone" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#F1F5F9]">
                        {cat.name}
                      </h3>
                      <span className="text-xs text-[#64748B]">
                        Criada em {formatShortDate(cat.createdAt)} · {linkedTickets}{' '}
                        chamado(s)
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      cat.active
                        ? 'bg-emerald-500/12 text-emerald-300 border-emerald-500/25'
                        : 'bg-slate-500/12 text-slate-400 border-slate-500/25'
                    }`}
                  >
                    {cat.active ? 'Ativa' : 'Pausada'}
                  </span>
                </div>

                <p className="text-sm text-[#94A3B8] leading-relaxed pt-1">
                  {cat.description}
                </p>
              </div>

              {activeRole === 'ADMIN' && (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#2A3140]/80">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleCategoryStatus(cat.id)}
                  >
                    {cat.active ? 'Pausar recebimento' : 'Reativar categoria'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Archive className="w-4 h-4" weight="duotone" />}
                    onClick={() => archiveCategory(cat.id)}
                  >
                    Arquivar
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Criar Nova Categoria"
        subtitle="Defina um nome claro e o escopo de solicitações atendidas por esta fila."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F1F5F9] block">
              Nome da categoria
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Infraestrutura e Redes"
              className="w-full rounded-xl bg-[#13161C] border border-[#2A3140] px-3.5 py-2.5 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#5865F2]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#F1F5F9] block">
              Descrição
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva que tipos de demandas devem ser abertas nesta categoria..."
              className="w-full rounded-xl bg-[#13161C] border border-[#2A3140] p-3.5 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#5865F2]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#2A3140]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Criar Categoria
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
