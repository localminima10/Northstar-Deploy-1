import { createClient } from '@/lib/supabase/server';
import { GoalsList } from './goals-list';

export default async function GoalsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Get all goals with related data
  const { data: goals } = await supabase
    .from('goals')
    .select(`
      *,
      projects(id, title, status),
      lead_indicators(id, name),
      habits(id, name)
    `)
    .eq('user_id', user.id)
    .order('status', { ascending: true })
    .order('created_at', { ascending: false });
  
  // Get user values for goal linking
  const { data: values } = await supabase
    .from('user_values')
    .select('*')
    .eq('user_id', user.id)
    .order('rank_order', { ascending: true, nullsFirst: false });
  
  // Get goal-value links
  const { data: goalValueLinks } = await supabase
    .from('goal_value_links')
    .select('*');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Goals</h1>
          <p className="text-muted-foreground mt-1">
            Focus on 3-5 active goals that drive meaningful progress
          </p>
        </div>
      </div>
      
      <GoalsList 
        goals={goals || []} 
        values={values || []}
        goalValueLinks={goalValueLinks || []}
      />
    </div>
  );
}
