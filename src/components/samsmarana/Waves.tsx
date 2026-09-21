"use client";

// Subtle Haikei-style layered waves — supporting visual layer only,
// very soft green/teal tones. Never the main design.

export function Waves({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1200 320"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="wv1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.11 162 / 0.18)" />
          <stop offset="100%" stopColor="oklch(0.72 0.11 162 / 0.02)" />
        </linearGradient>
        <linearGradient id="wv2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.60 0.07 190 / 0.16)" />
          <stop offset="100%" stopColor="oklch(0.60 0.07 190 / 0.02)" />
        </linearGradient>
        <linearGradient id="wv3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.46 0.09 162 / 0.12)" />
          <stop offset="100%" stopColor="oklch(0.46 0.09 162 / 0.01)" />
        </linearGradient>
      </defs>
      <path
        fill="url(#wv1)"
        d="M0,160 C200,220 400,100 600,140 C800,180 1000,80 1200,140 L1200,320 L0,320 Z"
      />
      <path
        fill="url(#wv2)"
        d="M0,200 C220,250 420,150 620,190 C820,230 1000,140 1200,190 L1200,320 L0,320 Z"
      />
      <path
        fill="url(#wv3)"
        d="M0,240 C210,280 410,200 610,230 C810,260 1000,200 1200,240 L1200,320 L0,320 Z"
      />
    </svg>
  );
}
