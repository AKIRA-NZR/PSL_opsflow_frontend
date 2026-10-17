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
    <div className="max-w-6xl mx-auto space-y-5">
      {activeRole === 'ADMIN' && (
        <div className="flex justify-end">
          <Button
            variant="primary"
            size="sm"
            icon={<PlusCircle className="w-4 h-4" weight="fill" />}
            onClick={() => setIsModalOpen(true)}
          >
            Nova Categoria
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tenantCategories.map((cat) => {
          const linkedTickets = tenantTickets.filter(
            (t) => t.categoryId === cat.id
          ).length;

          return (
            <div
              key={cat.id}
              className="rounded-2xl glass-panel p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl neumorphic-inset text-zinc-300">
                      <Folders className="w-4 h-4" weight="duotone" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-zinc-100">
                        {cat.name}
                      </h3>
                      <span className="text-xs text-zinc-500">
                        {formatShortDate(cat.createdAt)} · {linkedTickets}{' '}
                        chamado(s)
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium glass-pill bg-white/[0.04] border-white/[0.09] text-zinc-200">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        cat.active ? 'bg-[#10B981]' : 'bg-zinc-500'
                      }`}
                    />
                    {cat.active ? 'Ativa' : 'Pausada'}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed pt-1">
                  {cat.description}
                </p>
              </div>

              {activeRole === 'ADMIN' && (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => toggleCategoryStatus(cat.id)}
                  >
                    {cat.active ? 'Pausar' : 'Reativar'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Archive className="w-3.5 h-3.5" weight="duotone" />}
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
        title="Nova Categoria"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Nome
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Infraestrutura"
              className="w-full rounded-xl neumorphic-inset px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Descrição
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Escopo da categoria..."
              className="w-full rounded-xl neumorphic-inset p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              Criar
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
