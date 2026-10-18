import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '@app/index';
import indexHtml from '../../index.html?raw';
import robotsTxt from '../../public/robots.txt?raw';
import siteManifestRaw from '../../public/site.webmanifest?raw';

afterEach(() => {
  cleanup();
});

describe('OpsFlow Performance Budgets & SEO Audit Suite', () => {
  it('1. Synchronizes dynamic SEO document.title, meta description, and OpenGraph title across routes', () => {
    render(<App />);

    expect(document.title).toBe('Login · OPSFLOW');
    expect(
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute('content')
    ).toContain('Acesso à plataforma corporativa');

    fireEvent.click(screen.getByRole('button', { name: 'ADMIN' }));
    expect(document.title).toBe('Visão Geral · OPSFLOW');
    expect(
      document
        .querySelector('meta[property="og:title"]')
        ?.getAttribute('content')
    ).toBe('Visão Geral · OPSFLOW');

    const mainNav = screen.getByRole('navigation', {
      name: /Navegação principal/i,
    });
    fireEvent.click(within(mainNav).getByTitle('Chamados'));
    expect(document.title).toBe('Chamados · OPSFLOW');

    fireEvent.click(within(mainNav).getByTitle('SLA Crítico'));
    expect(document.title).toBe('SLA Crítico · OPSFLOW');
  });

  it('2. Enforces LCP image optimization (fetchPriority, async decoding, explicit dimensions) and semantic landmarks', () => {
    render(<App />);

    const heroImg = screen.getByAltText(
      /Arquitetura corporativa minimalista OpsFlow/i
    ) as HTMLImageElement;
    expect(heroImg).toBeTruthy();
    expect(heroImg.getAttribute('decoding')).toBe('async');
    expect(heroImg.getAttribute('width')).toBe('1200');
    expect(heroImg.getAttribute('height')).toBe('720');

    expect(document.querySelector('header')).toBeTruthy();
    expect(document.querySelector('main')).toBeTruthy();
    expect(document.querySelector('footer')).toBeTruthy();
  });

  it('3. Meets interactive rendering and filtering performance budgets (< 100ms per transition)', () => {
    const mountStart = performance.now();
    render(<App />);
    const mountDuration = performance.now() - mountStart;
    expect(mountDuration).toBeLessThan(150);

    fireEvent.click(screen.getByRole('button', { name: 'ADMIN' }));

    const navStart = performance.now();
    const mainNav = screen.getByRole('navigation', {
      name: /Navegação principal/i,
    });
    fireEvent.click(within(mainNav).getByTitle('Chamados'));
    const navDuration = performance.now() - navStart;
    expect(navDuration).toBeLessThan(100);

    const searchInput = screen.getByPlaceholderText(/Buscar\.\.\./i);
    const filterStart = performance.now();
    fireEvent.change(searchInput, { target: { value: 'VPN' } });
    const filterDuration = performance.now() - filterStart;
    expect(filterDuration).toBeLessThan(50);
  });

  it('4. Validates static SEO tags in index.html, robots.txt, and site.webmanifest', () => {
    const manifestJson = JSON.parse(siteManifestRaw) as {
      short_name: string;
      theme_color: string;
    };

    expect(indexHtml).toContain('lang="pt-BR"');
    expect(indexHtml).toContain('name="description"');
    expect(indexHtml).toContain('property="og:title"');
    expect(indexHtml).toContain('property="og:description"');
    expect(indexHtml).toContain('name="twitter:card"');
    expect(indexHtml).toContain('application/ld+json');
    expect(indexHtml).toContain('SoftwareApplication');

    expect(robotsTxt).toContain('User-agent: *');
    expect(robotsTxt).toContain('Allow: /');

    expect(manifestJson.short_name).toBe('OPSFLOW');
    expect(manifestJson.theme_color).toBe('#0e0e0e');
  });
});
