import { describe, expect, it } from 'vitest';
import { sampleGifAnimation } from './gifPresets';

describe('sampleGifAnimation', () => {
  it('samples bounce: y returns to 0 at the start, peaks at -20 mid-cycle', () => {
    expect(sampleGifAnimation('bounce', 0).y).toBe(0);
    expect(sampleGifAnimation('bounce', 0.5).y).toBe(-20);
  });

  it('samples spin: rotate is linear from 0 to 360 across the cycle', () => {
    expect(sampleGifAnimation('spin', 0).rotate).toBe(0);
    expect(sampleGifAnimation('spin', 0.5).rotate).toBe(180);
    expect(sampleGifAnimation('spin', 1).rotate).toBe(360);
  });

  it('samples pulse: scale peaks at 1.08 mid-cycle and returns to 1', () => {
    expect(sampleGifAnimation('pulse', 0).scale).toBe(1);
    expect(sampleGifAnimation('pulse', 0.5).scale).toBe(1.08);
    expect(sampleGifAnimation('pulse', 1).scale).toBe(1);
  });

  it('samples shake: x oscillates through its keyframe path', () => {
    expect(sampleGifAnimation('shake', 0).x).toBe(0);
    expect(sampleGifAnimation('shake', 0.2).x).toBe(-6);
    expect(sampleGifAnimation('shake', 0.4).x).toBe(6);
  });

  it('leaves inactive axes at their identity value for every kind', () => {
    const bounce = sampleGifAnimation('bounce', 0.3);
    expect(bounce.x).toBe(0);
    expect(bounce.scale).toBe(1);
    expect(bounce.rotate).toBe(0);

    const spin = sampleGifAnimation('spin', 0.7);
    expect(spin.x).toBe(0);
    expect(spin.y).toBe(0);
    expect(spin.scale).toBe(1);
  });

  it('returns identity for none at any progress', () => {
    expect(sampleGifAnimation('none', 0.5)).toEqual({ x: 0, y: 0, scale: 1, rotate: 0 });
  });

  it('samples wiggle: rotate oscillates through its keyframe path', () => {
    expect(sampleGifAnimation('wiggle', 0).rotate).toBe(0);
    expect(sampleGifAnimation('wiggle', 0.2).rotate).toBe(-8);
    expect(sampleGifAnimation('wiggle', 0.4).rotate).toBe(8);
  });

  it('samples wave: x sways from -12 to 12 across the cycle', () => {
    expect(sampleGifAnimation('wave', 0).x).toBe(0);
    expect(sampleGifAnimation('wave', 1 / 3).x).toBe(-12);
    expect(sampleGifAnimation('wave', 2 / 3).x).toBe(12);
  });

  it('samples heartbeat: scale double-pulses to 1.15 and back to 1', () => {
    expect(sampleGifAnimation('heartbeat', 0).scale).toBe(1);
    expect(sampleGifAnimation('heartbeat', 0.25).scale).toBe(1.15);
    expect(sampleGifAnimation('heartbeat', 0.5).scale).toBe(1);
    expect(sampleGifAnimation('heartbeat', 0.75).scale).toBe(1.15);
  });

  it('samples jump: y hops to -30 while scale squashes and stretches', () => {
    expect(sampleGifAnimation('jump', 0)).toMatchObject({ y: 0, scale: 1 });
    expect(sampleGifAnimation('jump', 0.5)).toMatchObject({ y: -30, scale: 0.85 });
    expect(sampleGifAnimation('jump', 0.75).scale).toBe(1.1);
  });

  it('leaves inactive axes at identity for the new kinds too', () => {
    const wiggle = sampleGifAnimation('wiggle', 0.3);
    expect(wiggle.x).toBe(0);
    expect(wiggle.y).toBe(0);
    expect(wiggle.scale).toBe(1);

    const jump = sampleGifAnimation('jump', 0.5);
    expect(jump.x).toBe(0);
    expect(jump.rotate).toBe(0);
  });
});
