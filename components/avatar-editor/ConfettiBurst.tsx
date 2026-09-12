'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotate: number;
  color: string;
  delay: number;
}

const COLORS = ['#F87171', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6'];
const PIECE_COUNT = 18;

function generatePieces(): ConfettiPiece[] {
  return Array.from({ length: PIECE_COUNT }, (_, i) => {
    // Spread evenly around a full circle, with a little randomness per piece
    // so the burst doesn't look mechanically uniform.
    const angle = (Math.PI * 2 * i) / PIECE_COUNT + (Math.random() - 0.5) * 0.6;
    const distance = 50 + Math.random() * 60;
    return {
      id: i,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance - 10,
      rotate: Math.random() * 360 - 180,
      color: COLORS[i % COLORS.length],
      delay: Math.random() * 0.08,
    };
  });
}

interface ConfettiBurstProps {
  /** Incremented by the caller to fire a new burst — a counter rather than a
   * boolean so repeated successes always replay the animation, even if the
   * previous burst already finished. */
  trigger: number;
}

export function ConfettiBurst({ trigger }: ConfettiBurstProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  // Adjusts state during render when a prop changes (React's sanctioned
  // pattern for this, per the NumberField precedent in PropertiesPanel)
  // rather than in a useEffect — avoids an extra render pass and the
  // react-hooks/set-state-in-effect lint rule.
  const [lastTrigger, setLastTrigger] = useState(trigger);
  if (trigger !== lastTrigger) {
    setLastTrigger(trigger);
    setPieces(generatePieces());
  }

  // The clear-after-delay setState below runs inside a setTimeout callback,
  // not synchronously in the effect body, so it's exempt from that rule.
  useEffect(() => {
    if (pieces.length === 0) return;
    const timeout = setTimeout(() => setPieces([]), 900);
    return () => clearTimeout(timeout);
  }, [pieces]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden="true">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.span
            key={`${trigger}-${piece.id}`}
            className="absolute top-1/2 left-1/2 block h-2 w-2 rounded-sm"
            style={{ backgroundColor: piece.color }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
            animate={{ x: piece.x, y: piece.y, opacity: 0, rotate: piece.rotate, scale: 0.6 }}
            transition={{ duration: 0.8, delay: piece.delay, ease: 'easeOut' }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
