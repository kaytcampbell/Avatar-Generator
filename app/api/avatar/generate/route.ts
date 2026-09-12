import { NextResponse } from 'next/server';
import { getAvatarGenerator } from '@/lib/ai';
import { uploadImageBuffer } from '@/lib/cloudinary';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

const GENERATE_LIMIT = 10;
const GENERATE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ error: 'Sign in to generate an avatar.' }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`generate:${data.user.id}`, GENERATE_LIMIT, GENERATE_WINDOW_MS);
  if (!rateLimit.allowed) {
    const minutes = Math.ceil((rateLimit.resetAt - Date.now()) / 60_000);
    return NextResponse.json(
      { error: `Too many requests. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } },
    );
  }

  const formData = await request.formData();
  const photo = formData.get('photo');
  const style = formData.get('style');

  if (!(photo instanceof File)) {
    return NextResponse.json({ error: 'A photo file is required.' }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await photo.arrayBuffer());

    // Durable storage of the uploaded source photo, per spec — not otherwise
    // referenced by AvatarProject, which has no field for it.
    await uploadImageBuffer(buffer, { folder: 'avatar-gen/sources', mimeType: photo.type });

    const avatars = await getAvatarGenerator().generate({
      photo: { buffer, mimeType: photo.type },
      style: typeof style === 'string' ? style : undefined,
    });

    return NextResponse.json(avatars);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Avatar generation failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
