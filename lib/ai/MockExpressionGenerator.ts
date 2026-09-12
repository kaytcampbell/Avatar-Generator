import type { ExpressionGenerationInput, GeneratedExpression } from '@/types/generation';
import type { ExpressionGenerator } from './ExpressionGenerator';

export interface MockExpressionGeneratorOptions {
  delayMs?: number;
  failureRate?: number;
}

/**
 * Stands in for a real image-edit API. Doesn't attempt to actually redraw an
 * expression (infeasible without a real model) — just echoes the same
 * avatar URL back after a fake delay, with no network calls, so the
 * generate/cache/switch round trip can be built and tested without an
 * OpenAI API key.
 */
export class MockExpressionGenerator implements ExpressionGenerator {
  private readonly delayMs: number;
  private readonly failureRate: number;

  constructor(options: MockExpressionGeneratorOptions = {}) {
    this.delayMs = options.delayMs ?? 1200;
    this.failureRate = options.failureRate ?? 0;
  }

  async generate(input: ExpressionGenerationInput): Promise<GeneratedExpression> {
    void input.expressionPrompt;
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));

    if (this.failureRate > 0 && Math.random() < this.failureRate) {
      throw new Error('Expression generation failed. Please try again.');
    }

    return { url: input.avatarUrl };
  }
}
