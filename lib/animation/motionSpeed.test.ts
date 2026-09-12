import { describe, expect, it } from 'vitest';
import { scaleTransition } from './motionSpeed';

describe('scaleTransition', () => {
  it('divides the duration of a looping axis by the speed multiplier', () => {
    const transition = { y: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' } };
    expect(scaleTransition(transition, 2).y).toEqual({ duration: 0.3, repeat: Infinity, ease: 'easeInOut' });
    expect(scaleTransition(transition, 0.5).y).toEqual({ duration: 1.2, repeat: Infinity, ease: 'easeInOut' });
  });

  it('leaves one-time settle transitions (no repeat: Infinity) untouched', () => {
    const transition = { x: { duration: 0.2 } };
    expect(scaleTransition(transition, 2).x).toEqual({ duration: 0.2 });
  });

  it('is a no-op at speed 1', () => {
    const transition = { rotate: { duration: 2, repeat: Infinity, ease: 'linear' } };
    expect(scaleTransition(transition, 1)).toEqual(transition);
  });

  it('scales only the looping axis among several', () => {
    const transition = {
      x: { duration: 0.2 },
      y: { duration: 0.6, repeat: Infinity, ease: 'easeInOut' },
      scale: { duration: 0.2 },
      rotate: { duration: 0.2 },
    };
    const result = scaleTransition(transition, 2);
    expect(result.x).toEqual({ duration: 0.2 });
    expect(result.y).toEqual({ duration: 0.3, repeat: Infinity, ease: 'easeInOut' });
    expect(result.scale).toEqual({ duration: 0.2 });
  });
});
