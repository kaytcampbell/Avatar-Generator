import { describe, expect, it } from 'vitest';
import { createDefaultExpressionState, ensureExpressionState } from './expression-state';
import type { AvatarProject } from '@/types/avatar-project';

function buildProject(overrides: Partial<AvatarProject> = {}): AvatarProject {
  return {
    id: 'project-1',
    userId: 'local-user',
    name: 'Untitled Avatar',
    baseAvatarUrl: '/assets/avatars/avatar-1.svg',
    layers: [],
    animation: null,
    expression: createDefaultExpressionState(),
    canvasSettings: { width: 512, height: 512, backgroundColor: 'transparent' },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('createDefaultExpressionState', () => {
  it('defaults to no active expression and an empty variant cache', () => {
    expect(createDefaultExpressionState()).toEqual({ activeId: null, variants: {} });
  });
});

describe('ensureExpressionState', () => {
  it('leaves a project with an expression field untouched', () => {
    const project = buildProject({ expression: { activeId: 'happy', variants: { happy: 'url' } } });

    expect(ensureExpressionState(project)).toBe(project);
  });

  it('synthesizes a default expression state for a legacy project missing the field', () => {
    const project = buildProject();
    // Simulates a project saved before this feature existed.
    // @ts-expect-error deliberately omitting the field to test back-compat
    delete project.expression;

    const next = ensureExpressionState(project);

    expect(next.expression).toEqual({ activeId: null, variants: {} });
  });
});
