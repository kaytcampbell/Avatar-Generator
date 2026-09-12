import OpenAI, { toFile } from 'openai';
import { uploadImageBuffer } from '@/lib/cloudinary';
import type { AvatarGenerationInput, GeneratedAvatar } from '@/types/generation';
import type { AvatarGenerator } from './AvatarGenerator';

const BASE_STYLE_PROMPT =
  'A stylized avatar portrait of the person in the reference photo. ' +
  'Centered subject, head-and-shoulders composition, simple pose, clean silhouette, ' +
  'consistent framing suitable for a small social avatar, transparent background.';

const VARIATION_COUNT = 4;

export class OpenAIAvatarGenerator implements AvatarGenerator {
  private readonly client = new OpenAI();

  async generate(input: AvatarGenerationInput): Promise<GeneratedAvatar[]> {
    const prompt = input.style ? `${BASE_STYLE_PROMPT} ${input.style}` : BASE_STYLE_PROMPT;
    const photoFile = await toFile(input.photo.buffer, 'photo', { type: input.photo.mimeType });

    const response = await this.client.images.edit({
      image: photoFile,
      prompt,
      model: process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1',
      n: VARIATION_COUNT,
      size: '1024x1024',
      background: 'transparent',
    });

    const results = response.data ?? [];
    if (results.length === 0) {
      throw new Error('Avatar generation returned no images.');
    }

    return Promise.all(
      results.map(async (image, i) => {
        if (!image.b64_json) throw new Error('Avatar generation returned an unexpected response.');
        const buffer = Buffer.from(image.b64_json, 'base64');
        const uploaded = await uploadImageBuffer(buffer, { folder: 'avatar-gen/generated', mimeType: 'image/png' });
        return { id: `openai-${Date.now()}-${i}`, ...uploaded };
      }),
    );
  }
}
