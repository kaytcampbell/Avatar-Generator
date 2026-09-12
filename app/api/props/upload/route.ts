import { NextResponse } from 'next/server';
import { uploadImageBuffer } from '@/lib/cloudinary';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { validatePhotoFile } from '@/lib/validate-photo';

const UPLOAD_LIMIT = 20;
const UPLOAD_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ error: 'Sign in to upload a prop.' }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`prop-upload:${data.user.id}`, UPLOAD_LIMIT, UPLOAD_WINDOW_MS);
  if (!rateLimit.allowed) {
    const minutes = Math.ceil((rateLimit.resetAt - Date.now()) / 60_000);
    return NextResponse.json(
      { error: `Too many requests. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } },
    );
  }

  const formData = await request.formData();
  const photo = formData.get('photo');

  if (!(photo instanceof File)) {
    return NextResponse.json({ error: 'A photo file is required.' }, { status: 400 });
  }

  const validationError = validatePhotoFile(photo);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await photo.arrayBuffer());
    const uploaded = await uploadImageBuffer(buffer, { folder: 'avatar-gen/custom-props', mimeType: photo.type });
    return NextResponse.json(uploaded);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
