import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-[#5865F2] hover:bg-[#4752C4] text-white border border-transparent shadow-xs',
  secondary:
    'bg-[#232936] hover:bg-[#2C3444] text-[#F1F5F9] border border-[#2F3747]',
  ghost:
    'bg-transparent hover:bg-[#232936] text-[#94A3B8] hover:text-[#F1F5F9] border border-transparent',
  danger:
    'bg-rose-500/12 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25',
  success:
    'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-lg gap-2',
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
      className={`inline-flex items-center justify-center font-medium transition-colors cursor-pointer disabled:opacity-45 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
