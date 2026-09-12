import type { PropGenerationInput, GeneratedProp, PropGenerator } from './PropGenerator';

const CATALOG = [
  '/assets/props/hats/cap.svg',
  '/assets/props/hats/top-hat.svg',
  '/assets/props/hats/beanie.svg',
  '/assets/props/glasses/sunglasses.svg',
  '/assets/props/accessories/bowtie.svg',
];
const PROP_DIMENSION = 240;

export interface MockPropGeneratorOptions {
  delayMs?: number;
  failureRate?: number;
}

/**
 * Stands in for real prop generation — doesn't attempt to interpret the
 * prompt (infeasible without a real model), just returns a fresh pick from
 * the existing placeholder catalog so the generate/preview/save flow can be
 * built and tested without an OpenAI API key.
 */
export class MockPropGenerator implements PropGenerator {
  private readonly delayMs: number;
  private readonly failureRate: number;

  constructor(options: MockPropGeneratorOptions = {}) {
    this.delayMs = options.delayMs ?? 1000;
    this.failureRate = options.failureRate ?? 0;
  }

  async generate(input: PropGenerationInput): Promise<GeneratedProp> {
    void input;
    await new Promise((resolve) => setTimeout(resolve, this.delayMs));

    if (this.failureRate > 0 && Math.random() < this.failureRate) {
      throw new Error('Prop generation failed. Please try again.');
    }

    const url = CATALOG[Math.floor(Math.random() * CATALOG.length)];
    return { url, width: PROP_DIMENSION, height: PROP_DIMENSION };
  }
}
