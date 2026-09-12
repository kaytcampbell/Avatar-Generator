import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadImageResult {
  url: string;
  width: number;
  height: number;
}

/** Server-only — uploads with full API credentials, never exposed to the browser. */
export async function uploadImageBuffer(
  buffer: Buffer,
  options: { folder: string; mimeType: string },
): Promise<UploadImageResult> {
  const dataUri = `data:${options.mimeType};base64,${buffer.toString('base64')}`;
  const result = await cloudinary.uploader.upload(dataUri, { folder: options.folder });
  return { url: result.secure_url, width: result.width, height: result.height };
}
