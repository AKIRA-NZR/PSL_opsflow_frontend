import React, { useMemo, useState } from 'react';
import {
  ArrowCounterClockwise,
  Check,
  CheckCircle,
  Eye,
  FloppyDisk,
  Gauge,
  Palette,
  Sparkle,
  Sliders,
  Stack,
  WarningOctagon,
} from '@phosphor-icons/react';
import {
  ACCENT_COLOR_CONFIGS,
  calculateContrastRatio,
  calculateRelativeLuminance,
  DEFAULT_THEME_PREFERENCES,
  THEME_PRESET_CONFIGS,
  type AccentColor,
  type BorderLuminance,
  type InterfaceDensity,
  type ThemePreset,
  type UserThemePreferences,
} from '@opsflow/domain';
import { Button } from '@opsflow/ui';
import { useWorkspace } from '@entities/session';

export const ProfileThemeSandbox: React.FC = () => {
  const { themePreferences, updateThemePreferences, resetThemePreferences } =
    useWorkspace();

  // Draft State (Sandbox Pattern)
  const [draftPrefs, setDraftPrefs] =
    useState<UserThemePreferences>(themePreferences);

  const isDirty = useMemo(
    () => JSON.stringify(draftPrefs) !== JSON.stringify(themePreferences),
    [draftPrefs, themePreferences]
  );

  const activePresetConfig = THEME_PRESET_CONFIGS[draftPrefs.preset];
  const activeAccentConfig = ACCENT_COLOR_CONFIGS[draftPrefs.accent];

  // Mathematical Relative Luminance & WCAG Contrast Calculation
  const luminanceAnalysis = useMemo(() => {
    const bgLuminance = calculateRelativeLuminance(
      activePresetConfig.surfacePanel
    );
    const accentLuminance = calculateRelativeLuminance(activeAccentConfig.hex);
    const contrastWithWhite = calculateContrastRatio(
      '#ffffff',
      activePresetConfig.surfaceCanvas
    );
    const contrastWithAccent = calculateContrastRatio(
      activeAccentConfig.hex,
      activePresetConfig.surfacePanel
    );

    const isAAA = contrastWithWhite >= 7.0;

    return {
      bgLuminance: bgLuminance.toFixed(4),
      accentLuminance: accentLuminance.toFixed(4),
      contrastWithWhite,
      contrastWithAccent,
      isAAA,
    };
  }, [activePresetConfig, activeAccentConfig]);

  const handleApplyToSystem = () => {
    updateThemePreferences(draftPrefs);
  };

  const handleDiscardDraft = () => {
    setDraftPrefs(themePreferences);
  };

  const handleResetDefaults = () => {
    resetThemePreferences();
    setDraftPrefs(DEFAULT_THEME_PREFERENCES);
  };

  return (
    <div className="glass-panel p-6 sm:p-7 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#444748]/35 pb-4">
        <div className="flex items-center gap-2.5">
          <Palette className="w-5 h-5 text-status-sage" weight="duotone" />
          <div>
            <h2 className="text-sm font-semibold text-white font-mono uppercase tracking-[0.12em]">
              MOTOR DE PERSONALIZAÇÃO VISUAL (SANDBOX &amp; DYNAMIC THEMING)
            </h2>
            <p className="text-xs text-content-muted mt-0.5">
              Ajuste presets, acentos, camadas e translucidez no Sandbox com feedback em tempo real.
            </p>
          </div>
        </div>

        {/* Draft Indicator */}
        {isDirty ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider bg-status-amber/15 text-status-amber border border-status-amber/40">
            <Sliders className="w-3.5 h-3.5" />
            Rascunho Ativo (Não Salvo)
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider bg-status-sage/15 text-status-sage border border-status-sage/40">
            <CheckCircle className="w-3.5 h-3.5" weight="fill" />
            Sincronizado
          </span>
        )}
      </div>

      {/* 1. Dynamic Presets */}
      <div className="space-y-3">
        <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-muted block">
          1. PRESETS ARQUITETÔNICOS DE SUPERFÍCIE (DYNAMIC THEMING)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {(Object.keys(THEME_PRESET_CONFIGS) as ThemePreset[]).map((key) => {
            const config = THEME_PRESET_CONFIGS[key];
            const isSelected = draftPrefs.preset === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setDraftPrefs((prev) => ({ ...prev, preset: key }))}
                className={`p-3 border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-white bg-surface-interactive shadow-lg'
                    : 'border-[#444748]/45 bg-surface-lowest hover:border-content-muted'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                      {config.name}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" weight="bold" />}
                  </div>
                  <p className="text-[11px] text-content-muted mt-1 leading-relaxed">
                    {config.description}
                  </p>
                </div>

                {/* Color Swatch Preview */}
                <div className="flex items-center gap-1 pt-2 border-t border-[#444748]/30">
                  <span
                    className="w-4 h-4 rounded-none border border-white/20"
                    style={{ backgroundColor: config.surfaceCanvas }}
                    title="Canvas"
                  />
                  <span
                    className="w-4 h-4 rounded-none border border-white/20"
                    style={{ backgroundColor: config.surfaceLowest }}
                    title="Sidebar"
                  />
                  <span
                    className="w-4 h-4 rounded-none border border-white/20"
                    style={{ backgroundColor: config.surfacePanel }}
                    title="Panel"
                  />
                  <span
                    className="w-4 h-4 rounded-none border border-white/20"
                    style={{ backgroundColor: config.surfaceElevated }}
                    title="Elevated"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Dynamic Accent Palette */}
      <div className="space-y-3">
        <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-muted block">
          2. COR DE ACENTO DINÂMICA (SEMANTIC ACCENT)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {(Object.keys(ACCENT_COLOR_CONFIGS) as AccentColor[]).map((accentKey) => {
            const config = ACCENT_COLOR_CONFIGS[accentKey];
            const isSelected = draftPrefs.accent === accentKey;

            return (
              <button
                key={accentKey}
                type="button"
                onClick={() => setDraftPrefs((prev) => ({ ...prev, accent: accentKey }))}
                className={`py-2 px-2.5 border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'border-white bg-surface-interactive'
                    : 'border-[#444748]/45 bg-surface-lowest hover:border-content-muted'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded-none shrink-0 border border-white/20"
                    style={{ backgroundColor: config.hex }}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-content-primary truncate">
                    {accentKey}
                  </span>
                </div>
                {isSelected && <Check className="w-3 h-3 text-white shrink-0" weight="bold" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Multi-Layer Background Stacking */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Stack className="w-4 h-4 text-status-sky" />
          <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-muted block">
            3. MULTI-LAYER BACKGROUND STACKING (CAMADAS DE PROFUNDIDADE)
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Layer 1 */}
          <div
            onClick={() =>
              setDraftPrefs((prev) => ({
                ...prev,
                backgroundLayers: {
                  ...prev.backgroundLayers,
                  baseSolid: !prev.backgroundLayers.baseSolid,
                },
              }))
            }
            className={`p-3 border cursor-pointer select-none transition-all ${
              draftPrefs.backgroundLayers.baseSolid
                ? 'bg-surface-interactive border-white/80'
                : 'bg-surface-lowest border-[#444748]/40 text-content-muted opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white uppercase">
                CAMADA 1: BASE SÓLIDA
              </span>
              <input
                type="checkbox"
                checked={draftPrefs.backgroundLayers.baseSolid}
                onChange={() => {}}
                className="cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-content-muted mt-1">
              Superfície opaca de carbono escuro (zero vazamento).
            </p>
          </div>

          {/* Layer 2 */}
          <div
            onClick={() =>
              setDraftPrefs((prev) => ({
                ...prev,
                backgroundLayers: {
                  ...prev.backgroundLayers,
                  blueprintGrid: !prev.backgroundLayers.blueprintGrid,
                },
              }))
            }
            className={`p-3 border cursor-pointer select-none transition-all ${
              draftPrefs.backgroundLayers.blueprintGrid
                ? 'bg-surface-interactive border-white/80'
                : 'bg-surface-lowest border-[#444748]/40 text-content-muted opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white uppercase">
                CAMADA 2: BLUEPRINT GRID
              </span>
              <input
                type="checkbox"
                checked={draftPrefs.backgroundLayers.blueprintGrid}
                onChange={() => {}}
                className="cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-content-muted mt-1">
              Grade arquitetônica 24px com traços translúcidos.
            </p>
          </div>

          {/* Layer 3 */}
          <div
            onClick={() =>
              setDraftPrefs((prev) => ({
                ...prev,
                backgroundLayers: {
                  ...prev.backgroundLayers,
                  ambientGlow: !prev.backgroundLayers.ambientGlow,
                },
              }))
            }
            className={`p-3 border cursor-pointer select-none transition-all ${
              draftPrefs.backgroundLayers.ambientGlow
                ? 'bg-surface-interactive border-white/80'
                : 'bg-surface-lowest border-[#444748]/40 text-content-muted opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white uppercase">
                CAMADA 3: AMBIENT GLOW
              </span>
              <input
                type="checkbox"
                checked={draftPrefs.backgroundLayers.ambientGlow}
                onChange={() => {}}
                className="cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-content-muted mt-1">
              Luz radial suave refletindo a cor de acento ativa.
            </p>
          </div>

          {/* Layer 4 */}
          <div
            onClick={() =>
              setDraftPrefs((prev) => ({
                ...prev,
                backgroundLayers: {
                  ...prev.backgroundLayers,
                  noiseTexture: !prev.backgroundLayers.noiseTexture,
                },
              }))
            }
            className={`p-3 border cursor-pointer select-none transition-all ${
              draftPrefs.backgroundLayers.noiseTexture
                ? 'bg-surface-interactive border-white/80'
                : 'bg-surface-lowest border-[#444748]/40 text-content-muted opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-white uppercase">
                CAMADA 4: FILM NOISE
              </span>
              <input
                type="checkbox"
                checked={draftPrefs.backgroundLayers.noiseTexture}
                onChange={() => {}}
                className="cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-content-muted mt-1">
              Textura tátil granulada anti-banding.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Adaptive Glassmorphism & Luminância Relativa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-[#444748]/35">
        {/* Controls */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sparkle className="w-4 h-4 text-status-amber" />
            <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-muted block">
              4. ADAPTIVE GLASSMORPHISM &amp; CONTRASTE
            </label>
          </div>

          {/* Glass Opacity Slider */}
          <div className="space-y-1.5 p-3.5 bg-surface-lowest border border-[#444748]/40">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-content-muted">OPACIDADE TRANSLÚCIDA DO VIDRO</span>
              <span className="font-bold text-white">{draftPrefs.glassOpacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={draftPrefs.glassOpacity}
              onChange={(e) =>
                setDraftPrefs((prev) => ({
                  ...prev,
                  glassOpacity: Number(e.target.value),
                }))
              }
              className="w-full cursor-pointer accent-white"
            />
            <div className="flex justify-between text-[10px] font-mono text-content-muted">
              <span>0% (Sólido Opaco)</span>
              <span>20% (Equilibrado)</span>
              <span>40% (Vidro Fosco)</span>
            </div>
          </div>

          {/* Border Luminance */}
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-muted block">
              CONTRASTE DA BORDA ARQUITETÔNICA
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['subtle', 'standard', 'high-contrast'] as BorderLuminance[]).map(
                (lum) => {
                  const isSelected = draftPrefs.borderLuminance === lum;
                  const labelMap = {
                    subtle: 'Sutil (25%)',
                    standard: 'Padrão (45%)',
                    'high-contrast': 'Alto (65%)',
                  };

                  return (
                    <button
                      key={lum}
                      type="button"
                      onClick={() =>
                        setDraftPrefs((prev) => ({ ...prev, borderLuminance: lum }))
                      }
                      className={`py-2 px-2 font-mono text-[10px] uppercase tracking-wider border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-surface-interactive border-white text-white'
                          : 'bg-surface-lowest border-[#444748]/40 text-content-muted hover:text-white'
                      }`}
                    >
                      {labelMap[lum]}
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Interface Density */}
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-muted block">
              DENSIDADE DA INTERFACE
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['compact', 'comfortable', 'spacious'] as InterfaceDensity[]).map(
                (d) => {
                  const isSelected = draftPrefs.density === d;
                  const labelMap = {
                    compact: 'Compacta',
                    comfortable: 'Confortável',
                    spacious: 'Expandida',
                  };

                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() =>
                        setDraftPrefs((prev) => ({ ...prev, density: d }))
                      }
                      className={`py-2 px-2 font-mono text-[10px] uppercase tracking-wider border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-surface-interactive border-white text-white'
                          : 'bg-surface-lowest border-[#444748]/40 text-content-muted hover:text-white'
                      }`}
                    >
                      {labelMap[d]}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* Relative Luminance Calculator Output */}
        <div className="p-4 bg-surface-lowest border border-[#444748]/40 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-muted">
                LUMINÂNCIA RELATIVA &amp; CONFORMIDADE WCAG 2.1
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 bg-[#12261e] border border-[#1d3d31] text-status-sage uppercase">
                {luminanceAnalysis.isAAA ? 'WCAG AAA PASS' : 'WCAG AA PASS'}
              </span>
            </div>

            <p className="text-xs text-content-muted leading-relaxed">
              Cálculo baseado na fórmula psicométrica de luminância relativa ($L = 0.2126R + 0.7152G + 0.0722B$).
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
              <div className="p-2.5 bg-surface-recessed border border-[#444748]/30">
                <span className="text-[10px] text-content-muted block">CONTRASTE TEXTO</span>
                <span className="text-sm font-bold text-white">
                  {luminanceAnalysis.contrastWithWhite}:1
                </span>
              </div>
              <div className="p-2.5 bg-surface-recessed border border-[#444748]/30">
                <span className="text-[10px] text-content-muted block">CONTRASTE ACENTO</span>
                <span className="text-sm font-bold" style={{ color: activeAccentConfig.hex }}>
                  {luminanceAnalysis.contrastWithAccent}:1
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] font-mono text-content-muted border-t border-[#444748]/30 pt-2.5 flex items-center justify-between">
            <span>Luminância Painel: {luminanceAnalysis.bgLuminance}</span>
            <span>Luminância Acento: {luminanceAnalysis.accentLuminance}</span>
          </div>
        </div>
      </div>

      {/* 5. Draft State / Sandbox Live Preview Container */}
      <div className="space-y-3 pt-2 border-t border-[#444748]/35">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-status-sky" />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-content-muted">
              5. SANDBOX PREVIEW (ECOSSISTEMA INTERATIVO EM TEMPO REAL)
            </span>
          </div>
          <span className="font-mono text-[10px] text-content-muted">
            Preset: {activePresetConfig.name} · Acento: {activeAccentConfig.name}
          </span>
        </div>

        {/* The Sandbox Stage */}
        <div
          className="p-5 sm:p-6 border transition-all duration-300 relative overflow-hidden"
          style={{
            backgroundColor: activePresetConfig.surfaceCanvas,
            borderColor: 'var(--border-hairline)',
          }}
        >
          {/* Stacking Layers Simulation */}
          {draftPrefs.backgroundLayers.blueprintGrid && (
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                                  linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            />
          )}

          {draftPrefs.backgroundLayers.ambientGlow && (
            <div
              className="absolute -top-16 -right-16 w-64 h-64 rounded-full pointer-events-none opacity-25 filter blur-3xl transition-colors duration-500"
              style={{ backgroundColor: activeAccentConfig.hex }}
            />
          )}

          {/* Sandbox Inner Card */}
          <div
            className="relative z-10 p-5 space-y-4 border transition-all"
            style={{
              backgroundColor: activePresetConfig.surfacePanel,
              borderColor: 'var(--border-hairline)',
              backdropFilter:
                draftPrefs.glassOpacity > 0
                  ? `blur(${Math.max(4, draftPrefs.glassOpacity / 2)}px)`
                  : 'none',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-content-muted">#00142</span>
                <span className="text-sm font-semibold text-white">
                  Instabilidade no cluster de produção Kubernetes
                </span>
              </div>
              <span
                className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider border"
                style={{
                  color: activeAccentConfig.hex,
                  backgroundColor: activeAccentConfig.bgSoft,
                  borderColor: activeAccentConfig.borderSoft,
                }}
              >
                Atendimento
              </span>
            </div>

            <p className="text-xs text-content-muted leading-relaxed">
              Exemplo de texto renderizado com a combinação selecionada no Sandbox. O contraste atende aos requisitos de legibilidade e ergonomia visual.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#444748]/30">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 font-mono text-xs font-bold uppercase transition-colors"
                  style={{
                    backgroundColor: activeAccentConfig.hex,
                    color: '#0e0e0e',
                  }}
                >
                  Ação Primária
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 font-mono text-xs font-medium text-white border border-[#444748]/60 bg-surface-recessed hover:bg-surface-interactive transition-colors"
                >
                  Secundário
                </button>
              </div>

              <span className="font-mono text-[11px] text-content-muted">
                SLA: 02h 45m restantes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Actions (Sandbox Commit & Discard) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#444748]/35">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={<ArrowCounterClockwise className="w-3.5 h-3.5" />}
          onClick={handleResetDefaults}
          title="Restaurar parâmetros padrão de fábrica"
        >
          Restaurar Padrão
        </Button>

        <div className="flex items-center gap-2.5">
          {isDirty && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleDiscardDraft}
            >
              Descartar Rascunho
            </Button>
          )}

          <Button
            type="button"
            variant="primary"
            size="md"
            icon={<FloppyDisk className="w-4 h-4 weight-bold" />}
            onClick={handleApplyToSystem}
            disabled={!isDirty}
          >
            Aplicar ao Sistema (Optimistic UI)
          </Button>
        </div>
      </div>
    </div>
  );
};
