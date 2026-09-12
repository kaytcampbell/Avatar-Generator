import type { AvatarGenerator } from './AvatarGenerator';
import { MockAvatarGenerator } from './MockAvatarGenerator';
import { OpenAIAvatarGenerator } from './OpenAIAvatarGenerator';
import type { PropGenerator } from './PropGenerator';
import { MockPropGenerator } from './MockPropGenerator';
import { OpenAIPropGenerator } from './OpenAIPropGenerator';
import type { ExpressionGenerator } from './ExpressionGenerator';
import { MockExpressionGenerator } from './MockExpressionGenerator';
import { OpenAIExpressionGenerator } from './OpenAIExpressionGenerator';

export type { AvatarGenerator } from './AvatarGenerator';
export type { PropGenerator } from './PropGenerator';
export type { ExpressionGenerator } from './ExpressionGenerator';

let avatarInstance: AvatarGenerator | null = null;
let propInstance: PropGenerator | null = null;
let expressionInstance: ExpressionGenerator | null = null;

/**
 * Single seam for swapping generators. Server-only — callers must be Route
 * Handlers or other server code, never client components, since the OpenAI
 * key can't reach the browser.
 */
export function getAvatarGenerator(): AvatarGenerator {
  if (!avatarInstance) {
    avatarInstance = process.env.OPENAI_API_KEY ? new OpenAIAvatarGenerator() : new MockAvatarGenerator();
  }
  return avatarInstance;
}

/** Same swap seam as getAvatarGenerator(), for custom-prop generation. */
export function getPropGenerator(): PropGenerator {
  if (!propInstance) {
    propInstance = process.env.OPENAI_API_KEY ? new OpenAIPropGenerator() : new MockPropGenerator();
  }
  return propInstance;
}

/** Same swap seam as getAvatarGenerator(), for expression regeneration. */
export function getExpressionGenerator(): ExpressionGenerator {
  if (!expressionInstance) {
    expressionInstance = process.env.OPENAI_API_KEY ? new OpenAIExpressionGenerator() : new MockExpressionGenerator();
  }
  return expressionInstance;
}
