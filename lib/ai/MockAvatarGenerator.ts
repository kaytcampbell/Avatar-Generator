import type { AvatarGenerationInput, GeneratedAvatar } from '@/types/generation';
import type { AvatarGenerator } from './AvatarGenerator';

const CATALOG_SIZE = 4;
const AVATAR_DIMENSION = 512;

export interface MockAvatarGeneratorOptions {
  delayMs?: number;
  variationCount?: number;
  /** 0-1 chance that generate() rejects, for exercising the /create error state. */
  failureRate?: number;
}

/**
 * Stands in for a real image-generation API. It intentionally does not attempt
 * to transform the uploaded photo's pixels (infeasible without a real model) —
 * it returns a fresh selection of the canned stylized-avatar catalog so the
 * rest of the app (loading state, selection, editor) can be built and tested
 * without an OpenAI API key.
 */
export class MockAvatarGenerator implements AvatarGenerator {
  private readonly delayMs: number;
  private readonly variationCount: number;
  private readonly failureRate: number;

  constructor(options: MockAvatarGeneratorOptions = {}) {
    this.delayMs = options.delayMs ?? 1200;
    this.variationCount = options.variationCount ?? 4;
    this.failureRate = options.failureRate ?? 0;
  }

  async generate(input: AvatarGenerationInput): Promise<GeneratedAvatar[]> {
    // The mock doesn't transform the uploaded photo's pixels, so the input is unused.
    void input;
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));

    if (this.failureRate > 0 && Math.random() < this.failureRate) {
      throw new Error('Avatar generation failed. Please try again.');
    }

    const batchId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    return Array.from({ length: this.variationCount }, (_, i) => {
      const catalogIndex = (i % CATALOG_SIZE) + 1;
      return {
        id: `mock-${batchId}-${i}`,
        url: `/assets/avatars/avatar-${catalogIndex}.svg`,
        width: AVATAR_DIMENSION,
        height: AVATAR_DIMENSION,
      };
    });
  }
}
