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
    <div className="space-y-5">
      {/* Reply Box */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl glass-panel p-5 space-y-3.5 transition-colors"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <ChatText className="w-4 h-4 text-zinc-400" weight="duotone" />
            Responder
          </span>

          {activeRole !== 'EMPLOYEE' && (
            <label className="inline-flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded border-white/20 bg-black/40"
              />
              <span className="inline-flex items-center gap-1.5 text-zinc-300 font-medium">
                <LockKey className="w-3.5 h-3.5 text-zinc-400" weight="duotone" />
                Nota interna
              </span>
            </label>
          )}
        </div>

        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            isInternal ? 'Anotação interna da equipe...' : 'Escreva uma resposta...'
          }
          className="w-full rounded-xl neumorphic-inset p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all"
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!content.trim()}
            icon={<PaperPlaneRight className="w-3.5 h-3.5" weight="fill" />}
          >
            {isInternal ? 'Salvar Nota' : 'Enviar'}
          </Button>
        </div>
      </form>

      {/* Tabs: Conversation vs History */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-2.5">
          <button
            type="button"
            onClick={() => setTab('comments')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              tab === 'comments'
                ? 'tactile-surface text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Mensagens ({comments.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('history')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              tab === 'history'
                ? 'tactile-surface text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Histórico ({history.length})
          </button>
        </div>

        {tab === 'comments' ? (
          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="rounded-2xl glass-panel p-8 text-center text-sm text-zinc-500">
                Sem mensagens.
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
                    className="rounded-2xl glass-panel p-5 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full neumorphic-inset text-[11px] font-medium text-zinc-200 flex items-center justify-center">
                          {getInitials(author?.name || 'Usuário')}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-100">
                            {author?.name || 'Usuário'}
                          </span>
                          <RolePill role={primaryRole} />
                          {c.internal && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium glass-pill bg-white/[0.04] text-zinc-300 border-white/10">
                              <LockKey className="w-3 h-3 text-zinc-400" weight="fill" />
                              Interna
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-zinc-500">
                        {formatDateTime(c.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
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
                    <div className="text-zinc-200 font-medium">
                      {h.summary}{' '}
                      <span className="text-zinc-400 font-normal">
                        por {actor?.name || 'Sistema'}
                      </span>
                    </div>
                    {h.detail && (
                      <div className="text-xs text-zinc-500 mt-0.5">
                        {h.detail}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-zinc-500 shrink-0">
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
