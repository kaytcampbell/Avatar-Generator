import { ACCEPTED_PHOTO_TYPES, MAX_PHOTO_SIZE_BYTES } from '@/lib/constants';

export function validatePhotoFile(file: File): string | null {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type as (typeof ACCEPTED_PHOTO_TYPES)[number])) {
    return 'Please upload a JPG, PNG, or WebP image.';
  }
  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return 'Image must be smaller than 8MB.';
  }
  return null;
}
