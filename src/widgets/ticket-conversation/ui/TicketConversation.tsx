import React, { useState } from 'react';
import { LockKey, PaperPlaneRight } from '@phosphor-icons/react';
import {
  formatDateTime,
  getInitials,
  type RoleName,
  type TicketComment,
  type TicketHistoryItem,
  type User,
} from '@opsflow/domain';
import { Button } from '@opsflow/ui';

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
      <form
        onSubmit={handleSubmit}
        className={`glass-panel p-4 space-y-3 transition-colors ${
          isInternal && activeRole !== 'EMPLOYEE'
            ? 'border-[#42351b] bg-[#1c170d]'
            : ''
        }`}
      >
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            isInternal ? 'Nota interna...' : 'Escreva uma mensagem...'
          }
          className="w-full neumorphic-inset p-3 text-sm text-white placeholder-[#8e9192] focus:outline-none transition-colors"
        />

        <div className="flex items-center justify-between gap-2">
          {activeRole !== 'EMPLOYEE' ? (
            <label className="inline-flex items-center gap-2 text-xs text-[#8e9192] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="border-[#444748] bg-[#0e0e0e]"
              />
              <span className="inline-flex items-center gap-1.5 text-[#fcd34d] font-mono text-[10px] uppercase tracking-wider">
                <LockKey className="w-3.5 h-3.5" weight="fill" />
                Nota interna
              </span>
            </label>
          ) : (
            <span />
          )}

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!content.trim()}
            icon={<PaperPlaneRight className="w-3.5 h-3.5" weight="fill" />}
          >
            Enviar
          </Button>
        </div>
      </form>

      <div className="space-y-3.5">
        <div className="flex items-center gap-2 border-b border-[#444748]/35 pb-2.5">
          <button
            type="button"
            onClick={() => setTab('comments')}
            className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] border transition-colors cursor-pointer ${
              tab === 'comments'
                ? 'bg-[#242424] text-white border-[#8e9192]'
                : 'bg-transparent text-[#8e9192] border-transparent hover:text-white'
            }`}
          >
            MENSAGENS ({comments.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('history')}
            className={`px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] border transition-colors cursor-pointer ${
              tab === 'history'
                ? 'bg-[#242424] text-white border-[#8e9192]'
                : 'bg-transparent text-[#8e9192] border-transparent hover:text-white'
            }`}
          >
            HISTÓRICO ({history.length})
          </button>
        </div>

        {tab === 'comments' ? (
          <div className="space-y-3">
            {comments.length === 0 ? (
              <div className="glass-panel p-8 text-center text-xs text-[#8e9192]">
                Sem mensagens.
              </div>
            ) : (
              comments.map((c) => {
                const author = users.find((u) => u.id === c.authorId);

                return (
                  <div
                    key={c.id}
                    className={`glass-panel p-4 space-y-2 ${
                      c.internal ? 'border-[#42351b] bg-[#1c170d]' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[#242424] border border-[#444748]/60 text-[10px] font-mono text-white flex items-center justify-center">
                          {getInitials(author?.name || 'Usuário')}
                        </div>
                        <span className="text-xs font-medium text-white">
                          {author?.name || 'Usuário'}
                        </span>
                        {c.internal && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider bg-[#292112] text-[#fcd34d] border border-[#42351b]">
                            <LockKey className="w-2.5 h-2.5" weight="fill" />
                            Interna
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-[#8e9192]">
                        {formatDateTime(c.createdAt)}
                      </span>
                    </div>

                    <p className="text-sm text-[#e2e2e2] leading-relaxed whitespace-pre-line">
                      {c.content}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="glass-panel divide-y divide-[#444748]/30">
            {history.map((h) => {
              const actor = users.find((u) => u.id === h.actorId);
              return (
                <div
                  key={h.id}
                  className="px-4 py-3 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="text-[#e2e2e2]">
                    {h.summary}{' '}
                    <span className="text-[#8e9192]">
                      · {actor?.name || 'Sistema'}
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-[#8e9192] shrink-0">
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
