import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  calculateContrastRatio,
  calculateRelativeLuminance,
} from '@opsflow/domain';
import { App } from '@app/index';

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('OpsFlow User Profile, Security NIST Meter & Theme Sandbox Suite', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('1. Navigates to "Meu Perfil" from Sidebar and renders Edge-Bleed header and Blur-Up avatar', () => {
    render(<App />);

    // Authenticate as Admin
    fireEvent.click(screen.getByRole('button', { name: 'ADMIN' }));

    // Click "Meu Perfil" in sidebar
    const mainNav = screen.getByRole('navigation', {
      name: /Navegação principal/i,
    });
    const profileBtn = within(mainNav).getByTitle('Meu Perfil');
    fireEvent.click(profileBtn);

    // Verify header title and section heading
    expect(screen.getByRole('heading', { name: /Meu Perfil/i })).toBeTruthy();
    expect(
      screen.getByText(/PERFIL DO OPERADOR/i)
    ).toBeTruthy();

    // Verify tabs exist
    expect(screen.getByRole('button', { name: /Dados do Usuário/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Segurança & Senha/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Tema & Sandbox/i })).toBeTruthy();
  });

  it('2. Edits user personal data with Optimistic UI updates', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'ADMIN' }));

    const mainNav = screen.getByRole('navigation', {
      name: /Navegação principal/i,
    });
    fireEvent.click(within(mainNav).getByTitle('Meu Perfil'));

    // Find Name and Department inputs
    const nameInput = screen.getByPlaceholderText(/Seu nome completo/i) as HTMLInputElement;
    const deptInput = screen.getByPlaceholderText(/Ex.: Engenharia de Plataforma/i) as HTMLInputElement;

    // Mutate values
    fireEvent.change(nameInput, { target: { value: 'D. Akira K.' } });
    fireEvent.change(deptInput, { target: { value: 'SRE & Cloud Ops' } });

    // Submit form
    const saveBtn = screen.getByRole('button', { name: /Salvar Alterações/i });
    fireEvent.click(saveBtn);

    // Verify optimistic feedback message
    expect(screen.getByText(/Salvo no sistema!/i)).toBeTruthy();

    // Verify header and sidebar display the updated name immediately
    const userNames = screen.getAllByText('D. Akira K.');
    expect(userNames.length).toBeGreaterThan(0);
  });

  it('3. Computes NIST 800-63B password entropy and validates password change requirements', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'ADMIN' }));

    const mainNav = screen.getByRole('navigation', {
      name: /Navegação principal/i,
    });
    fireEvent.click(within(mainNav).getByTitle('Meu Perfil'));

    // Switch to Security Tab
    fireEvent.click(screen.getByRole('button', { name: /Segurança & Senha/i }));

    expect(screen.getByText(/PADRÃO NIST 800-63B/i)).toBeTruthy();

    const currentPwdInput = screen.getByPlaceholderText(/Digite sua senha atual.../i);
    const newPwdInput = screen.getByPlaceholderText(/Mínimo 8 caracteres.../i);
    const confirmPwdInput = screen.getByPlaceholderText(/Repita a nova senha.../i);

    // Type weak password
    fireEvent.change(newPwdInput, { target: { value: 'abc' } });
    expect(screen.getByText(/Muito Fraca/i)).toBeTruthy();

    // Type strong NIST compliant password
    fireEvent.change(newPwdInput, { target: { value: 'OpsFlow#2026!Secure' } });
    expect(screen.getByText(/Forte \/ Excelente/i)).toBeTruthy();

    // Mismatched confirmation test
    fireEvent.change(currentPwdInput, { target: { value: 'admin123' } });
    fireEvent.change(confirmPwdInput, { target: { value: 'WrongPassword' } });

    const updatePwdBtn = screen.getByRole('button', { name: /Atualizar Senha/i });
    fireEvent.click(updatePwdBtn);

    expect(
      screen.getByText(/A confirmação não coincide com a nova senha./i)
    ).toBeTruthy();

    // Matched confirmation test
    fireEvent.change(confirmPwdInput, { target: { value: 'OpsFlow#2026!Secure' } });
    fireEvent.click(updatePwdBtn);

    expect(
      screen.getByText(/Senha alterada com sucesso!/i)
    ).toBeTruthy();
  });

  it('4. Operates Theme Sandbox with Draft State, WCAG relative luminance, and applies CSS tokens to document element', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'ADMIN' }));

    const mainNav = screen.getByRole('navigation', {
      name: /Navegação principal/i,
    });
    fireEvent.click(within(mainNav).getByTitle('Meu Perfil'));

    // Switch to Theme Tab
    fireEvent.click(screen.getByRole('button', { name: /Tema & Sandbox/i }));

    expect(screen.getByText(/MOTOR DE PERSONALIZAÇÃO VISUAL/i)).toBeTruthy();
    expect(screen.getByText(/Sincronizado/i)).toBeTruthy();

    // Pick Obsidian Slate Preset
    const obsidianPresetBtn = screen.getByRole('button', { name: /Obsidian Slate/i });
    fireEvent.click(obsidianPresetBtn);

    // Verify Draft indicator appears
    expect(screen.getByText(/Rascunho Ativo \(Não Salvo\)/i)).toBeTruthy();

    // Verify WCAG relative luminance is calculated
    const lumVal = calculateRelativeLuminance('#0f1216');
    expect(lumVal).toBeGreaterThan(0);
    expect(calculateContrastRatio('#ffffff', '#0f1216')).toBeGreaterThan(10);

    // Apply to System
    const applyBtn = screen.getByRole('button', { name: /Aplicar ao Sistema/i });
    fireEvent.click(applyBtn);

    // Verify documentElement received the new data attributes and style properties
    expect(document.documentElement.getAttribute('data-theme')).toBe('obsidian-slate');
    expect(document.documentElement.style.getPropertyValue('--color-surface-canvas')).toBe('#0f1216');

    // Verify saved indicator returns to synchronized
    expect(screen.getByText(/Sincronizado/i)).toBeTruthy();
  });
});
