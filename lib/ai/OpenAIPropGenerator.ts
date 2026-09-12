import OpenAI from 'openai';
import { uploadImageBuffer } from '@/lib/cloudinary';
import type { PropGenerationInput, GeneratedProp, PropGenerator } from './PropGenerator';

const STYLE_PREFIX =
  'A single flat vector-style sticker icon of: ';
const STYLE_SUFFIX =
  '. Centered, simple clean silhouette, transparent background, suitable as a small wearable accessory for a cartoon avatar.';

export class OpenAIPropGenerator implements PropGenerator {
  private readonly client = new OpenAI();

  async generate(input: PropGenerationInput): Promise<GeneratedProp> {
    const prompt = `${STYLE_PREFIX}${input.prompt}${STYLE_SUFFIX}`;

    const response = await this.client.images.generate({
      prompt,
      model: process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1',
      n: 1,
      size: '1024x1024',
      background: 'transparent',
    });

    const image = response.data?.[0];
    if (!image?.b64_json) {
      throw new Error('Prop generation returned an unexpected response.');
    }

    const buffer = Buffer.from(image.b64_json, 'base64');
    const uploaded = await uploadImageBuffer(buffer, { folder: 'avatar-gen/custom-props', mimeType: 'image/png' });
    return uploaded;
  }
}
