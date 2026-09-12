import { describe, expect, it } from 'vitest';
import { createDefaultAvatarLayer, ensureAvatarLayer } from './avatar-layers';
import type { AvatarLayer, AvatarProject } from '@/types/avatar-project';

function buildProject(layers: AvatarLayer[]): AvatarProject {
  return {
    id: 'project-1',
    userId: 'local-user',
    name: 'Untitled Avatar',
    baseAvatarUrl: '/assets/avatars/avatar-1.svg',
    layers,
    animation: null,
    expression: { activeId: null, variants: {} },
    canvasSettings: { width: 512, height: 512, backgroundColor: 'transparent' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

function buildLayer(overrides: Partial<AvatarLayer> = {}): AvatarLayer {
  return {
    id: 'layer-1',
    assetId: 'hat-cap',
    type: 'prop',
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    zIndex: 0,
    ...overrides,
  };
}

describe('createDefaultAvatarLayer', () => {
  it('fills the canvas edge-to-edge by default', () => {
    const layer = createDefaultAvatarLayer();
    expect(layer).toMatchObject({ type: 'avatar', x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, zIndex: 0 });
  });

  it('accepts a custom zIndex', () => {
    expect(createDefaultAvatarLayer(-1).zIndex).toBe(-1);
  });
});

describe('ensureAvatarLayer', () => {
  it('leaves a project with an avatar layer untouched', () => {
    const project = buildProject([createDefaultAvatarLayer(), buildLayer()]);

    expect(ensureAvatarLayer(project)).toBe(project);
  });

  it('synthesizes an avatar layer below every existing prop for a legacy project', () => {
    const prop = buildLayer({ zIndex: 0 });
    const project = buildProject([prop]);

    const next = ensureAvatarLayer(project);

    const avatarLayer = next.layers.find((layer) => layer.type === 'avatar');
    expect(avatarLayer).toBeDefined();
    expect(avatarLayer?.zIndex).toBeLessThan(prop.zIndex);
    expect(next.layers).toContainEqual(prop);
  });

  it('ignores background layers when computing the synthesized zIndex', () => {
    const background = buildLayer({ id: 'bg-1', type: 'background', zIndex: -100 });
    const prop = buildLayer({ zIndex: 3 });
    const project = buildProject([background, prop]);

    const next = ensureAvatarLayer(project);

    const avatarLayer = next.layers.find((layer) => layer.type === 'avatar');
    expect(avatarLayer?.zIndex).toBe(2);
  });
});
