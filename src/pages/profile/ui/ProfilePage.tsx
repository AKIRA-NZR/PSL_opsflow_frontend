import React, { useState } from 'react';
import { IdentificationCard, Key, Palette } from '@phosphor-icons/react';
import { ProfileDataSection } from './components/ProfileDataSection';
import { ProfileHeaderEdgeBleed } from './components/ProfileHeaderEdgeBleed';
import { ProfileSecuritySection } from './components/ProfileSecuritySection';
import { ProfileThemeSandbox } from './components/ProfileThemeSandbox';

type ProfileTab = 'data' | 'security' | 'theme';

export const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('data');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 1. Header with Edge-Bleed Scaling and Blur-Up Avatar */}
      <ProfileHeaderEdgeBleed />

      {/* 2. Section Tabs */}
      <div className="flex items-center gap-2 border-b border-[#444748]/35 pb-2.5 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] border transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'data'
              ? 'bg-surface-interactive text-white border-white'
              : 'bg-transparent text-content-muted border-transparent hover:text-white hover:bg-surface-lowest'
          }`}
        >
          <IdentificationCard className="w-4 h-4" />
          <span>Dados do Usuário</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] border transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-surface-interactive text-white border-white'
              : 'bg-transparent text-content-muted border-transparent hover:text-white hover:bg-surface-lowest'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Segurança &amp; Senha</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('theme')}
          className={`flex items-center gap-2 px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] border transition-colors cursor-pointer whitespace-nowrap ${
            activeTab === 'theme'
              ? 'bg-surface-interactive text-white border-white'
              : 'bg-transparent text-content-muted border-transparent hover:text-white hover:bg-surface-lowest'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Tema &amp; Sandbox</span>
        </button>
      </div>

      {/* 3. Tab Content */}
      <div className="transition-all duration-200">
        {activeTab === 'data' && <ProfileDataSection />}
        {activeTab === 'security' && <ProfileSecuritySection />}
        {activeTab === 'theme' && <ProfileThemeSandbox />}
      </div>
    </div>
  );
};
