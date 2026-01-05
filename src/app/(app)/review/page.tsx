import { createClient } from '@/lib/supabase/server';
import { getWeekStartDate } from '@/lib/utils/timezone';
import { WeeklyReview } from './weekly-review';

export default async function ReviewPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Get user settings for timezone
  const { data: settings } = await supabase
    .from('user_settings')
    .select('timezone')
    .eq('user_id', user.id)
    .single();
  
  const typedSettings = settings as { timezone: string } | null;
  const timezone = typedSettings?.timezone || 'UTC';
  const weekStart = getWeekStartDate(timezone);
  
  // Get current week's review
  const { data: currentReview } = await supabase
    .from('weekly_reviews')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start_date', weekStart)
    .single();
  
  // Get inbox count
  const { count: inboxCount } = await supabase
    .from('inbox_items')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('status', 'inbox');
  
  // Get projects needing next action
  type ProjectWithTasks = { 
    id: string; 
    title: string; 
    tasks: Array<{ id: string; status: string; is_next_action: boolean }> | null;
  };
  
  const { data: allProjects } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      tasks(id, status, is_next_action)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active');
  
  const typedProjects = allProjects as ProjectWithTasks[] | null;
  const projectsNeedingNextAction = typedProjects?.filter(p => {
    const openTasks = p.tasks?.filter(t => t.status === 'open') || [];
    return openTasks.length === 0 || !openTasks.some(t => t.is_next_action);
  }) || [];
  
  // Get lead indicators with this week's data
  const { data: leadIndicators } = await supabase
    .from('lead_indicators')
    .select(`
      *,
      goal:goals(id, title)
    `)
    .eq('user_id', user.id);
  
  // Get life domains
  const { data: lifeDomains } = await supabase
    .from('life_domains')
    .select('*')
    .eq('user_id', user.id)
    .order('satisfaction_score', { ascending: true });
  
  // Get recent reviews for streak
  const { data: recentReviews } = await supabase
    .from('weekly_reviews')
    .select('week_start_date')
    .eq('user_id', user.id)
    .order('week_start_date', { ascending: false })
    .limit(12);
  
  const typedReviews = recentReviews as Array<{ week_start_date: string }> | null;
  
  // Calculate streak
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < (typedReviews?.length || 0); i++) {
    const reviewDate = new Date(typedReviews![i].week_start_date);
    const weeksDiff = Math.floor((today.getTime() - reviewDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    if (weeksDiff <= i + 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Weekly Review</h1>
          <p className="text-muted-foreground mt-1">
            Week of {new Date(weekStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </p>
        </div>
        {streak > 0 && (
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <p className="text-3xl font-bold text-primary">{streak}</p>
            <p className="text-sm text-muted-foreground">week streak</p>
          </div>
        )}
      </div>
      
      <WeeklyReview
        currentReview={currentReview}
        inboxCount={inboxCount || 0}
        projectsNeedingNextAction={projectsNeedingNextAction}
        leadIndicators={leadIndicators || []}
        lifeDomains={lifeDomains || []}
        weekStart={weekStart}
        timezone={timezone}
      />
    </div>
  );
}
