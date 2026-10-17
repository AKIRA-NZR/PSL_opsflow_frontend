import React, { useState } from 'react';
import { ChatText, LockKey, PaperPlaneRight } from '@phosphor-icons/react';
import { RolePill } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import type {
  RoleName,
  TicketComment,
  TicketHistoryItem,
  User,
} from '../../core/types/domain.types';
import { formatDateTime, getInitials } from '../../core/utils/date.utils';

interface TicketConversationProps {
  activeRole: RoleName;
  users: User[];
  comments: TicketComment[];
  history: TicketHistoryItem[];
  onAddComment: (content: string, internal: boolean) => boolean;
}

export const TicketConversation: React.FC<TicketConversationProps> = ({
  activeRole,
  users,
  comments,
  history,
  onAddComment,
}) => {
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [tab, setTab] = useState<'comments' | 'history'>('comments');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = onAddComment(content, isInternal);
    if (ok) {
      setContent('');
      setIsInternal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Reply Box */}
      <form
        onSubmit={handleSubmit}
        className={`rounded-2xl glass-panel p-5 space-y-4 transition-colors ${
          isInternal && activeRole !== 'EMPLOYEE'
            ? 'border-amber-400/35 bg-amber-500/[0.06]'
            : ''
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-[#F4F7FB] flex items-center gap-2">
            <ChatText className="w-4 h-4 text-[#93C5FD]" weight="duotone" />
            Adicionar resposta
          </span>

          {activeRole !== 'EMPLOYEE' && (
            <label className="inline-flex items-center gap-2 text-xs text-[#94A3B8] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded border-white/20 bg-black/40"
              />
              <span className="inline-flex items-center gap-1.5 text-[#FDE68A] font-medium">
                <LockKey className="w-3.5 h-3.5" weight="duotone" />
                Nota interna da equipe (visível apenas para técnicos)
              </span>
            </label>
          )}
        </div>

        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            isInternal
              ? 'Escreva uma anotação técnica interna para a equipe...'
              : 'Escreva uma mensagem ou atualização sobre o chamado...'
          }
          className="w-full rounded-xl neumorphic-inset p-3.5 text-sm text-[#F4F7FB] placeholder-[#64748B] focus:outline-none transition-all"
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            disabled={!content.trim()}
            icon={<PaperPlaneRight className="w-4 h-4" weight="fill" />}
          >
            {isInternal ? 'Salvar Nota Interna' : 'Enviar Mensagem'}
          </Button>
        </div>
      </form>

      {/* Tabs: Conversation vs History */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
          <button
            type="button"
            onClick={() => setTab('comments')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              tab === 'comments'
                ? 'tactile-surface text-[#F4F7FB]'
                : 'text-[#94A3B8] hover:text-[#F4F7FB]'
            }`}
          >
            Mensagens ({comments.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              tab === 'history'
                ? 'tactile-surface text-[#F4F7FB]'
                : 'text-[#94A3B8] hover:text-[#F4F7FB]'
            }`}
          >
            Histórico de Andamento ({history.length})
          </button>
        </div>

        {tab === 'comments' ? (
          <div className="space-y-3.5">
            {comments.length === 0 ? (
              <div className="rounded-2xl glass-panel p-8 text-center text-sm text-[#64748B]">
                Nenhuma mensagem registrada neste chamado ainda.
              </div>
            ) : (
              comments.map((c) => {
                const author = users.find((u) => u.id === c.authorId);
                const primaryRole = author?.roles.includes('ADMIN')
                  ? 'ADMIN'
                  : author?.roles.includes('TECHNICIAN')
                    ? 'TECHNICIAN'
                    : 'EMPLOYEE';

                return (
                  <div
                    key={c.id}
                    className={`rounded-2xl glass-panel p-5 space-y-3 ${
                      c.internal
                        ? 'border-amber-400/30 bg-amber-500/[0.05]'
                        : ''
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full neumorphic-inset text-xs font-medium text-[#F4F7FB] flex items-center justify-center">
                          {getInitials(author?.name || 'Usuário')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#F4F7FB]">
                              {author?.name || 'Usuário'}
                            </span>
                            <RolePill role={primaryRole} />
                            {c.internal && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium glass-pill bg-amber-500/12 text-[#FDE68A] border-amber-400/25">
                                <LockKey className="w-3 h-3" weight="fill" />
                                Nota Interna
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-[#64748B]">
                        {formatDateTime(c.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-[#E2E8F0] leading-relaxed whitespace-pre-line">
                      {c.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="rounded-2xl glass-panel divide-y divide-white/[0.06]">
            {history.map((h) => {
              const actor = users.find((u) => u.id === h.actorId);
              return (
                <div
                  key={h.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
                >
                  <div>
                    <div className="text-[#F4F7FB] font-medium">
                      {h.summary}{' '}
                      <span className="text-[#94A3B8] font-normal">
                        por {actor?.name || 'Sistema'}
                      </span>
                    </div>
                    {h.detail && (
                      <div className="text-xs text-[#94A3B8] mt-0.5">
                        {h.detail}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-[#64748B] shrink-0">
                    {formatDateTime(h.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

