
import React from 'react';
import { Coordinates } from '../types';

interface PendulumProps {
  bobs: Coordinates[];
  pivot: Coordinates;
  trace: Coordinates[];
  bobRadii: number[];
  bobColors: string[];
  showRods: boolean;
  viewBox: string;
}

const Pendulum: React.FC<PendulumProps> = ({ pivot, bobs, trace, bobRadii, bobColors, showRods, viewBox }) => {
  const tracePoints = trace.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <svg viewBox={viewBox} className="w-full h-full drop-shadow-2xl">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="traceGradient" gradientTransform="rotate(90)">
          <stop offset="0%" stopColor="#fde047" stopOpacity="0" />
          <stop offset="100%" stopColor="#facc15" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Trace Path */}
      {trace.length > 1 && (
        <polyline
          points={tracePoints}
          fill="none"
          stroke="url(#traceGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}

      {/* Rods */}
      {showRods && (
        <>
          {bobs.length > 0 && (
            <line x1={pivot.x} y1={pivot.y} x2={bobs[0].x} y2={bobs[0].y} stroke="#94a3b8" strokeWidth="4" />
          )}
          {bobs.map((bob, i) =>
            i > 0 ? <line key={`rod-${i}`} x1={bobs[i-1].x} y1={bobs[i-1].y} x2={bob.x} y2={bob.y} stroke="#94a3b8" strokeWidth="4" /> : null
          )}
        </>
      )}


      {/* Pivot Point */}
      <circle cx={pivot.x} cy={pivot.y} r="6" fill="#cbd5e1" />

      {/* Bobs */}
      {bobs.map((bob, i) => (
         <circle key={`bob-${i}`} cx={bob.x} cy={bob.y} r={bobRadii[i]} fill={bobColors[i]} style={{ filter: 'url(#glow)' }} />
      ))}
    </svg>
  );
};

export default Pendulum;
