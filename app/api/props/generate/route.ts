import { NextResponse } from 'next/server';
import { getPropGenerator } from '@/lib/ai';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

const PROP_GENERATE_LIMIT = 10;
const PROP_GENERATE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ error: 'Sign in to generate a prop.' }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`prop-generate:${data.user.id}`, PROP_GENERATE_LIMIT, PROP_GENERATE_WINDOW_MS);
  if (!rateLimit.allowed) {
    const minutes = Math.ceil((rateLimit.resetAt - Date.now()) / 60_000);
    return NextResponse.json(
      { error: `Too many requests. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } },
    );
  }

  const body = await request.json().catch(() => ({}));
  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    return NextResponse.json({ error: 'A description is required.' }, { status: 400 });
  }

  try {
    const generated = await getPropGenerator().generate({ prompt });
    return NextResponse.json(generated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Prop generation failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
