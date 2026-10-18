export type ThemePreset =
  | 'atelier-carbon'
  | 'obsidian-slate'
  | 'midnight-sky'
  | 'cyber-amber'
  | 'emerald-matrix';

export type AccentColor =
  | 'sage'
  | 'sky'
  | 'lavender'
  | 'amber'
  | 'coral'
  | 'emerald'
  | 'cyan';

export type InterfaceDensity = 'compact' | 'comfortable' | 'spacious';

export type BorderLuminance = 'subtle' | 'standard' | 'high-contrast';

export interface BackgroundLayerConfig {
  baseSolid: boolean;
  blueprintGrid: boolean;
  ambientGlow: boolean;
  noiseTexture: boolean;
}

export interface UserThemePreferences {
  preset: ThemePreset;
  accent: AccentColor;
  density: InterfaceDensity;
  glassOpacity: number; // 0 to 40 (%)
  borderLuminance: BorderLuminance;
  backgroundLayers: BackgroundLayerConfig;
}

export interface ThemePresetConfig {
  id: ThemePreset;
  name: string;
  description: string;
  surfaceCanvas: string;
  surfaceLowest: string;
  surfacePanel: string;
  surfaceElevated: string;
}

export const THEME_PRESET_CONFIGS: Record<ThemePreset, ThemePresetConfig> = {
  'atelier-carbon': {
    id: 'atelier-carbon',
    name: 'Atelier Carbon',
    description: 'Matte cinza carvão profundo com acabamento arquitetônico neutro.',
    surfaceCanvas: '#131313',
    surfaceLowest: '#0e0e0e',
    surfacePanel: '#171717',
    surfaceElevated: '#1b1b1b',
  },
  'obsidian-slate': {
    id: 'obsidian-slate',
    name: 'Obsidian Slate',
    description: 'Ardósia grafite fria inspirada em consoles de infraestrutura moderna.',
    surfaceCanvas: '#0f1216',
    surfaceLowest: '#0a0d11',
    surfacePanel: '#161b22',
    surfaceElevated: '#1c2128',
  },
  'midnight-sky': {
    id: 'midnight-sky',
    name: 'Midnight Sky',
    description: 'Preto azulado aeroespacial de alta imersão para operações 24/7.',
    surfaceCanvas: '#0b0f19',
    surfaceLowest: '#070a11',
    surfacePanel: '#111827',
    surfaceElevated: '#1e293b',
  },
  'cyber-amber': {
    id: 'cyber-amber',
    name: 'Cyber Amber',
    description: 'Preto absoluto OLED de alto contraste industrial com iluminação âmbar.',
    surfaceCanvas: '#090909',
    surfaceLowest: '#040404',
    surfacePanel: '#141414',
    surfaceElevated: '#1a1a1a',
  },
  'emerald-matrix': {
    id: 'emerald-matrix',
    name: 'Emerald Matrix',
    description: 'Matiz verde tático profundo para monitoramento contínuo de NOC/SOC.',
    surfaceCanvas: '#0a110e',
    surfaceLowest: '#060b09',
    surfacePanel: '#111c16',
    surfaceElevated: '#17261e',
  },
};

export const ACCENT_COLOR_CONFIGS: Record<
  AccentColor,
  { name: string; hex: string; bgSoft: string; borderSoft: string }
> = {
  sage: {
    name: 'Sage (Sálvia)',
    hex: '#6ee7b7',
    bgSoft: '#12261e',
    borderSoft: '#1d3d31',
  },
  sky: {
    name: 'Sky (Céu)',
    hex: '#7dd3fc',
    bgSoft: '#14222e',
    borderSoft: '#223a4e',
  },
  lavender: {
    name: 'Lavender (Lavanda)',
    hex: '#a5b4fc',
    bgSoft: '#191c33',
    borderSoft: '#282c52',
  },
  amber: {
    name: 'Amber (Âmbar)',
    hex: '#fcd34d',
    bgSoft: '#292112',
    borderSoft: '#42351b',
  },
  coral: {
    name: 'Coral (Rosa Suave)',
    hex: '#fda4af',
    bgSoft: '#291518',
    borderSoft: '#452126',
  },
  emerald: {
    name: 'Emerald (Esmeralda)',
    hex: '#34d399',
    bgSoft: '#0f241a',
    borderSoft: '#17402c',
  },
  cyan: {
    name: 'Cyan (Ciano)',
    hex: '#38bdf8',
    bgSoft: '#0c2331',
    borderSoft: '#153b52',
  },
};

export const DEFAULT_THEME_PREFERENCES: UserThemePreferences = {
  preset: 'atelier-carbon',
  accent: 'sage',
  density: 'comfortable',
  glassOpacity: 15,
  borderLuminance: 'standard',
  backgroundLayers: {
    baseSolid: true,
    blueprintGrid: true,
    ambientGlow: true,
    noiseTexture: true,
  },
};

/**
 * Calcula a luminância relativa conforme especificação WCAG 2.1
 * L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 */
export function calculateRelativeLuminance(hex: string): number {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16) / 255;
  const g = parseInt(sanitized.substring(2, 4), 16) / 255;
  const b = parseInt(sanitized.substring(4, 6), 16) / 255;

  const sRGB = [r, g, b].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

/**
 * Calcula a taxa de contraste (Contrast Ratio) entre duas cores (WCAG)
 * (L1 + 0.05) / (L2 + 0.05)
 */
export function calculateContrastRatio(hexForeground: string, hexBackground: string): number {
  const l1 = calculateRelativeLuminance(hexForeground);
  const l2 = calculateRelativeLuminance(hexBackground);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

