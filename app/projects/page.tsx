import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProjectsDashboard } from '@/components/projects/ProjectsDashboard';

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect('/login?redirectTo=/projects');
  }

  return <ProjectsDashboard userId={data.user.id} />;
}
