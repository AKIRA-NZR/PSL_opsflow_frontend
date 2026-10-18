import React, { useEffect, useState } from 'react';
import { getInitials } from '@opsflow/domain';

export interface BlurUpAvatarProps {
  src?: string | null;
  blurPlaceholder?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatusIndicator?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-20 h-20 text-xl',
};

const STATUS_SIZE_MAP = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
};

export const BlurUpAvatar: React.FC<BlurUpAvatarProps> = ({
  src,
  blurPlaceholder,
  name,
  size = 'md',
  showStatusIndicator = false,
  className = '',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setIsLoaded(false);
      setHasError(false);
      return;
    }

    setIsLoaded(false);
    setHasError(false);

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setIsLoaded(true);
    };
    img.onerror = () => {
      setHasError(true);
    };
  }, [src]);

  const sizeClass = SIZE_MAP[size];
  const statusSize = STATUS_SIZE_MAP[size];

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-[#242424] border border-[#444748]/60 ${sizeClass} ${className}`}
      title={name}
    >
      {src && !hasError ? (
        <>
          {/* Blur-Up Low-Res Placeholder */}
          {!isLoaded && (
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-md scale-110 opacity-70 transition-opacity duration-300"
              style={{
                backgroundImage: blurPlaceholder
                  ? `url(${blurPlaceholder})`
                  : undefined,
                backgroundColor: '#2a2a2a',
              }}
            />
          )}

          {/* Full Resolution Image with Preload Fade-In */}
          <img
            src={src}
            alt={name}
            className={`w-full h-full object-cover object-center transition-all duration-500 ease-out ${
              isLoaded
                ? 'opacity-100 filter-none scale-100'
                : 'opacity-0 filter blur-sm scale-105'
            }`}
          />
        </>
      ) : (
        /* Fallback High-Craft Monospace Initials */
        <span className="font-mono font-bold text-white select-none">
          {getInitials(name)}
        </span>
      )}

      {/* Online Status Indicator */}
      {showStatusIndicator && (
        <span
          className={`absolute bottom-0 right-0 rounded-none bg-[#34d399] border border-[#0e0e0e] ring-1 ring-[#12261e] ${statusSize}`}
          title="Online"
        />
      )}
    </div>
  );
};
