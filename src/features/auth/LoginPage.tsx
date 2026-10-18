import React, { useState } from 'react';
import { Eye, EyeSlash, Fingerprint, Key } from '@phosphor-icons/react';
import { useWorkspace } from '../../context/WorkspaceContext';

const QUICK_PROFILES = [
  { label: 'ADMIN', email: 'kaua.almeida@acme.io' },
  { label: 'TÉCNICO', email: 'marina.costa@acme.io' },
  { label: 'COLABORADOR', email: 'beatriz.ribeiro@acme.io' },
] as const;

export const LoginPage: React.FC = () => {
  const { loginWithEmail } = useWorkspace();

  const [email, setEmail] = useState('kaua.almeida@acme.io');
  const [password, setPassword] = useState('opsflow2026');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithEmail(email);
  };

  const handleQuickLogin = (targetEmail: string) => {
    setEmail(targetEmail);
    loginWithEmail(targetEmail);
  };

  return (
    <div className="bg-[#131313] text-[#e2e2e2] min-h-screen flex flex-col justify-between selection:bg-white selection:text-[#131313]">
      {/* Top Minimal Header */}
      <header className="w-full border-b border-[#444748]/30 bg-[#0e0e0e]">
        <div className="w-full px-5 md:px-10 lg:px-16 h-14 flex items-center justify-between">
          <span className="text-base font-semibold tracking-wider text-white uppercase">
            OPSFLOW
          </span>
          <span className="w-1.5 h-1.5 bg-white inline-block" />
        </div>
      </header>

      {/* Main Architectural Split Grid */}
      <main className="flex-1 flex flex-col justify-center w-full px-5 md:px-10 lg:px-16 py-8">
        <div className="flex flex-col w-full max-w-6xl mx-auto my-auto">
          <section className="w-full grid grid-cols-1 lg:grid-cols-12 border border-[#444748]/35">
            {/* Left Column (7 cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between p-6 md:p-8 lg:p-10 bg-[#0e0e0e] border-b lg:border-b-0 lg:border-r border-[#444748]/35">
              <div>
                <h1 className="text-3xl md:text-5xl text-white tracking-tight leading-[1.08] uppercase font-medium">
                  GESTÃO DE ATIVOS &amp; OPERAÇÕES EM ESCALA
                </h1>
              </div>

              <div className="relative w-full my-6 overflow-hidden bg-[#131313] border border-[#444748]/35">
                <div
                  className="w-full h-64 md:h-72 lg:h-80 bg-cover bg-center grayscale contrast-125 brightness-90 hover:scale-[1.01] transition-transform duration-700 ease-out"
                  style={{
                    backgroundImage:
                      "url('https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80')",
                  }}
                />
              </div>

              <div className="flex items-center justify-between pt-4 text-[#8e9192] font-mono text-[10px] border-t border-[#444748]/35 uppercase tracking-[0.16em]">
                <span>CONSOLE OPERACIONAL</span>
                <span>SLA · CHAMADOS · GOVERNANÇA</span>
              </div>
            </div>

            {/* Right Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between p-6 md:p-8 lg:p-10 bg-[#131313]">
              <div>
                <h2 className="text-2xl md:text-3xl text-white tracking-tight uppercase font-medium">
                  ACESSAR PLATAFORMA
                </h2>

                <form
                  onSubmit={handleSubmit}
                  className="mt-6 flex flex-col space-y-4"
                >
                  <div className="flex flex-col space-y-1.5">
                    <label
                      htmlFor="corporate-email"
                      className="font-mono text-[10px] text-[#8e9192] uppercase tracking-[0.16em]"
                    >
                      E-MAIL CORPORATIVO
                    </label>
                    <input
                      id="corporate-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="operador@corporativo.com"
                      className="w-full bg-[#0e0e0e] text-white text-sm px-3.5 py-2.5 placeholder:text-[#444748] focus:outline-none focus:border-white border border-[#444748]/45 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="access-key"
                        className="font-mono text-[10px] text-[#8e9192] uppercase tracking-[0.16em]"
                      >
                        CHAVE DE ACESSO / SENHA
                      </label>
                      <span className="font-mono text-[10px] text-[#8e9192] uppercase tracking-[0.14em]">
                        [ DEMO ]
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        id="access-key"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full bg-[#0e0e0e] text-white text-sm px-3.5 py-2.5 pr-10 placeholder:text-[#444748] focus:outline-none focus:border-white border border-[#444748]/45 transition-colors"
                      />
                      <button
                        type="button"
                        aria-label="Alternar visibilidade de senha"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 text-[#8e9192] hover:text-white transition-colors p-1 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeSlash className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 px-5 bg-white text-[#131313] font-mono text-[11px] uppercase tracking-[0.14em] hover:bg-[#c6c6c6] transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <span className="font-bold">ACESSAR CONSOLE</span>
                      <span className="group-hover:translate-x-1 transition-transform">
                        [ → ]
                      </span>
                    </button>
                  </div>
                </form>

                {/* Quick Profile Access */}
                <div className="relative my-6 flex items-center justify-center">
                  <div className="w-full h-px bg-[#444748]/35" />
                  <span className="absolute bg-[#131313] px-3 font-mono text-[9px] text-[#8e9192] uppercase tracking-[0.16em]">
                    ACESSO RÁPIDO POR PERFIL
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {QUICK_PROFILES.map((item) => {
                    const isSelected = email.toLowerCase() === item.email;
                    return (
                      <button
                        key={item.email}
                        type="button"
                        onClick={() => handleQuickLogin(item.email)}
                        className={`py-2.5 px-2 font-mono text-[10px] uppercase tracking-[0.12em] border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#2a2a2a] text-white border-white/60'
                            : 'bg-[#1b1b1b] text-[#c4c7c8] hover:bg-[#242424] hover:text-white border-[#444748]/40'
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(email)}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-[#1b1b1b] text-[#c4c7c8] hover:bg-[#242424] hover:text-white border border-[#444748]/35 transition-colors cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5 text-[#8e9192]" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em]">
                      SAML 2.0 SSO
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin(email)}
                    className="flex items-center justify-center gap-2 py-2 px-3 bg-[#1b1b1b] text-[#c4c7c8] hover:bg-[#242424] hover:text-white border border-[#444748]/35 transition-colors cursor-pointer"
                  >
                    <Fingerprint className="w-3.5 h-3.5 text-[#8e9192]" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em]">
                      PASSKEY FIDO2
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#444748]/30 py-3.5 bg-[#0e0e0e]">
        <div className="w-full px-5 md:px-10 lg:px-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 font-mono text-[9px] text-[#8e9192] uppercase tracking-[0.16em]">
          <div className="flex items-center gap-2">
            <span>OPSFLOW © 2026</span>
            <span className="text-[#444748]">—</span>
            <span>INFRAESTRUTURA &amp; ATIVOS CORPORATIVOS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
