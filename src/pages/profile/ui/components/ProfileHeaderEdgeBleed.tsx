import React, { useState } from 'react';
import { Camera, Check, Image, Trash, X } from '@phosphor-icons/react';
import { BlurUpAvatar, Button, Modal } from '@opsflow/ui';
import { RolePill } from '@entities/user';
import { useWorkspace } from '@entities/session';

const PRESET_AVATARS = [
  {
    id: 'arch-1',
    label: 'Arquiteto',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMmEyYTJhIi8+PC9zdmc+',
  },
  {
    id: 'arch-2',
    label: 'Operador',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMWYyMzI2Ii8+PC9zdmc+',
  },
  {
    id: 'arch-3',
    label: 'Engenheira',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMjcyNzJhIi8+PC9zdmc+',
  },
  {
    id: 'arch-4',
    label: 'Especialista',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMCAxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMWEyMDJjIi8+PC9zdmc+',
  },
];

export const ProfileHeaderEdgeBleed: React.FC = () => {
  const { currentUser, activeCompany, updateUserProfile } = useWorkspace();
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [customUrl, setCustomUrl] = useState('');

  const handleSelectPreset = (url: string, placeholder: string) => {
    updateUserProfile({
      avatarUrl: url,
      avatarBlurPlaceholder: placeholder,
    });
    setIsAvatarModalOpen(false);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (customUrl.trim()) {
      updateUserProfile({
        avatarUrl: customUrl.trim(),
        avatarBlurPlaceholder: undefined,
      });
      setCustomUrl('');
      setIsAvatarModalOpen(false);
    }
  };

  const handleRemoveAvatar = () => {
    updateUserProfile({
      avatarUrl: undefined,
      avatarBlurPlaceholder: undefined,
    });
  };

  return (
    <div className="relative glass-panel overflow-hidden border border-[#444748]/45">
      {/* 1. Edge-Bleed Cover Banner with Scaling Zoom */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-surface-lowest group cursor-default">
        {/* Architectural Grid Texture */}
        <div
          className="absolute inset-0 opacity-25 group-hover:scale-105 transition-transform duration-700 ease-out"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Ambient Radial Accent Glow */}
        <div
          className="absolute -top-12 -right-12 w-96 h-96 rounded-full opacity-20 filter blur-3xl pointer-events-none transition-all duration-700"
          style={{
            backgroundColor: 'var(--color-accent-primary, #6ee7b7)',
          }}
        />

        {/* Edge-Bleed Bottom Gradient Fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-panel via-surface-panel/60 to-transparent" />

        {/* Technical Label Watermark */}
        <div className="absolute top-4 right-5 font-mono text-[9px] text-content-muted uppercase tracking-[0.2em] select-none">
          PERFIL DO OPERADOR // {activeCompany.slug.toUpperCase()}
        </div>
      </div>

      {/* 2. Foreground Profile Info & Blur-Up Avatar Card */}
      <div className="px-6 sm:px-8 pb-6 -mt-16 sm:-mt-20 relative z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
          {/* Avatar with Blur-Up and Online Status */}
          <div className="relative group/avatar">
            <div className="p-1 bg-surface-panel border-2 border-surface-canvas shadow-[0_12px_36px_rgba(0,0,0,0.85)]">
              <BlurUpAvatar
                src={currentUser.avatarUrl}
                blurPlaceholder={currentUser.avatarBlurPlaceholder}
                name={currentUser.name}
                size="xl"
                showStatusIndicator
                className="w-20 h-20 sm:w-24 sm:h-24"
              />
            </div>

            {/* Hover Camera Quick Overlay */}
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="absolute inset-1 bg-black/70 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white text-[10px] font-mono uppercase tracking-wider cursor-pointer"
              title="Trocar foto"
            >
              <Camera className="w-5 h-5 text-content-primary" />
              <span>Trocar</span>
            </button>
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
                {currentUser.name}
              </h1>
              <span className="font-mono text-[10px] px-2 py-0.5 bg-surface-recessed border border-[#444748]/50 text-content-muted">
                {activeCompany.name}
              </span>
            </div>

            <p className="text-xs text-content-muted flex items-center gap-2">
              <span>{currentUser.department}</span>
              <span>·</span>
              <span className="font-mono text-[11px] text-content-subtle">
                {currentUser.email}
              </span>
            </p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {currentUser.roles.map((r) => (
                <RolePill key={r} role={r} />
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2 sm:pt-0 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            icon={<Camera className="w-3.5 h-3.5" />}
            onClick={() => setIsAvatarModalOpen(true)}
          >
            Alterar Foto
          </Button>
          {currentUser.avatarUrl && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash className="w-3.5 h-3.5" />}
              onClick={handleRemoveAvatar}
              title="Remover foto e usar iniciais"
            >
              Remover
            </Button>
          )}
        </div>
      </div>

      {/* Modal for Preset and Custom Avatar Selection */}
      <Modal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        title="Foto de Perfil (Blur-Up & Preloading)"
      >
        <div className="space-y-5">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-muted block mb-2.5">
              GALERIA ATELIER MONOLITH
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = currentUser.avatarUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset.url, preset.placeholder)}
                    className={`relative p-2 border transition-all cursor-pointer text-left flex flex-col items-center gap-2 ${
                      isSelected
                        ? 'bg-surface-interactive border-white text-white'
                        : 'bg-surface-lowest border-[#444748]/45 hover:border-content-muted text-content-subtle'
                    }`}
                  >
                    <div className="w-16 h-16 overflow-hidden bg-surface-recessed border border-[#444748]/40">
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-cover grayscale contrast-125 hover:grayscale-0 transition-all duration-300"
                        loading="lazy"
                      />
                    </div>
                    <span className="font-mono text-[10px] tracking-wider uppercase">
                      {preset.label}
                    </span>
                    {isSelected && (
                      <span className="absolute top-1 right-1 p-0.5 bg-white text-black">
                        <Check className="w-3 h-3" weight="bold" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#444748]/35">
            <form onSubmit={handleApplyCustomUrl} className="space-y-3">
              <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-muted block">
                OU INFORME UMA URL DE IMAGEM EXTERNA
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://exemplo.com/avatar.jpg"
                  className="flex-1 neumorphic-inset px-3.5 py-2 text-xs text-white placeholder-content-muted focus:outline-none"
                />
                <Button type="submit" variant="primary" size="sm" disabled={!customUrl.trim()}>
                  Aplicar
                </Button>
              </div>
            </form>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#444748]/35">
            <Button variant="ghost" onClick={() => setIsAvatarModalOpen(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
