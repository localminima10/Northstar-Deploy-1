'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface SettingsInput {
  timezone?: string;
  daily_checkin_time?: string;
  weekly_review_day?: number;
  weekly_review_time?: string;
  monthly_reset_day?: number;
  max_daily_outcomes?: number;
  max_daily_tasks?: number;
  vision_rotation_mode?: 'random' | 'by_active_goal' | 'pinned_only';
  default_landing?: 'today' | 'vision' | 'inbox';
  notifications?: string[];
  common_derailers?: string[];
  mantra?: string;
  visualization_script?: string;
}

export async function updateSettings(input: SettingsInput) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data: settings, error } = await supabase
    .from('user_settings')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/', 'layout');
  return { data: settings };
}

export async function getSettings() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  return { data };
}

export async function getBaseline() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data, error } = await supabase
    .from('user_baseline')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    return { error: error.message };
  }
  
  return { data };
}

export async function updateBaseline(overwhelm_level: number, motivation_level: number) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data, error } = await supabase
    .from('user_baseline')
    .upsert({
      user_id: user.id,
      overwhelm_level,
      motivation_level,
      captured_at: new Date().toISOString(),
    })
    .select()
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/settings');
  return { data };
}

export async function getLifeDomains() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data, error } = await supabase
    .from('life_domains')
    .select('*')
    .eq('user_id', user.id)
    .order('satisfaction_score', { ascending: true });
  
  if (error) {
    return { error: error.message };
  }
  
  return { data };
}

export async function updateLifeDomain(
  domainId: string, 
  input: { satisfaction_score?: number; plus_two_definition?: string }
) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data, error } = await supabase
    .from('life_domains')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', domainId)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/settings');
  revalidatePath('/review');
  return { data };
}

export async function getValues() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data, error } = await supabase
    .from('user_values')
    .select('*')
    .eq('user_id', user.id)
    .order('rank_order', { ascending: true, nullsFirst: false });
  
  if (error) {
    return { error: error.message };
  }
  
  return { data };
}

export async function getIfThenPlans() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data, error } = await supabase
    .from('if_then_plans')
    .select(`
      *,
      goal:goals(id, title)
    `)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    return { error: error.message };
  }
  
  return { data };
}

