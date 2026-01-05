import { createClient } from '@/lib/supabase/server';
import { HabitsView } from '@/components/dashboard/habits-view';

export default async function HabitsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Get all habits with goal
  const { data: habits } = await supabase
    .from('habits')
    .select(`
      *,
      goal:goals(id, title)
    `)
    .eq('user_id', user.id)
    .order('status', { ascending: true })
    .order('created_at', { ascending: false });
  
  // Get goals for linking
  const { data: goals } = await supabase
    .from('goals')
    .select('id, title')
    .eq('user_id', user.id)
    .eq('status', 'active');
  
  return (
    <HabitsView
      habits={habits || []}
      goals={goals || []}
    />
  );
}
