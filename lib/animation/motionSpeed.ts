interface AxisTransition {
  duration?: number;
  repeat?: number;
  ease?: string;
}

/**
 * Scales only the looping (repeat: Infinity) axis of an animation's
 * transition map by a speed multiplier — the one-time "settle" transitions
 * on the other axes reset to baseline at a fixed pace regardless of speed,
 * so they're left untouched.
 */
export function scaleTransition(
  transition: Record<string, object>,
  speed: number,
): Record<string, object> {
  const scaled: Record<string, object> = {};
  for (const [axis, value] of Object.entries(transition)) {
    const axisTransition = value as AxisTransition;
    scaled[axis] =
      axisTransition.repeat === Infinity && typeof axisTransition.duration === 'number'
        ? { ...axisTransition, duration: axisTransition.duration / speed }
        : axisTransition;
  }
  return scaled;
}
