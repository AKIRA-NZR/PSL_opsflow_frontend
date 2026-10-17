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
    'bg-[#4A558F] hover:bg-[#5562A3] text-[#F1F5F9] border border-[#5D6AB0]/40 shadow-2xs',
  secondary:
    'bg-[#212631] hover:bg-[#282E3B] text-[#E2E8F0] border border-[#2E3543]',
  ghost:
    'bg-transparent hover:bg-[#1F242F] text-[#94A3B8] hover:text-[#E2E8F0] border border-transparent',
  danger:
    'bg-[#281B1F] hover:bg-[#322126] text-[#D6A6AE] border border-[#422B31]',
  success:
    'bg-[#192823] hover:bg-[#1F322C] text-[#A8C7BA] border border-[#2B443B]',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm rounded-xl gap-2',
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
