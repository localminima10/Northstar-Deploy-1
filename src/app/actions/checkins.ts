'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getTodayRange, getWeekStartDate } from '@/lib/utils/timezone';

export interface DailyCheckinInput {
  focus_outcomes?: string[];
  main_obstacle?: string;
  win?: string;
  lesson?: string;
  next_action_commitment?: string;
}

export async function saveDailyCheckin(input: DailyCheckinInput) {
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
  
  // Upsert daily checkin
  const { data: checkin, error } = await supabase
    .from('daily_checkins')
    .upsert({
      user_id: user.id,
      checkin_date: todayStr,
      timezone,
      focus_outcomes: input.focus_outcomes || null,
      main_obstacle: input.main_obstacle || null,
      win: input.win || null,
      lesson: input.lesson || null,
      next_action_commitment: input.next_action_commitment || null,
      recorded_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,checkin_date',
    })
    .select()
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/today');
  return { data: checkin };
}

export async function getTodayCheckin() {
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
  
  const { data: checkin, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', user.id)
    .eq('checkin_date', todayStr)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    return { error: error.message };
  }
  
  return { data: checkin, todayStr };
}

export async function getRecentCheckins(limit: number = 7) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data, error } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', user.id)
    .order('checkin_date', { ascending: false })
    .limit(limit);
  
  if (error) {
    return { error: error.message };
  }
  
  return { data };
}

export interface WeeklyReviewInput {
  notes?: string;
  inbox_processed?: boolean;
  projects_checked?: boolean;
  lead_indicators_reviewed?: boolean;
  vision_refreshed?: boolean;
}

export async function saveWeeklyReview(input: WeeklyReviewInput) {
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
  const weekStart = getWeekStartDate(timezone);
  
  // Upsert weekly review
  const { data: review, error } = await supabase
    .from('weekly_reviews')
    .upsert({
      user_id: user.id,
      week_start_date: weekStart,
      timezone,
      notes: input.notes || null,
      inbox_processed: input.inbox_processed ?? false,
      projects_checked: input.projects_checked ?? false,
      lead_indicators_reviewed: input.lead_indicators_reviewed ?? false,
      vision_refreshed: input.vision_refreshed ?? false,
      submitted_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,week_start_date',
    })
    .select()
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/review');
  return { data: review };
}

export async function getCurrentWeekReview() {
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
  const weekStart = getWeekStartDate(timezone);
  
  const { data: review, error } = await supabase
    .from('weekly_reviews')
    .select('*')
    .eq('user_id', user.id)
    .eq('week_start_date', weekStart)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    return { error: error.message };
  }
  
  return { data: review, weekStart };
}
