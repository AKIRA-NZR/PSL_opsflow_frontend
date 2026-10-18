import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-white hover:bg-[#e2e2e2] text-[#131313] font-semibold border border-white',
  secondary:
    'bg-[#1b1b1b] hover:bg-[#242424] text-[#e2e2e2] border border-[#444748]/60 hover:border-[#8e9192]',
  ghost:
    'bg-transparent hover:bg-[#1b1b1b] text-[#c4c7c8] hover:text-white border border-transparent hover:border-[#444748]/40',
  danger:
    'bg-[#291518] hover:bg-[#381b1f] text-[#fda4af] border border-[#452126]',
  success:
    'bg-[#12261e] hover:bg-[#183328] text-[#6ee7b7] border border-[#1d3d31]',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-xs sm:text-sm gap-2',
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
      className={`inline-flex items-center justify-center font-medium transition-colors duration-150 cursor-pointer disabled:opacity-45 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
