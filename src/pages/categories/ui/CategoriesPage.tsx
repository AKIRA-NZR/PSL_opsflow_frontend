import React, { useState } from 'react';
import { Archive, Folders, Plus } from '@phosphor-icons/react';
import { Button, Modal } from '@opsflow/ui';
import { useWorkspace } from '@entities/session';

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
            icon={<Plus className="w-3.5 h-3.5" weight="bold" />}
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
              className="glass-panel p-5 flex flex-col justify-between gap-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#14222e] border border-[#223a4e] text-[#7dd3fc]">
                    <Folders className="w-4 h-4" weight="fill" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {cat.name}
                    </h3>
                    <span className="font-mono text-[10px] text-[#8e9192]">
                      {linkedTickets} chamado(s)
                    </span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider border ${
                    cat.active
                      ? 'bg-[#12261e] text-[#6ee7b7] border-[#1d3d31]'
                      : 'bg-[#1b1b1b] text-[#8e9192] border-[#2e2e2e]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 ${
                      cat.active ? 'bg-[#34d399]' : 'bg-[#8e9192]'
                    }`}
                  />
                  {cat.active ? 'Ativa' : 'Pausada'}
                </span>
              </div>

              {activeRole === 'ADMIN' && (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#444748]/35">
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
                    icon={<Archive className="w-3.5 h-3.5" />}
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
            <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e9192] block">
              NOME
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Infraestrutura"
              className="w-full neumorphic-inset px-3.5 py-2.5 text-sm text-white placeholder-[#8e9192] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-[#444748]/35">
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
