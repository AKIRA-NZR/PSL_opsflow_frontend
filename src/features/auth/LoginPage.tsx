import React, { useState } from 'react';
import {
  ArrowRight,
  LockKey,
  ShieldStar,
  UserCircle,
  Wrench,
} from '@phosphor-icons/react';
import { Button } from '../../components/ui/Button';
import { OpsFlowLogo } from '../../components/ui/OpsFlowLogo';
import { ToastContainer } from '../../components/ui/ToastContainer';
import { useWorkspace } from '../../context/WorkspaceContext';

const QUICK_PROFILES = [
  {
    roleLabel: 'Admin',
    name: 'Kauã',
    email: 'kaua.almeida@acme.io',
    icon: <ShieldStar className="w-4 h-4 text-zinc-300" weight="duotone" />,
  },
  {
    roleLabel: 'Técnico',
    name: 'Marina',
    email: 'marina.costa@acme.io',
    icon: <Wrench className="w-4 h-4 text-zinc-300" weight="duotone" />,
  },
  {
    roleLabel: 'Colaborador',
    name: 'Beatriz',
    email: 'beatriz.ribeiro@acme.io',
    icon: <UserCircle className="w-4 h-4 text-zinc-300" weight="duotone" />,
  },
];

export const LoginPage: React.FC = () => {
  const { loginWithEmail } = useWorkspace();
  const [email, setEmail] = useState('kaua.almeida@acme.io');
  const [password, setPassword] = useState('••••••••••••');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithEmail(email);
  };

  return (
    <div className="min-h-screen w-full spatial-canvas text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl glass-panel p-7 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <OpsFlowLogo size={38} />
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight">
              OpsFlow
            </h1>
            <p className="text-xs text-zinc-400">Service Desk & Operações</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              E-mail
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nome@empresa.com"
              className="w-full rounded-xl neumorphic-inset px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 block">
              Senha
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl neumorphic-inset px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none transition-all"
              />
              <LockKey
                className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2"
                weight="duotone"
              />
            </div>
          </div>

          <div className="pt-1">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center py-2.5"
              icon={<ArrowRight className="w-4 h-4" weight="bold" />}
            >
              Entrar
            </Button>
          </div>
        </form>

        {/* Compact 1-Click Role Switcher */}
        <div className="pt-5 border-t border-white/[0.08] space-y-2.5">
          <span className="text-[11px] font-medium text-zinc-500 block">
            Acesso rápido por perfil
          </span>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_PROFILES.map((prof) => {
              const isSelected =
                email.toLowerCase() === prof.email.toLowerCase();
              return (
                <button
                  key={prof.email}
                  type="button"
                  onClick={() => {
                    setEmail(prof.email);
                    loginWithEmail(prof.email);
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'tactile-surface border-white/25 text-white'
                      : 'neumorphic-inset text-zinc-400 hover:text-zinc-100 hover:border-white/15'
                  }`}
                >
                  {prof.icon}
                  <span className="text-xs font-medium text-zinc-100">
                    {prof.roleLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};



