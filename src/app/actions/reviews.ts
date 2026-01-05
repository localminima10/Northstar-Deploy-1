'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getWeekStartDate } from '@/lib/utils/timezone';

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
      inbox_processed: input.inbox_processed || false,
      projects_checked: input.projects_checked || false,
      lead_indicators_reviewed: input.lead_indicators_reviewed || false,
      vision_refreshed: input.vision_refreshed || false,
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

export async function getReviewStreak() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data: reviews, error } = await supabase
    .from('weekly_reviews')
    .select('week_start_date')
    .eq('user_id', user.id)
    .order('week_start_date', { ascending: false })
    .limit(52);
  
  if (error) {
    return { error: error.message };
  }
  
  // Calculate streak
  let streak = 0;
  const today = new Date();
  
  for (let i = 0; i < (reviews?.length || 0); i++) {
    const reviewDate = new Date(reviews![i].week_start_date);
    const weeksDiff = Math.floor((today.getTime() - reviewDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    
    if (weeksDiff === i || weeksDiff === i + 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return { streak, totalReviews: reviews?.length || 0 };
}

