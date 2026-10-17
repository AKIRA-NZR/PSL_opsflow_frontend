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
    roleLabel: 'Administrador',
    environment: 'Console de Gestão & Operações',
    name: 'Kauã Almeida',
    email: 'kaua.almeida@acme.io',
    description:
      'Acesso completo ao Dashboard de indicadores, fila de atendimento, gestão de categorias, membros da equipe e registro de atividades.',
    icon: <ShieldStar className="w-5 h-5 text-[#A5B4FC]" weight="duotone" />,
    badgeStyle: 'bg-indigo-500/14 text-[#E0E7FF] border-indigo-400/25',
  },
  {
    roleLabel: 'Técnico de Atendimento',
    environment: 'Console de Operações & Triagem',
    name: 'Marina Costa',
    email: 'marina.costa@acme.io',
    description:
      'Acesso ao Dashboard operacional, recebimento de chamados da fila, notas técnicas internas e resolução de incidentes.',
    icon: <Wrench className="w-5 h-5 text-[#6EE7B7]" weight="duotone" />,
    badgeStyle: 'bg-emerald-500/12 text-[#D1FAE5] border-emerald-400/25',
  },
  {
    roleLabel: 'Colaborador',
    environment: 'Portal do Solicitante',
    name: 'Beatriz Ribeiro',
    email: 'beatriz.ribeiro@acme.io',
    description:
      'Ambiente simplificado para solicitar suporte técnico, interagir com a equipe de atendimento e acompanhar os próprios chamados.',
    icon: <UserCircle className="w-5 h-5 text-[#93C5FD]" weight="duotone" />,
    badgeStyle: 'bg-sky-500/12 text-[#E0F2FE] border-sky-400/25',
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
    <div className="min-h-screen w-full spatial-canvas text-[#F4F7FB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Standard Login Form (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl glass-panel p-7 sm:p-8 space-y-6">
          <div className="flex items-center gap-3.5">
            <OpsFlowLogo size={42} />
            <div>
              <h1 className="text-lg font-semibold text-[#F4F7FB] tracking-tight">
                OpsFlow
              </h1>
              <p className="text-xs text-[#94A3B8]">
                Central de Atendimento e Operações
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-base font-medium text-[#F4F7FB]">
              Acesse sua conta
            </h2>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Entre com seu e-mail corporativo para acessar seu ambiente de trabalho.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#CBD5E1] block">
                E-mail corporativo
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@empresa.com"
                className="w-full rounded-xl neumorphic-inset px-3.5 py-2.5 text-sm text-[#F4F7FB] placeholder-[#64748B] focus:outline-none transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#CBD5E1] block">
                Senha de acesso
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl neumorphic-inset px-3.5 py-2.5 text-sm text-[#F4F7FB] focus:outline-none transition-all"
                />
                <LockKey
                  className="w-4 h-4 text-[#94A3B8] absolute right-3.5 top-1/2 -translate-y-1/2"
                  weight="duotone"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full justify-center py-2.5"
                icon={<ArrowRight className="w-4 h-4" weight="bold" />}
              >
                Entrar na Plataforma
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Role Environment Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="px-1">
            <h3 className="text-sm font-semibold text-[#F4F7FB]">
              Escolha um perfil para acessar rapidamente
            </h3>
            <p className="text-xs text-[#94A3B8] mt-1">
              Cada perfil possui um ambiente dedicado de acordo com sua função na empresa:
            </p>
          </div>

          <div className="space-y-3.5">
            {QUICK_PROFILES.map((prof) => {
              const isSelected = email.toLowerCase() === prof.email.toLowerCase();
              return (
                <div
                  key={prof.email}
                  onClick={() => {
                    setEmail(prof.email);
                    loginWithEmail(prof.email);
                  }}
                  className={`rounded-2xl glass-panel glass-panel-interactive p-5 cursor-pointer group ${
                    isSelected
                      ? 'border-indigo-400/40 bg-indigo-500/[0.06]'
                      : ''
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3.5">
                      <div className="p-2.5 rounded-xl neumorphic-inset">
                        {prof.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#F4F7FB]">
                            {prof.name}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium glass-pill ${prof.badgeStyle}`}
                          >
                            {prof.roleLabel}
                          </span>
                        </div>
                        <div className="text-xs text-[#94A3B8] mt-0.5">
                          {prof.environment} ·{' '}
                          <span className="font-mono text-[#64748B]">
                            {prof.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="px-3 py-1.5 rounded-xl tactile-surface text-xs font-medium text-[#E2E8F0] group-hover:text-white inline-flex items-center gap-1.5 transition-all">
                      Acessar
                      <ArrowRight className="w-3.5 h-3.5" weight="bold" />
                    </span>
                  </div>

                  <p className="text-xs text-[#94A3B8] leading-relaxed mt-3 pl-13">
                    {prof.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};


