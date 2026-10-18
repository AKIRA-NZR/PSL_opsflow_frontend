import React, { useMemo, useState } from 'react';
import { Check, Eye, EyeSlash, Key, Lock, WarningCircle } from '@phosphor-icons/react';
import { Button } from '@opsflow/ui';
import { useWorkspace } from '@entities/session';

export const ProfileSecuritySection: React.FC = () => {
  const { changePassword } = useWorkspace();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Password Entropy Calculation
  const strengthMetrics = useMemo(() => {
    const hasMinLength = newPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

    let score = 0;
    if (hasMinLength) score++;
    if (hasUpper && hasLower) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;

    const levels = [
      { label: 'Muito Fraca', color: 'bg-status-coral', text: 'text-status-coral' },
      { label: 'Fraca', color: 'bg-status-coral', text: 'text-status-coral' },
      { label: 'Média', color: 'bg-status-amber', text: 'text-status-amber' },
      { label: 'Boa', color: 'bg-status-sky', text: 'text-status-sky' },
      { label: 'Forte / Excelente', color: 'bg-status-sage', text: 'text-status-sage' },
    ];

    return {
      score,
      hasMinLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
      level: levels[score],
    };
  }, [newPassword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('A confirmação não coincide com a nova senha.');
      return;
    }

    if (strengthMetrics.score < 2) {
      setErrorMsg('A nova senha é fraca demais. Inclua números, letras e caracteres especiais.');
      return;
    }

    const ok = changePassword(currentPassword, newPassword);
    if (ok) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-7 space-y-6">
      <div className="flex items-center justify-between border-b border-[#444748]/35 pb-4">
        <div className="flex items-center gap-2.5">
          <Key className="w-5 h-5 text-status-amber" weight="duotone" />
          <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-[0.12em]">
            SEGURANÇA &amp; MUDANÇA DE SENHA
          </h2>
        </div>
        <span className="font-mono text-[10px] text-content-muted">
          PADRÃO NIST 800-63B
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Senha Atual */}
        <div className="space-y-1.5">
          <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-muted block">
            SENHA ATUAL
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Digite sua senha atual..."
              className="w-full neumorphic-inset px-3.5 py-2.5 pr-10 text-sm text-white placeholder-content-muted focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-content-muted hover:text-white p-1 cursor-pointer"
            >
              {showPassword ? <EyeSlash className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Nova Senha */}
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-muted block">
              NOVA SENHA
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres..."
              className="w-full neumorphic-inset px-3.5 py-2.5 text-sm text-white placeholder-content-muted focus:outline-none transition-colors"
            />
          </div>

          {/* Confirmar Nova Senha */}
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-muted block">
              CONFIRMAR NOVA SENHA
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha..."
              className="w-full neumorphic-inset px-3.5 py-2.5 text-sm text-white placeholder-content-muted focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Dynamic Entropy / Strength Meter */}
        {newPassword && (
          <div className="p-4 bg-surface-lowest border border-[#444748]/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-content-muted uppercase tracking-wider text-[10px]">
                FORÇA DA SENHA:
              </span>
              <span className={`font-bold ${strengthMetrics.level.text}`}>
                {strengthMetrics.level.label}
              </span>
            </div>

            {/* 4 Segment Progress Bar */}
            <div className="grid grid-cols-4 gap-1.5">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-1.5 rounded-none transition-all duration-300 ${
                    strengthMetrics.score >= step
                      ? strengthMetrics.level.color
                      : 'bg-[#242424]'
                  }`}
                />
              ))}
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono pt-1">
              <div
                className={`flex items-center gap-1.5 ${
                  strengthMetrics.hasMinLength ? 'text-status-sage' : 'text-content-muted'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>8+ caracteres</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  strengthMetrics.hasUpper && strengthMetrics.hasLower
                    ? 'text-status-sage'
                    : 'text-content-muted'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>Maiúsc./Minúsc.</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  strengthMetrics.hasNumber ? 'text-status-sage' : 'text-content-muted'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>Números</span>
              </div>
              <div
                className={`flex items-center gap-1.5 ${
                  strengthMetrics.hasSpecial ? 'text-status-sage' : 'text-content-muted'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>Símbolo especial</span>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-2 p-3 bg-[#291518] border border-[#452126] text-status-coral text-xs">
            <WarningCircle className="w-4 h-4 shrink-0" weight="fill" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#444748]/35">
          {isSuccess && (
            <span className="inline-flex items-center gap-1.5 text-xs text-status-sage font-mono">
              <Check className="w-4 h-4" weight="bold" />
              Senha alterada com sucesso!
            </span>
          )}
          <Button
            type="submit"
            variant="primary"
            icon={<Lock className="w-4 h-4" weight="bold" />}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            Atualizar Senha
          </Button>
        </div>
      </form>
    </div>
  );
};

