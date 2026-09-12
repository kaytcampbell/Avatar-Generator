import { NextResponse } from 'next/server';
import { getExpressionGenerator } from '@/lib/ai';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';
import { getExpressionById } from '@/lib/expressions';

const EXPRESSION_LIMIT = 10;
const EXPRESSION_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ error: 'Sign in to change the expression.' }, { status: 401 });
  }

  const rateLimit = checkRateLimit(`expression:${data.user.id}`, EXPRESSION_LIMIT, EXPRESSION_WINDOW_MS);
  if (!rateLimit.allowed) {
    const minutes = Math.ceil((rateLimit.resetAt - Date.now()) / 60_000);
    return NextResponse.json(
      { error: `Too many requests. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.` },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } },
    );
  }

  const body = await request.json().catch(() => ({}));
  const avatarUrl = typeof body.avatarUrl === 'string' ? body.avatarUrl : '';
  const expressionId = typeof body.expressionId === 'string' ? body.expressionId : '';
  // Looked up server-side rather than trusting a client-supplied prompt, so
  // requests can only ever select from the curated catalog.
  const expression = getExpressionById(expressionId);

  if (!avatarUrl || !expression) {
    return NextResponse.json({ error: 'A valid avatar and expression are required.' }, { status: 400 });
  }

  try {
    const generated = await getExpressionGenerator().generate({ avatarUrl, expressionPrompt: expression.prompt });
    return NextResponse.json(generated);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Expression generation failed.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
