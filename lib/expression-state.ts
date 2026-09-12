import type { AvatarExpressionState, AvatarProject } from '@/types/avatar-project';

export function createDefaultExpressionState(): AvatarExpressionState {
  return { activeId: null, variants: {} };
}

/**
 * Projects saved before this feature existed have no `expression` field —
 * default it in rather than sprinkling `project.expression?.` null checks
 * everywhere downstream, mirroring ensureAvatarLayer's normalize-on-load
 * pattern.
 */
export function ensureExpressionState(project: AvatarProject): AvatarProject {
  if (project.expression) return project;
  return { ...project, expression: createDefaultExpressionState() };
}
