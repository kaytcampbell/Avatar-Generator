import type { AnimationKind } from '@/types/avatar-project';

export interface GifAnimationPreset {
  keyframes: { x: number | number[]; y: number | number[]; scale: number | number[]; rotate: number | number[] };
  durationMs: number;
  ease: 'linear' | 'easeInOut';
}

/**
 * Independent from AvatarCanvas.tsx's ANIMATIONS table (which drives the live
 * Framer Motion preview) rather than refactored to share it — that table is
 * already debugged and working, and five fixed, rarely-changed animation
 * definitions carry low drift risk. Keep the numeric values in sync with
 * AvatarCanvas.tsx's ANIMATIONS if either ever changes.
 */
export const GIF_ANIMATION_PRESETS: Record<AnimationKind, GifAnimationPreset> = {
  none: { keyframes: { x: 0, y: 0, scale: 1, rotate: 0 }, durationMs: 200, ease: 'linear' },
  bounce: { keyframes: { x: 0, y: [0, -20, 0], scale: 1, rotate: 0 }, durationMs: 600, ease: 'easeInOut' },
  float: { keyframes: { x: 0, y: [0, -10, 0], scale: 1, rotate: 0 }, durationMs: 2500, ease: 'easeInOut' },
  pulse: { keyframes: { x: 0, y: 0, scale: [1, 1.08, 1], rotate: 0 }, durationMs: 1000, ease: 'easeInOut' },
  shake: { keyframes: { x: [0, -6, 6, -6, 6, 0], y: 0, scale: 1, rotate: 0 }, durationMs: 500, ease: 'easeInOut' },
  spin: { keyframes: { x: 0, y: 0, scale: 1, rotate: [0, 360] }, durationMs: 2000, ease: 'linear' },
  wiggle: { keyframes: { x: 0, y: 0, scale: 1, rotate: [0, -8, 8, -8, 8, 0] }, durationMs: 600, ease: 'easeInOut' },
  wave: { keyframes: { x: [0, -12, 12, 0], y: 0, scale: 1, rotate: 0 }, durationMs: 2000, ease: 'easeInOut' },
  heartbeat: { keyframes: { x: 0, y: 0, scale: [1, 1.15, 1, 1.15, 1], rotate: 0 }, durationMs: 1000, ease: 'easeInOut' },
  jump: { keyframes: { x: 0, y: [0, -30, 0], scale: [1, 1, 0.85, 1.1, 1], rotate: 0 }, durationMs: 400, ease: 'easeInOut' },
};

function sampleAxis(keyframes: number | number[], progress: number, ease: 'linear' | 'easeInOut'): number {
  if (typeof keyframes === 'number') return keyframes;
  const segments = keyframes.length - 1;
  if (segments <= 0) return keyframes[0] ?? 0;
  const scaled = progress * segments;
  const index = Math.min(Math.floor(scaled), segments - 1);
  let local = scaled - index;
  if (ease === 'easeInOut') {
    local = local < 0.5 ? 2 * local * local : 1 - (-2 * local + 2) ** 2 / 2;
  }
  return keyframes[index] + (keyframes[index + 1] - keyframes[index]) * local;
}

export interface SampledAnimationFrame {
  x: number;
  y: number;
  scale: number;
  rotate: number;
}

/** Samples the animation's transform at a point in its cycle (progress: 0..1, exclusive of 1). */
export function sampleGifAnimation(kind: AnimationKind, progress: number): SampledAnimationFrame {
  const preset = GIF_ANIMATION_PRESETS[kind];
  return {
    x: sampleAxis(preset.keyframes.x, progress, preset.ease),
    y: sampleAxis(preset.keyframes.y, progress, preset.ease),
    scale: sampleAxis(preset.keyframes.scale, progress, preset.ease),
    rotate: sampleAxis(preset.keyframes.rotate, progress, preset.ease),
  };
}
