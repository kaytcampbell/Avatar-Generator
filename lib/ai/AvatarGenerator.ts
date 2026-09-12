import type { AvatarGenerationInput, GeneratedAvatar } from '@/types/generation';

export interface AvatarGenerator {
  generate(input: AvatarGenerationInput): Promise<GeneratedAvatar[]>;
}
