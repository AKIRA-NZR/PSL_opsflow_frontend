import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import App from '../App';

afterEach(() => {
  cleanup();
});

describe('OpsFlow Frontend Integration & Regression Suite', () => {
  it('1. Renders Atelier Monolith LoginPage and authenticates via quick profile buttons', () => {
    render(<App />);

    expect(
      screen.getByText(/GESTÃO DE ATIVOS & OPERAÇÕES EM ESCALA/i)
    ).toBeTruthy();
    expect(screen.getByText(/ACESSAR PLATAFORMA/i)).toBeTruthy();

    const adminBtn = screen.getByRole('button', { name: 'ADMIN' });
    fireEvent.click(adminBtn);

    expect(screen.getByRole('heading', { name: /Visão Geral/i })).toBeTruthy();
  });

  it('2. Navigates across all Sidebar sections without broken states', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'ADMIN' }));

    const mainNav = screen.getByRole('navigation', {
      name: /Navegação principal/i,
    });
    const adminNav = screen.getByRole('navigation', { name: /Gestão/i });

    fireEvent.click(within(mainNav).getByTitle('Chamados'));
    expect(screen.getByRole('heading', { name: /^Chamados$/i })).toBeTruthy();

    fireEvent.click(within(mainNav).getByTitle('Atribuídos'));
    expect(
      screen.getByRole('heading', { name: /Atribuídos a mim/i })
    ).toBeTruthy();

    fireEvent.click(within(mainNav).getByTitle('SLA Crítico'));
    expect(screen.getByRole('heading', { name: /SLA Crítico/i })).toBeTruthy();

    fireEvent.click(within(adminNav).getByTitle('Categorias'));
    expect(screen.getByRole('heading', { name: /Categorias/i })).toBeTruthy();

    fireEvent.click(within(adminNav).getByTitle('Equipe'));
    expect(screen.getByRole('heading', { name: /Equipe/i })).toBeTruthy();

    fireEvent.click(within(adminNav).getByTitle('Atividades'));
    expect(screen.getByRole('heading', { name: /Atividades/i })).toBeTruthy();

    fireEvent.click(within(mainNav).getByTitle('Visão Geral'));
    expect(screen.getByRole('heading', { name: /Visão Geral/i })).toBeTruthy();
  });

  it('3. Elevates Status and Priority dropdowns to top z-index layer (z-50) and filters tickets', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'ADMIN' }));

    const mainNav = screen.getByRole('navigation', {
      name: /Navegação principal/i,
    });
    fireEvent.click(within(mainNav).getByTitle('Chamados'));

    const statusTrigger = screen.getByRole('button', {
      name: /^Status$/i,
    });
    const dropdownWrapper = statusTrigger.parentElement;
    expect(dropdownWrapper?.className).toContain('z-10');

    // Open Status dropdown -> wrapper must elevate to z-50 so it never renders behind TicketTable
    fireEvent.click(statusTrigger);
    expect(dropdownWrapper?.className).toContain('z-50');

    const openOption = screen.getByRole('button', { name: /^Aberto$/i });
    fireEvent.click(openOption);

    const clearBtn = screen.getByRole('button', { name: /Limpar/i });
    expect(clearBtn).toBeTruthy();
    fireEvent.click(clearBtn);
  });

  it('4. Restricts Employee role to Meus Chamados and hides Gestão navigation', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'COLABORADOR' }));

    expect(
      screen.getByRole('heading', { name: /Meus Chamados/i })
    ).toBeTruthy();
    expect(screen.queryByRole('navigation', { name: /Gestão/i })).toBeNull();
  });
});
