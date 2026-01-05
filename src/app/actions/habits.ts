'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getTodayRange } from '@/lib/utils/timezone';

export interface HabitInput {
  goal_id?: string;
  name: string;
  cue?: string;
  location?: string;
  tracking_type: 'binary' | 'count' | 'time';
  weekly_target?: number;
  minimum_version?: string;
  status?: 'active' | 'paused' | 'archived';
}

export async function createHabit(input: HabitInput) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data: habit, error } = await supabase
    .from('habits')
    .insert({
      user_id: user.id,
      goal_id: input.goal_id || null,
      name: input.name,
      cue: input.cue || null,
      location: input.location || null,
      tracking_type: input.tracking_type,
      weekly_target: input.weekly_target || 0,
      minimum_version: input.minimum_version || null,
      status: input.status || 'active',
    })
    .select()
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/habits');
  revalidatePath('/today');
  return { data: habit };
}

export async function updateHabit(habitId: string, input: Partial<HabitInput>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data: habit, error } = await supabase
    .from('habits')
    .update(input)
    .eq('id', habitId)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/habits');
  revalidatePath('/today');
  return { data: habit };
}

export async function deleteHabit(habitId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId)
    .eq('user_id', user.id);
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/habits');
  revalidatePath('/today');
  return { success: true };
}

export async function logHabit(habitId: string, value: number, date?: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  // Get user's timezone
  const { data: settings } = await supabase
    .from('user_settings')
    .select('timezone')
    .eq('user_id', user.id)
    .single();
  
  const timezone = settings?.timezone || 'UTC';
  const { todayStr } = getTodayRange(timezone);
  const logDate = date || todayStr;
  
  // Upsert the log
  const { data: log, error } = await supabase
    .from('habit_logs')
    .upsert({
      user_id: user.id,
      habit_id: habitId,
      log_date: logDate,
      value,
    }, {
      onConflict: 'habit_id,log_date',
    })
    .select()
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/habits');
  revalidatePath('/today');
  return { data: log };
}

export async function getHabits() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data, error } = await supabase
    .from('habits')
    .select(`
      *,
      goal:goals(id, title)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    return { error: error.message };
  }
  
  return { data };
}

export async function getHabitsWithLogs(startDate: string, endDate: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data, error } = await supabase
    .from('habits')
    .select(`
      *,
      goal:goals(id, title),
      habit_logs(id, log_date, value)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .gte('habit_logs.log_date', startDate)
    .lte('habit_logs.log_date', endDate)
    .order('created_at', { ascending: true });
  
  if (error) {
    return { error: error.message };
  }
  
  return { data };
}

export async function getTodayHabits() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  // Get user's timezone
  const { data: settings } = await supabase
    .from('user_settings')
    .select('timezone')
    .eq('user_id', user.id)
    .single();
  
  const timezone = settings?.timezone || 'UTC';
  const { todayStr } = getTodayRange(timezone);
  
  const { data, error } = await supabase
    .from('habits')
    .select(`
      *,
      goal:goals(id, title),
      habit_logs!inner(id, log_date, value)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .eq('habit_logs.log_date', todayStr);
  
  // Also get habits without logs for today
  const { data: allHabits } = await supabase
    .from('habits')
    .select(`
      *,
      goal:goals(id, title)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active');
  
  // Get today's logs separately
  const { data: todayLogs } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('log_date', todayStr);
  
  // Merge habits with their logs
  const habitsWithLogs = allHabits?.map(habit => {
    const log = todayLogs?.find(l => l.habit_id === habit.id);
    return {
      ...habit,
      todayLog: log || null,
    };
  });
  
  if (error && error.code !== 'PGRST116') {
    return { error: error.message };
  }
  
  return { data: habitsWithLogs, todayStr };
}

