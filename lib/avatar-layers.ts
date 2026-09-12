import type { AvatarLayer, AvatarProject } from '@/types/avatar-project';

/** Fills the canvas edge-to-edge by default, matching how the avatar has always rendered. */
export function createDefaultAvatarLayer(zIndex = 0): AvatarLayer {
  return {
    id: crypto.randomUUID(),
    assetId: 'avatar',
    type: 'avatar',
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    zIndex,
  };
}

/**
 * Projects created before avatar move/resize support don't have an 'avatar'
 * layer in `layers` — synthesize one below every existing prop so the
 * avatar keeps rendering exactly where it always has (full-canvas, behind
 * every prop) until the user explicitly repositions or reorders it.
 */
export function ensureAvatarLayer(project: AvatarProject): AvatarProject {
  if (project.layers.some((layer) => layer.type === 'avatar')) return project;
  const nonBackgroundZIndexes = project.layers
    .filter((layer) => layer.type !== 'background')
    .map((layer) => layer.zIndex);
  const belowAllZIndex = (nonBackgroundZIndexes.length > 0 ? Math.min(...nonBackgroundZIndexes) : 0) - 1;
  return { ...project, layers: [createDefaultAvatarLayer(belowAllZIndex), ...project.layers] };
}
