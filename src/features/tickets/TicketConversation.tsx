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
        className={`rounded-2xl border p-5 space-y-4 transition-colors ${
          isInternal && activeRole !== 'EMPLOYEE'
            ? 'bg-amber-500/8 border-amber-500/30'
            : 'bg-[#1B202B] border-[#2A3140]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-[#F1F5F9] flex items-center gap-2">
            <ChatText className="w-4 h-4 text-[#93C5FD]" weight="duotone" />
            Adicionar resposta
          </span>

          {activeRole !== 'EMPLOYEE' && (
            <label className="inline-flex items-center gap-2 text-xs text-[#94A3B8] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded border-[#2A3140] bg-[#13161C]"
              />
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-medium">
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
          className="w-full rounded-xl bg-[#13161C] border border-[#2A3140] p-3.5 text-sm text-[#F1F5F9] placeholder-[#64748B] focus:outline-none focus:border-[#5865F2]"
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
        <div className="flex items-center gap-2 border-b border-[#2A3140] pb-3">
          <button
            type="button"
            onClick={() => setTab('comments')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              tab === 'comments'
                ? 'bg-[#232936] text-[#F1F5F9]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            Mensagens ({comments.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('history')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
              tab === 'history'
                ? 'bg-[#232936] text-[#F1F5F9]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            Histórico de Andamento ({history.length})
          </button>
        </div>

        {tab === 'comments' ? (
          <div className="space-y-3.5">
            {comments.length === 0 ? (
              <div className="rounded-2xl bg-[#1B202B] border border-[#2A3140] p-8 text-center text-sm text-[#64748B]">
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
                    className={`rounded-2xl border p-5 space-y-3 ${
                      c.internal
                        ? 'bg-amber-500/8 border-amber-500/25'
                        : 'bg-[#1B202B] border-[#2A3140]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#232936] border border-[#2F3747] text-xs font-medium text-[#F1F5F9] flex items-center justify-center">
                          {getInitials(author?.name || 'Usuário')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#F1F5F9]">
                              {author?.name || 'Usuário'}
                            </span>
                            <RolePill role={primaryRole} />
                            {c.internal && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
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
          <div className="rounded-2xl bg-[#1B202B] border border-[#2A3140] divide-y divide-[#2A3140]/70">
            {history.map((h) => {
              const actor = users.find((u) => u.id === h.actorId);
              return (
                <div
                  key={h.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
                >
                  <div>
                    <div className="text-[#F1F5F9] font-medium">
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
