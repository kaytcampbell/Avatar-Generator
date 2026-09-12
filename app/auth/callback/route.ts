import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const redirectTo = url.searchParams.get('redirectTo') ?? '/create';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(redirectTo, url.origin));
    }
  }

  // Missing code, or exchange failed (expired/already-used link, a link
  // scanner pre-fetching it before the real click, etc.) — send the user
  // back to sign in with a visible error instead of silently redirecting
  // them to redirectTo as if they were signed in.
  const loginUrl = new URL('/login', url.origin);
  loginUrl.searchParams.set('redirectTo', redirectTo);
  loginUrl.searchParams.set('error', 'auth-failed');
  return NextResponse.redirect(loginUrl);
}
