import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { AnimatedLogo } from './AnimatedLogo';

export async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  return (
    <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b bg-background px-6 py-3">
      <div className="flex items-center gap-4">
        <AnimatedLogo />
        <span className="h-5 w-px bg-border" aria-hidden="true" />
        <Link href="/create" className="text-sm font-semibold whitespace-nowrap text-blue-600 hover:text-blue-700">
          Create
        </Link>
        {user && (
          <Link href="/projects" className="text-sm font-semibold whitespace-nowrap text-blue-600 hover:text-blue-700">
            My Avatars
          </Link>
        )}
      </div>
      {user ? (
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-muted-foreground sm:inline">{user.email}</span>
          <form action="/auth/signout" method="post">
            <Button type="submit" className="rounded-full bg-slate-900 px-5 font-semibold text-white hover:bg-slate-800">
              Sign Out
            </Button>
          </form>
        </div>
      ) : (
        <Button asChild className="rounded-full bg-slate-900 px-5 font-semibold text-white hover:bg-slate-800">
          <Link href="/login">Sign in</Link>
        </Button>
      )}
    </header>
  );
}
