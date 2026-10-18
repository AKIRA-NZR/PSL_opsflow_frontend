/**
 * ============================================================================
 * ATELIER MONOLITH — 3-TIER DESIGN TOKEN SYSTEM (@opsflow/ui)
 * ============================================================================
 * Tier 1: PRIMITIVE_TOKENS  -> Raw color scales, typography families, z-index
 * Tier 2: SEMANTIC_TOKENS   -> Contextual surfaces, content, borders, accents
 * Tier 3: COMPONENT_TOKENS  -> Pre-composed badge, pill, and chart tokens
 * ============================================================================
 */

export const PRIMITIVE_TOKENS = {
  color: {
    carbon: {
      950: '#0e0e0e',
      900: '#131313',
      850: '#161616',
      800: '#171717',
      750: '#1b1b1b',
      700: '#1c1c1c',
      600: '#242424',
      500: '#2a2a2a',
    },
    neutral: {
      0: '#ffffff',
      100: '#e2e2e2',
      300: '#c4c7c8',
      400: '#a1a1aa',
      500: '#8e9192',
      700: '#444748',
      800: '#2e2e2e',
    },
    sage: {
      300: '#6ee7b7',
      400: '#34d399',
      800: '#1d3d31',
      950: '#12261e',
    },
    sky: {
      300: '#7dd3fc',
      800: '#223a4e',
      950: '#14222e',
    },
    lavender: {
      300: '#a5b4fc',
      800: '#2e3154',
      950: '#1c1d33',
    },
    amber: {
      300: '#fcd34d',
      400: '#fbbf24',
      800: '#42351b',
      950: '#292112',
    },
    orange: {
      300: '#fdba74',
      800: '#42321b',
      950: '#291f13',
    },
    coral: {
      300: '#fda4af',
      400: '#fb7185',
      800: '#452126',
      950: '#291518',
    },
    slate: {
      400: '#94a3b8',
      800: '#283038',
      950: '#181d22',
    },
  },
  font: {
    display: "'Space Grotesk', 'Geist', sans-serif",
    sans: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    mono: "'Geist Mono', 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
  },
  zIndex: {
    base: 10,
    elevatedPanel: 20,
    filterBar: 30,
    backdrop: 40,
    popover: 50,
  },
} as const;

export const SEMANTIC_TOKENS = {
  surface: {
    lowest: PRIMITIVE_TOKENS.color.carbon[950],
    canvas: PRIMITIVE_TOKENS.color.carbon[900],
    recessed: PRIMITIVE_TOKENS.color.carbon[850],
    panel: PRIMITIVE_TOKENS.color.carbon[800],
    elevated: PRIMITIVE_TOKENS.color.carbon[750],
    hover: PRIMITIVE_TOKENS.color.carbon[700],
    interactive: PRIMITIVE_TOKENS.color.carbon[600],
    active: PRIMITIVE_TOKENS.color.carbon[500],
  },
  content: {
    primary: PRIMITIVE_TOKENS.color.neutral[0],
    secondary: PRIMITIVE_TOKENS.color.neutral[100],
    subtle: PRIMITIVE_TOKENS.color.neutral[300],
    muted: PRIMITIVE_TOKENS.color.neutral[500],
    inverse: PRIMITIVE_TOKENS.color.carbon[900],
  },
  border: {
    hairline: 'rgba(68, 71, 72, 0.45)',
    interactive: 'rgba(196, 199, 200, 0.35)',
    strong: PRIMITIVE_TOKENS.color.neutral[500],
    focus: PRIMITIVE_TOKENS.color.neutral[100],
  },
  accent: {
    sage: PRIMITIVE_TOKENS.color.sage[300],
    sky: PRIMITIVE_TOKENS.color.sky[300],
    lavender: PRIMITIVE_TOKENS.color.lavender[300],
    amber: PRIMITIVE_TOKENS.color.amber[300],
    orange: PRIMITIVE_TOKENS.color.orange[300],
    coral: PRIMITIVE_TOKENS.color.coral[300],
    slate: PRIMITIVE_TOKENS.color.slate[400],
  },
} as const;

export const COMPONENT_TOKENS = {
  statusBadge: {
    OPEN: 'bg-[#14222e] text-[#7dd3fc] border-[#223a4e]',
    IN_PROGRESS: 'bg-[#1c1d33] text-[#a5b4fc] border-[#2e3154]',
    WAITING_USER: 'bg-[#292112] text-[#fcd34d] border-[#42351b]',
    RESOLVED: 'bg-[#12261e] text-[#6ee7b7] border-[#1d3d31]',
    CLOSED: 'bg-[#1c1c1c] text-[#a1a1aa] border-[#2e2e2e]',
    CANCELLED: 'bg-[#291518] text-[#fda4af] border-[#452126] line-through',
  },
  priorityBadge: {
    LOW: 'bg-[#181d22] text-[#94a3b8] border-[#283038]',
    MEDIUM: 'bg-[#14222e] text-[#7dd3fc] border-[#223a4e]',
    HIGH: 'bg-[#291f13] text-[#fdba74] border-[#42321b]',
    CRITICAL: 'bg-[#291518] text-[#fda4af] border-[#452126]',
  },
  prioritySignalColor: {
    LOW: PRIMITIVE_TOKENS.color.slate[400],
    MEDIUM: PRIMITIVE_TOKENS.color.sky[300],
    HIGH: PRIMITIVE_TOKENS.color.orange[300],
    CRITICAL: PRIMITIVE_TOKENS.color.coral[300],
    inactiveBar: 'rgba(255, 255, 255, 0.16)',
  },
  slaBadge: {
    ON_TIME: {
      pill: 'bg-[#12261e] text-[#6ee7b7] border-[#1d3d31]',
      dot: 'bg-[#34d399]',
    },
    AT_RISK: {
      pill: 'bg-[#292112] text-[#fcd34d] border-[#42351b]',
      dot: 'bg-[#fbbf24]',
    },
    BREACHED: {
      pill: 'bg-[#291518] text-[#fda4af] border-[#452126]',
      dot: 'bg-[#fb7185]',
    },
    COMPLETED: {
      pill: 'bg-[#1b1b1b] text-[#c4c7c8] border-[#2e2e2e]',
      dot: 'bg-[#8e9192]',
    },
  },
  rolePill: {
    ADMIN: 'bg-[#1c1d33] text-[#a5b4fc] border-[#2e3154]',
    TECHNICIAN: 'bg-[#14222e] text-[#7dd3fc] border-[#223a4e]',
    EMPLOYEE: 'bg-[#1b1b1b] text-[#c4c7c8] border-[#2e2e2e]',
  },
  chart: {
    resolved: PRIMITIVE_TOKENS.color.sage[300],
    inProgress: PRIMITIVE_TOKENS.color.lavender[300],
    triage: PRIMITIVE_TOKENS.color.sky[300],
    waiting: PRIMITIVE_TOKENS.color.amber[300],
    track: '#262626',
  },
} as const;

export const DESIGN_TOKENS = {
  primitive: PRIMITIVE_TOKENS,
  semantic: SEMANTIC_TOKENS,
  component: COMPONENT_TOKENS,
} as const;

