'use client';

export function AnimatedGrid() {
  return (
    <div
      className="absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage: `linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)`,
        backgroundSize: '64px 64px',
        animation: 'gridShift 20s linear infinite',
      }}
    />
  );
}
