import { createClient } from '@/lib/supabase/server';
import { getTodayRange, getWeekStartDate } from '@/lib/utils/timezone';
import { TodayDashboard } from './today-dashboard';
import type { UserSettings, YearCompass, DailyCheckin, Habit, HabitLog, Task, VisionTile, IdentityStatement, Goal, IfThenPlan } from '@/lib/types/database';

export default async function TodayPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Get user settings
  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  const typedSettings = settings as UserSettings | null;
  const timezone = typedSettings?.timezone || 'UTC';
  const { todayStr } = getTodayRange(timezone);
  const weekStart = getWeekStartDate(timezone);
  
  // Get year compass for theme and mission
  const currentYear = new Date().getFullYear();
  const { data: yearCompass } = await supabase
    .from('year_compass')
    .select('*')
    .eq('user_id', user.id)
    .eq('year', currentYear)
    .single();
  
  // Get today's checkin
  const { data: todayCheckin } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', user.id)
    .eq('checkin_date', todayStr)
    .single();
  
  // Get active habits with today's logs
  const { data: habits } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active');
  
  const typedHabits = habits as Habit[] | null;
  
  const { data: todayHabitLogs } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('log_date', todayStr);
  
  const typedLogs = todayHabitLogs as HabitLog[] | null;
  
  // Merge habits with logs
  const habitsWithLogs = typedHabits?.map(habit => ({
    ...habit,
    todayLog: typedLogs?.find(log => log.habit_id === habit.id) || null,
  })) || [];
  
  // Get next actions (tasks marked as next action)
  type TaskWithProject = Task & { project: { id: string; title: string; goal_id: string | null } | null };
  const { data: nextActions } = await supabase
    .from('tasks')
    .select(`
      *,
      project:projects(id, title, goal_id)
    `)
    .eq('user_id', user.id)
    .eq('is_next_action', true)
    .eq('status', 'open')
    .order('created_at');
  
  const typedNextActions = nextActions as TaskWithProject[] | null;
  
  // Get vision tiles for manifestation
  const { data: visionTiles } = await supabase
    .from('vision_tiles')
    .select('*')
    .eq('user_id', user.id)
    .order('pinned', { ascending: false })
    .limit(10);
  
  const typedVisionTiles = visionTiles as VisionTile[] | null;
  
  // Get identity statements
  const { data: identityStatements } = await supabase
    .from('identity_statements')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order');
  
  const typedIdentityStatements = identityStatements as IdentityStatement[] | null;
  
  // Get active goals count
  const { data: activeGoals } = await supabase
    .from('goals')
    .select('id, title')
    .eq('user_id', user.id)
    .eq('status', 'active');
  
  const typedActiveGoals = activeGoals as { id: string; title: string }[] | null;
  
  // Get if-then plans
  const { data: ifThenPlans } = await supabase
    .from('if_then_plans')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true);
  
  const typedIfThenPlans = ifThenPlans as IfThenPlan[] | null;
  
  // Get inbox count
  const { count: inboxCount } = await supabase
    .from('inbox_items')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('status', 'inbox');
  
  return (
    <TodayDashboard
      settings={typedSettings}
      yearCompass={yearCompass as YearCompass | null}
      todayCheckin={todayCheckin as DailyCheckin | null}
      habits={habitsWithLogs}
      nextActions={typedNextActions || []}
      visionTiles={typedVisionTiles || []}
      identityStatements={typedIdentityStatements || []}
      activeGoals={typedActiveGoals || []}
      ifThenPlans={typedIfThenPlans || []}
      inboxCount={inboxCount || 0}
      todayStr={todayStr}
      timezone={timezone}
    />
  );
}
