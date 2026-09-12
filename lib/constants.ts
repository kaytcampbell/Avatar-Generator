/** Stand-in until real Supabase Auth wires up an actual user id. */
export const STUB_USER_ID = 'local-user';

export const DEFAULT_CANVAS_SETTINGS = {
  width: 512,
  height: 512,
  backgroundColor: 'transparent',
} as const;

export const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_PHOTO_SIZE_BYTES = 8 * 1024 * 1024;
