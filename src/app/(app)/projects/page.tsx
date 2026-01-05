import { createClient } from '@/lib/supabase/server';
import { ProjectsList } from './projects-list';

export default async function ProjectsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Get all projects with tasks
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      goal:goals(id, title),
      tasks(id, title, notes, status, is_next_action, due_date, created_at)
    `)
    .eq('user_id', user.id)
    .order('status', { ascending: true })
    .order('created_at', { ascending: false });
  
  // Get active goals for project creation
  const { data: goals } = await supabase
    .from('goals')
    .select('id, title')
    .eq('user_id', user.id)
    .eq('status', 'active');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Finite outcomes with clear next actions
          </p>
        </div>
      </div>
      
      <ProjectsList 
        projects={projects || []}
        goals={goals || []}
      />
    </div>
  );
}
