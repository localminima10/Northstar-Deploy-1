import { createClient } from '@/lib/supabase/server';
import { InboxView } from '@/components/dashboard/inbox-view';

export default async function InboxPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Get inbox items
  const { data: inboxItems } = await supabase
    .from('inbox_items')
    .select(`
      *,
      goal:goals(id, title),
      project:projects(id, title)
    `)
    .eq('user_id', user.id)
    .eq('status', 'inbox')
    .order('created_at', { ascending: false });
  
  // Get goals for processing
  const { data: goals } = await supabase
    .from('goals')
    .select('id, title')
    .eq('user_id', user.id)
    .eq('status', 'active');
  
  // Get projects for processing
  const { data: projects } = await supabase
    .from('projects')
    .select('id, title')
    .eq('user_id', user.id)
    .eq('status', 'active');
  
  return (
    <InboxView
      inboxItems={inboxItems || []}
      goals={goals || []}
      projects={projects || []}
    />
  );
}
