import type { ExpressionGenerationInput, GeneratedExpression } from '@/types/generation';

export interface ExpressionGenerator {
  generate(input: ExpressionGenerationInput): Promise<GeneratedExpression>;
}
