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
    'bg-gradient-to-b from-[#F4F4F5] to-[#D4D4D8] hover:from-white hover:to-[#E4E4E7] text-[#090D14] font-semibold border border-white/70 shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,1)] active:shadow-[inset_0_2px_5px_rgba(0,0,0,0.35)] active:translate-y-[0.5px]',
  secondary: 'tactile-surface text-zinc-100',
  ghost:
    'bg-transparent hover:bg-white/[0.06] text-zinc-400 hover:text-zinc-100 border border-transparent hover:border-white/10',
  danger:
    'tactile-surface text-rose-200 hover:border-rose-400/30',
  success:
    'bg-gradient-to-b from-[#F4F4F5] to-[#D4D4D8] hover:from-white hover:to-[#E4E4E7] text-[#090D14] font-semibold border border-white/70 shadow-[0_6px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,1)]',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5',
  md: 'px-4 py-2 text-xs sm:text-sm rounded-xl gap-2',
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
