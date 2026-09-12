import OpenAI, { toFile } from 'openai';
import { uploadImageBuffer } from '@/lib/cloudinary';
import type { ExpressionGenerationInput, GeneratedExpression } from '@/types/generation';
import type { ExpressionGenerator } from './ExpressionGenerator';

const BASE_INSTRUCTION =
  'Keep this exact same character, art style, pose, clothing, and background completely unchanged. ' +
  'Only change the facial expression to: ';

export class OpenAIExpressionGenerator implements ExpressionGenerator {
  private readonly client = new OpenAI();

  async generate(input: ExpressionGenerationInput): Promise<GeneratedExpression> {
    const sourceRes = await fetch(input.avatarUrl);
    if (!sourceRes.ok) {
      throw new Error('Could not load the avatar image to edit.');
    }
    const sourceBuffer = Buffer.from(await sourceRes.arrayBuffer());
    const mimeType = sourceRes.headers.get('content-type') ?? 'image/png';
    const imageFile = await toFile(sourceBuffer, 'avatar', { type: mimeType });

    const prompt = `${BASE_INSTRUCTION}${input.expressionPrompt}.`;

    const response = await this.client.images.edit({
      image: imageFile,
      prompt,
      model: process.env.OPENAI_IMAGE_MODEL ?? 'gpt-image-1',
      n: 1,
      size: '1024x1024',
      background: 'transparent',
    });

    const image = response.data?.[0];
    if (!image?.b64_json) {
      throw new Error('Expression generation returned an unexpected response.');
    }

    const buffer = Buffer.from(image.b64_json, 'base64');
    const uploaded = await uploadImageBuffer(buffer, { folder: 'avatar-gen/expressions', mimeType: 'image/png' });
    return { url: uploaded.url };
  }
}
