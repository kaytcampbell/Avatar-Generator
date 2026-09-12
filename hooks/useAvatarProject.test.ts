import { describe, expect, it } from 'vitest';
import { avatarProjectReducer, type EditorState } from './useAvatarProject';
import type { AvatarLayer, AvatarProject } from '@/types/avatar-project';

function buildProject(layers: AvatarLayer[] = []): AvatarProject {
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
    x: 196,
    y: 196,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    zIndex: 0,
    ...overrides,
  };
}

function readyState(project: AvatarProject): EditorState {
  return {
    project,
    selectedLayerId: null,
    status: 'ready',
    loadError: null,
    saveStatus: 'idle',
    saveError: null,
  };
}

describe('avatarProjectReducer', () => {
  it('adds a layer and selects it', () => {
    const state = readyState(buildProject());
    const layer = buildLayer();

    const next = avatarProjectReducer(state, { type: 'ADD_LAYER', layer });

    expect(next.project?.layers).toEqual([layer]);
    expect(next.selectedLayerId).toBe(layer.id);
  });

  it('selects a layer by id', () => {
    const state = readyState(buildProject([buildLayer()]));

    const next = avatarProjectReducer(state, { type: 'SELECT_LAYER', layerId: 'layer-1' });

    expect(next.selectedLayerId).toBe('layer-1');
  });

  it('clears selection when layerId is null', () => {
    const state = { ...readyState(buildProject([buildLayer()])), selectedLayerId: 'layer-1' };

    const next = avatarProjectReducer(state, { type: 'SELECT_LAYER', layerId: null });

    expect(next.selectedLayerId).toBeNull();
  });

  it('moves a layer to a new position without affecting other layers', () => {
    const other = buildLayer({ id: 'layer-2', x: 10, y: 10 });
    const state = readyState(buildProject([buildLayer(), other]));

    const next = avatarProjectReducer(state, { type: 'MOVE_LAYER', layerId: 'layer-1', x: 300, y: 400 });

    const moved = next.project?.layers.find((l) => l.id === 'layer-1');
    const untouched = next.project?.layers.find((l) => l.id === 'layer-2');
    expect(moved).toMatchObject({ x: 300, y: 400 });
    expect(untouched).toEqual(other);
  });

  it('updates only the patched fields on the target layer', () => {
    const other = buildLayer({ id: 'layer-2' });
    const state = readyState(buildProject([buildLayer(), other]));

    const next = avatarProjectReducer(state, {
      type: 'UPDATE_LAYER',
      layerId: 'layer-1',
      patch: { scaleX: 2, scaleY: 2, rotation: 45 },
    });

    const updated = next.project?.layers.find((l) => l.id === 'layer-1');
    const untouched = next.project?.layers.find((l) => l.id === 'layer-2');
    expect(updated).toMatchObject({ scaleX: 2, scaleY: 2, rotation: 45, x: 196, y: 196 });
    expect(untouched).toEqual(other);
  });

  it('deletes a layer and clears selection only if it was selected', () => {
    const state = {
      ...readyState(buildProject([buildLayer(), buildLayer({ id: 'layer-2' })])),
      selectedLayerId: 'layer-1',
    };

    const next = avatarProjectReducer(state, { type: 'DELETE_LAYER', layerId: 'layer-1' });

    expect(next.project?.layers).toEqual([buildLayer({ id: 'layer-2' })]);
    expect(next.selectedLayerId).toBeNull();
  });

  it('does not clear selection when deleting an unselected layer', () => {
    const state = {
      ...readyState(buildProject([buildLayer(), buildLayer({ id: 'layer-2' })])),
      selectedLayerId: 'layer-2',
    };

    const next = avatarProjectReducer(state, { type: 'DELETE_LAYER', layerId: 'layer-1' });

    expect(next.selectedLayerId).toBe('layer-2');
  });

  it('duplicates a layer, appending and selecting the new layer while leaving the source untouched', () => {
    const source = buildLayer();
    const state = readyState(buildProject([source]));
    const duplicate = buildLayer({ id: 'layer-2', x: 212, y: 212, zIndex: 1 });

    const next = avatarProjectReducer(state, { type: 'DUPLICATE_LAYER', sourceLayerId: 'layer-1', newLayer: duplicate });

    expect(next.project?.layers).toEqual([source, duplicate]);
    expect(next.selectedLayerId).toBe('layer-2');
  });

  it('reorders a layer forward and backward by swapping zIndex with its neighbor', () => {
    const back = buildLayer({ id: 'layer-1', zIndex: 0 });
    const front = buildLayer({ id: 'layer-2', zIndex: 1 });
    const state = readyState(buildProject([back, front]));

    const forwarded = avatarProjectReducer(state, { type: 'REORDER_LAYER', layerId: 'layer-1', direction: 'forward' });
    expect(forwarded.project?.layers.find((l) => l.id === 'layer-1')?.zIndex).toBe(1);
    expect(forwarded.project?.layers.find((l) => l.id === 'layer-2')?.zIndex).toBe(0);

    const backed = avatarProjectReducer(forwarded, { type: 'REORDER_LAYER', layerId: 'layer-1', direction: 'backward' });
    expect(backed.project?.layers.find((l) => l.id === 'layer-1')?.zIndex).toBe(0);
    expect(backed.project?.layers.find((l) => l.id === 'layer-2')?.zIndex).toBe(1);
  });

  it('reorders a prop behind the avatar and back in front of it', () => {
    const avatar = buildLayer({ id: 'avatar-1', type: 'avatar', assetId: 'avatar', zIndex: 0 });
    const prop = buildLayer({ id: 'layer-1', zIndex: 1 });
    const state = readyState(buildProject([avatar, prop]));

    const sentBack = avatarProjectReducer(state, { type: 'REORDER_LAYER', layerId: 'layer-1', direction: 'backward' });
    expect(sentBack.project?.layers.find((l) => l.id === 'layer-1')?.zIndex).toBe(0);
    expect(sentBack.project?.layers.find((l) => l.id === 'avatar-1')?.zIndex).toBe(1);

    const broughtForward = avatarProjectReducer(sentBack, {
      type: 'REORDER_LAYER',
      layerId: 'layer-1',
      direction: 'forward',
    });
    expect(broughtForward.project?.layers.find((l) => l.id === 'layer-1')?.zIndex).toBe(1);
    expect(broughtForward.project?.layers.find((l) => l.id === 'avatar-1')?.zIndex).toBe(0);
  });

  it('lets the avatar itself be reordered relative to a prop', () => {
    const avatar = buildLayer({ id: 'avatar-1', type: 'avatar', assetId: 'avatar', zIndex: 0 });
    const prop = buildLayer({ id: 'layer-1', zIndex: 1 });
    const state = readyState(buildProject([avatar, prop]));

    const next = avatarProjectReducer(state, { type: 'REORDER_LAYER', layerId: 'avatar-1', direction: 'forward' });

    expect(next.project?.layers.find((l) => l.id === 'avatar-1')?.zIndex).toBe(1);
    expect(next.project?.layers.find((l) => l.id === 'layer-1')?.zIndex).toBe(0);
  });

  it('never picks a background as a reorder neighbor for the avatar or a prop', () => {
    const background = buildLayer({ id: 'bg-1', type: 'background', assetId: 'bg-sky', zIndex: -5 });
    const avatar = buildLayer({ id: 'avatar-1', type: 'avatar', assetId: 'avatar', zIndex: 0 });
    const state = readyState(buildProject([background, avatar]));

    const next = avatarProjectReducer(state, { type: 'REORDER_LAYER', layerId: 'avatar-1', direction: 'backward' });

    expect(next.project?.layers).toEqual([background, avatar]);
  });

  it('no-ops reordering at the top or bottom boundary', () => {
    const back = buildLayer({ id: 'layer-1', zIndex: 0 });
    const front = buildLayer({ id: 'layer-2', zIndex: 1 });
    const state = readyState(buildProject([back, front]));

    const pastTop = avatarProjectReducer(state, { type: 'REORDER_LAYER', layerId: 'layer-2', direction: 'forward' });
    expect(pastTop.project?.layers).toEqual([back, front]);

    const pastBottom = avatarProjectReducer(state, { type: 'REORDER_LAYER', layerId: 'layer-1', direction: 'backward' });
    expect(pastBottom.project?.layers).toEqual([back, front]);
  });

  it('sets a non-none animation with composition as the target and default speed', () => {
    const state = readyState(buildProject());

    const next = avatarProjectReducer(state, { type: 'SET_ANIMATION', kind: 'bounce' });

    expect(next.project?.animation).toEqual({ kind: 'bounce', target: 'composition', speed: 1 });
  });

  it('preserves the current speed when switching between animation kinds', () => {
    const project = buildProject();
    project.animation = { kind: 'spin', target: 'composition', speed: 2 };
    const state = readyState(project);

    const next = avatarProjectReducer(state, { type: 'SET_ANIMATION', kind: 'bounce' });

    expect(next.project?.animation).toEqual({ kind: 'bounce', target: 'composition', speed: 2 });
  });

  it('clears the animation when set to none', () => {
    const project = buildProject();
    project.animation = { kind: 'spin', target: 'composition', speed: 1 };
    const state = readyState(project);

    const next = avatarProjectReducer(state, { type: 'SET_ANIMATION', kind: 'none' });

    expect(next.project?.animation).toBeNull();
  });

  it('updates the speed of an active animation', () => {
    const project = buildProject();
    project.animation = { kind: 'spin', target: 'composition', speed: 1 };
    const state = readyState(project);

    const next = avatarProjectReducer(state, { type: 'SET_ANIMATION_SPEED', speed: 1.5 });

    expect(next.project?.animation).toEqual({ kind: 'spin', target: 'composition', speed: 1.5 });
  });

  it('is a no-op setting speed when there is no active animation', () => {
    const state = readyState(buildProject());

    const next = avatarProjectReducer(state, { type: 'SET_ANIMATION_SPEED', speed: 2 });

    expect(next.project?.animation).toBeNull();
  });

  it('sets a background when none exists, leaving props untouched', () => {
    const prop = buildLayer();
    const state = readyState(buildProject([prop]));
    const background = buildLayer({ id: 'bg-1', type: 'background', assetId: 'bg-sky' });

    const next = avatarProjectReducer(state, { type: 'SET_BACKGROUND', layer: background });

    expect(next.project?.layers).toEqual([prop, background]);
  });

  it('replaces an existing background rather than stacking', () => {
    const prop = buildLayer();
    const oldBackground = buildLayer({ id: 'bg-1', type: 'background', assetId: 'bg-sky' });
    const state = readyState(buildProject([prop, oldBackground]));
    const newBackground = buildLayer({ id: 'bg-2', type: 'background', assetId: 'bg-mint' });

    const next = avatarProjectReducer(state, { type: 'SET_BACKGROUND', layer: newBackground });

    expect(next.project?.layers).toEqual([prop, newBackground]);
  });

  it('removes the background when set to null', () => {
    const prop = buildLayer();
    const background = buildLayer({ id: 'bg-1', type: 'background', assetId: 'bg-sky' });
    const state = readyState(buildProject([prop, background]));

    const next = avatarProjectReducer(state, { type: 'SET_BACKGROUND', layer: null });

    expect(next.project?.layers).toEqual([prop]);
  });

  it('sets the active expression id without touching the variant cache', () => {
    const project = buildProject([]);
    project.expression = { activeId: null, variants: { happy: 'https://example.com/happy.png' } };
    const state = readyState(project);

    const next = avatarProjectReducer(state, { type: 'SET_EXPRESSION', expressionId: 'happy' });

    expect(next.project?.expression).toEqual({
      activeId: 'happy',
      variants: { happy: 'https://example.com/happy.png' },
    });
  });

  it('clears the active expression when set to null', () => {
    const project = buildProject([]);
    project.expression = { activeId: 'happy', variants: { happy: 'https://example.com/happy.png' } };
    const state = readyState(project);

    const next = avatarProjectReducer(state, { type: 'SET_EXPRESSION', expressionId: null });

    expect(next.project?.expression.activeId).toBeNull();
  });

  it('caches a newly generated expression variant and activates it', () => {
    const state = readyState(buildProject([]));

    const next = avatarProjectReducer(state, {
      type: 'ADD_EXPRESSION_VARIANT',
      expressionId: 'sad',
      url: 'https://example.com/sad.png',
    });

    expect(next.project?.expression).toEqual({
      activeId: 'sad',
      variants: { sad: 'https://example.com/sad.png' },
    });
  });

  it('adds a second variant alongside an existing one', () => {
    const project = buildProject([]);
    project.expression = { activeId: 'happy', variants: { happy: 'https://example.com/happy.png' } };
    const state = readyState(project);

    const next = avatarProjectReducer(state, {
      type: 'ADD_EXPRESSION_VARIANT',
      expressionId: 'sad',
      url: 'https://example.com/sad.png',
    });

    expect(next.project?.expression).toEqual({
      activeId: 'sad',
      variants: { happy: 'https://example.com/happy.png', sad: 'https://example.com/sad.png' },
    });
  });

  it('renames the project without touching anything else', () => {
    const project = buildProject([buildLayer()]);
    const state = readyState(project);

    const next = avatarProjectReducer(state, { type: 'RENAME_PROJECT', name: 'New Name' });

    expect(next.project?.name).toBe('New Name');
    expect(next.project?.layers).toEqual(project.layers);
  });

  it('restores a project snapshot and clears the selection', () => {
    const original = buildProject([buildLayer()]);
    const state = { ...readyState(original), selectedLayerId: 'layer-1' };
    const snapshot = buildProject([]);

    const next = avatarProjectReducer(state, { type: 'RESTORE_PROJECT', project: snapshot });

    expect(next.project).toBe(snapshot);
    expect(next.selectedLayerId).toBeNull();
  });

  it('serializes and round-trips project state through JSON', () => {
    const project = buildProject([buildLayer()]);

    const roundTripped = JSON.parse(JSON.stringify(project)) as AvatarProject;

    expect(roundTripped).toEqual(project);
  });

  it('tracks save lifecycle transitions', () => {
    const state = readyState(buildProject());

    const saving = avatarProjectReducer(state, { type: 'SAVE_START' });
    expect(saving.saveStatus).toBe('saving');

    const saved = avatarProjectReducer(saving, { type: 'SAVE_SUCCESS', updatedAt: '2026-01-02T00:00:00.000Z' });
    expect(saved.saveStatus).toBe('saved');
    expect(saved.project?.updatedAt).toBe('2026-01-02T00:00:00.000Z');

    const failed = avatarProjectReducer(state, { type: 'SAVE_ERROR', error: 'network down' });
    expect(failed.saveStatus).toBe('error');
    expect(failed.saveError).toBe('network down');
  });
});
