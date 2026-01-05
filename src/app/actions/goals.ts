'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface GoalInput {
  title: string;
  why?: string;
  success_definition?: string;
  metric_name?: string;
  metric_baseline?: number;
  metric_target?: number;
  metric_current?: number;
  confidence_score?: number;
  motivation_score?: number;
  approach_phrase?: string;
  status?: 'active' | 'paused' | 'archived';
  value_ids?: string[];
}

export async function createGoal(input: GoalInput) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  // Check max active goals (5)
  const { count } = await supabase
    .from('goals')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('status', 'active');
  
  if ((count ?? 0) >= 5 && input.status !== 'paused' && input.status !== 'archived') {
    return { error: 'Maximum 5 active goals allowed. Pause or archive a goal first.' };
  }
  
  const { data: goal, error } = await supabase
    .from('goals')
    .insert({
      user_id: user.id,
      title: input.title,
      why: input.why || null,
      success_definition: input.success_definition || null,
      metric_name: input.metric_name || null,
      metric_baseline: input.metric_baseline || null,
      metric_target: input.metric_target || null,
      metric_current: input.metric_current || null,
      confidence_score: input.confidence_score || null,
      motivation_score: input.motivation_score || null,
      approach_phrase: input.approach_phrase || null,
      status: input.status || 'active',
    })
    .select()
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  // Link values to goal
  if (input.value_ids && input.value_ids.length > 0) {
    for (const valueId of input.value_ids) {
      await supabase.from('goal_value_links').insert({
        goal_id: goal.id,
        value_id: valueId,
      });
    }
  }
  
  revalidatePath('/goals');
  revalidatePath('/today');
  return { data: goal };
}

export async function updateGoal(goalId: string, input: Partial<GoalInput>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  // Check max active goals if changing status to active
  if (input.status === 'active') {
    const { data: currentGoal } = await supabase
      .from('goals')
      .select('status')
      .eq('id', goalId)
      .single();
    
    if (currentGoal?.status !== 'active') {
      const { count } = await supabase
        .from('goals')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('status', 'active');
      
      if ((count ?? 0) >= 5) {
        return { error: 'Maximum 5 active goals allowed.' };
      }
    }
  }
  
  const { value_ids, ...goalData } = input;
  
  const { data: goal, error } = await supabase
    .from('goals')
    .update({
      ...goalData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', goalId)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  // Update value links if provided
  if (value_ids !== undefined) {
    // Remove existing links
    await supabase
      .from('goal_value_links')
      .delete()
      .eq('goal_id', goalId);
    
    // Add new links
    for (const valueId of value_ids) {
      await supabase.from('goal_value_links').insert({
        goal_id: goalId,
        value_id: valueId,
      });
    }
  }
  
  revalidatePath('/goals');
  revalidatePath('/today');
  return { data: goal };
}

export async function deleteGoal(goalId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', user.id);
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/goals');
  revalidatePath('/today');
  return { success: true };
}

export async function getGoals() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data, error } = await supabase
    .from('goals')
    .select(`
      *,
      goal_value_links(value_id),
      projects(id, title, status),
      lead_indicators(id, name),
      habits(id, name)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    return { error: error.message };
  }
  
  return { data };
}

export async function getActiveGoals() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  
  if (error) {
    return { error: error.message };
  }
  
  return { data };
}

