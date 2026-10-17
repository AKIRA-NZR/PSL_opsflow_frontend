import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
}

/**
 * Tactile Micro-Neumorphic & Spatial Glass Buttons
 * Combines overhead specular highlight (inset 0 1px 0) with physical drop shadow and active inset depression.
 */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-b from-[#6366F1]/90 to-[#4F46E5]/90 hover:from-[#6E72F7] hover:to-[#564EEB] text-white border border-indigo-300/30 shadow-[0_6px_16px_rgba(79,70,229,0.35),inset_0_1px_0_rgba(255,255,255,0.28)] active:shadow-[inset_0_2px_6px_rgba(0,0,0,0.45)] active:translate-y-[0.5px]',
  secondary: 'tactile-surface text-[#F1F5F9]',
  ghost:
    'bg-transparent hover:bg-white/[0.06] text-[#94A3B8] hover:text-[#F1F5F9] border border-transparent hover:border-white/10',
  danger:
    'bg-gradient-to-b from-rose-500/20 to-rose-600/25 hover:from-rose-500/28 hover:to-rose-600/32 text-rose-100 border border-rose-300/25 shadow-[0_6px_14px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.16)] active:shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]',
  success:
    'bg-gradient-to-b from-emerald-500/22 to-emerald-600/28 hover:from-emerald-500/30 hover:to-emerald-600/35 text-emerald-100 border border-emerald-300/25 shadow-[0_6px_14px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] active:shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-xl gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium backdrop-blur-md transition-all duration-150 cursor-pointer disabled:opacity-45 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
