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
        className={`glass-panel p-5 space-y-3.5 transition-colors ${
          isInternal && activeRole !== 'EMPLOYEE'
            ? 'border-[#42351b] bg-[#1c170d]'
            : ''
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white flex items-center gap-2">
            <ChatText className="w-4 h-4 text-[#7dd3fc]" />
            RESPONDER
          </span>

          {activeRole !== 'EMPLOYEE' && (
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
          )}
        </div>

        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            isInternal ? 'Anotação interna da equipe...' : 'Escreva uma resposta...'
          }
          className="w-full neumorphic-inset p-3.5 text-sm text-white placeholder-[#8e9192] focus:outline-none transition-colors"
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
                const primaryRole = author?.roles.includes('ADMIN')
                  ? 'ADMIN'
                  : author?.roles.includes('TECHNICIAN')
                    ? 'TECHNICIAN'
                    : 'EMPLOYEE';

                return (
                  <div
                    key={c.id}
                    className={`glass-panel p-5 space-y-2.5 ${
                      c.internal ? 'border-[#42351b] bg-[#1c170d]' : ''
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-[#242424] border border-[#444748]/60 text-[10px] font-mono text-white flex items-center justify-center">
                          {getInitials(author?.name || 'Usuário')}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {author?.name || 'Usuário'}
                          </span>
                          <RolePill role={primaryRole} />
                          {c.internal && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#292112] text-[#fcd34d] border border-[#42351b]">
                              <LockKey className="w-3 h-3" weight="fill" />
                              Interna
                            </span>
                          )}
                        </div>
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
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
                >
                  <div>
                    <div className="text-[#e2e2e2] font-medium">
                      {h.summary}{' '}
                      <span className="text-[#8e9192] font-normal">
                        por {actor?.name || 'Sistema'}
                      </span>
                    </div>
                    {h.detail && (
                      <div className="text-xs text-[#8e9192] mt-0.5">
                        {h.detail}
                      </div>
                    )}
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
