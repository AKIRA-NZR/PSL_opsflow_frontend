import React, { useId, useState } from 'react';

interface OpsFlowLogoProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * Interactive OpsFlow Vector Brand Mark ("Fluxo em Camadas")
 * - Hover: Staggered horizontal flow-blade expansion + 3D subtle tilt + border glow
 * - Active / Click: Spring scale feedback
 */
export const OpsFlowLogo: React.FC<OpsFlowLogoProps> = ({
  size = 38,
  className = '',
  onClick,
}) => {
  const uid = useId();
  const [isHovered, setIsHovered] = useState(false);
  const [isBursting, setIsBursting] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: Number((-relY * 16).toFixed(2)),
      y: Number((relX * 16).toFixed(2)),
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const handleTriggerClick = () => {
    setIsBursting(true);
    setTimeout(() => setIsBursting(false), 450);
    onClick?.();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleTriggerClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTriggerClick();
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        width: size,
        height: size,
        transform: isHovered
          ? `perspective(240px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${
              isBursting ? 0.93 : 1.06
            })`
          : 'perspective(240px) rotateX(0deg) rotateY(0deg) scale(1)',
        transition: isHovered
          ? 'transform 120ms ease-out'
          : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none cursor-pointer group focus:outline-none ${className}`}
      title="Ir para o início · OpsFlow"
    >
      {/* Ambient Subtle Glow on Hover */}
      <span
        className={`absolute -inset-1 rounded-2xl bg-white/15 blur-md transition-opacity duration-300 pointer-events-none ${
          isHovered || isBursting ? 'opacity-100' : 'opacity-0'
        }`}
      />

      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 overflow-visible"
        aria-label="OpsFlow Logo"
      >
        <defs>
          <linearGradient
            id={`${uid}-bg`}
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={isHovered ? '#262B36' : '#1C2029'} />
            <stop offset="100%" stopColor="#11141B" />
          </linearGradient>

          <linearGradient
            id={`${uid}-blade-top`}
            x1="8"
            y1="9"
            x2="32"
            y2="17"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#D4D4D8" />
          </linearGradient>

          <linearGradient
            id={`${uid}-blade-mid`}
            x1="8"
            y1="18"
            x2="29"
            y2="25"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#E4E4E7" />
            <stop offset="100%" stopColor="#A1A1AA" />
          </linearGradient>

          <linearGradient
            id={`${uid}-blade-bot`}
            x1="8"
            y1="26"
            x2="22"
            y2="33"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#A1A1AA" />
            <stop offset="100%" stopColor="#71717A" />
          </linearGradient>
        </defs>

        {/* Outer Squircle Container */}
        <rect
          x="1"
          y="1"
          width="38"
          height="38"
          rx="10.5"
          fill={`url(#${uid}-bg)`}
          stroke={isHovered ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.14)'}
          strokeWidth="1.25"
          style={{ transition: 'stroke 250ms ease, fill 250ms ease' }}
        />

        {/* Top Flow Blade */}
        <path
          d="M11 10.5C11 9.67157 11.6716 9 12.5 9H29C30.1046 9 30.8204 10.1626 30.3264 11.1506L28.5764 14.6506C28.238 15.3274 27.5463 15.755 26.7895 15.755H12.5C11.6716 15.755 11 15.0834 11 14.255V10.5Z"
          fill={`url(#${uid}-blade-top)`}
          style={{
            transform: isBursting
              ? 'translateX(3px)'
              : isHovered
                ? 'translateX(1.8px)'
                : 'translateX(0px)',
            transition: 'transform 280ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        />

        {/* Middle Dynamic Flow Blade */}
        <path
          d="M11 19.25C11 18.4216 11.6716 17.75 12.5 17.75H25.2C26.3046 17.75 27.0204 18.9126 26.5264 19.9006L24.7764 23.4006C24.438 24.0774 23.7463 24.505 22.9895 24.505H12.5C11.6716 24.505 11 23.8334 11 23.005V19.25Z"
          fill={`url(#${uid}-blade-mid)`}
          style={{
            transform: isBursting
              ? 'translateX(4.2px)'
              : isHovered
                ? 'translateX(2.8px)'
                : 'translateX(0px)',
            transition:
              'transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1) 40ms',
          }}
        />

        {/* Bottom Flow Blade */}
        <path
          d="M11 28C11 27.1716 11.6716 26.5 12.5 26.5H20.8C21.9046 26.5 22.6204 27.6626 22.1264 28.6506L20.8764 31.1506C20.538 31.8274 19.8463 32.255 19.0895 32.255H12.5C11.6716 32.255 11 31.5834 11 30.755V28Z"
          fill={`url(#${uid}-blade-bot)`}
          style={{
            transform: isBursting
              ? 'translateX(2px)'
              : isHovered
                ? 'translateX(1.2px)'
                : 'translateX(0px)',
            transition:
              'transform 340ms cubic-bezier(0.34, 1.56, 0.64, 1) 80ms',
          }}
        />
      </svg>
    </div>
  );
};
