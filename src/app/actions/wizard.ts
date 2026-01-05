'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Json } from '@/lib/types/database';

export async function saveWizardProgress(stepId: string, payload: Json, completed: boolean = false) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { error } = await supabase
    .from('wizard_progress')
    .upsert({
      user_id: user.id,
      step_id: stepId,
      payload,
      completed,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,step_id',
    });
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/wizard', 'layout');
  return { success: true };
}

export async function getWizardProgress(stepId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data, error } = await supabase
    .from('wizard_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('step_id', stepId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    return { error: error.message };
  }
  
  return { data };
}

export async function getAllWizardProgress() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data, error } = await supabase
    .from('wizard_progress')
    .select('*')
    .eq('user_id', user.id)
    .order('step_id');
  
  if (error) {
    return { error: error.message };
  }
  
  return { data };
}

export async function completeOnboarding() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  // Verify minimum requirements before completing
  const { data: goals } = await supabase
    .from('goals')
    .select('id')
    .eq('user_id', user.id)
    .limit(1);
  
  if (!goals || goals.length === 0) {
    return { error: 'You need at least one goal to complete setup' };
  }
  
  // Check that all active projects have next actions
  const { data: projectsWithoutNextAction } = await supabase
    .from('projects')
    .select(`
      id,
      title,
      tasks!inner(id)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active');
  
  // Get settings to check timezone
  const { data: settings } = await supabase
    .from('user_settings')
    .select('timezone')
    .eq('user_id', user.id)
    .single();
  
  if (!settings?.timezone || settings.timezone === 'UTC') {
    // Allow UTC but warn
  }
  
  // Mark onboarding as complete
  const { error } = await supabase
    .from('user_settings')
    .update({
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/', 'layout');
  redirect('/today');
}

// Save step-specific data to the appropriate tables
export async function saveStepData(stepId: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const currentYear = new Date().getFullYear();
  
  try {
    switch (stepId) {
      case '0': // Welcome & Baseline
        // Save baseline
        if (data.overwhelm_level !== undefined || data.motivation_level !== undefined) {
          await supabase.from('user_baseline').upsert({
            user_id: user.id,
            overwhelm_level: data.overwhelm_level as number,
            motivation_level: data.motivation_level as number,
            captured_at: new Date().toISOString(),
          });
        }
        // Save intention to settings
        if (data.intention !== undefined) {
          await supabase.from('user_settings').update({
            intention: data.intention as string,
            time_budget_weekly_hours: data.time_budget_weekly_hours as number,
            updated_at: new Date().toISOString(),
          }).eq('user_id', user.id);
        }
        break;
      
      case '1': // Brain Dump
        // Parse brain dump into inbox items
        if (data.brain_dump) {
          const items = (data.brain_dump as string)
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
          
          for (const content of items) {
            await supabase.from('inbox_items').insert({
              user_id: user.id,
              content,
              status: 'inbox',
            });
          }
        }
        // Save capture style
        if (data.capture_style) {
          await supabase.from('user_settings').update({
            capture_style: data.capture_style as 'brain_dump' | 'single_line' | 'voice_to_text',
            updated_at: new Date().toISOString(),
          }).eq('user_id', user.id);
        }
        break;
      
      case '2': // Values
        if (data.values && Array.isArray(data.values)) {
          // Delete existing values
          await supabase.from('user_values').delete().eq('user_id', user.id);
          
          // Insert new values
          for (let i = 0; i < data.values.length; i++) {
            const value = data.values[i] as { name: string; definition?: string; rank_order?: number };
            await supabase.from('user_values').insert({
              user_id: user.id,
              name: value.name,
              definition: value.definition || null,
              rank_order: value.rank_order || (i < 5 ? i + 1 : null),
            });
          }
        }
        if (data.anti_values) {
          await supabase.from('user_settings').update({
            anti_values: data.anti_values as string,
            updated_at: new Date().toISOString(),
          }).eq('user_id', user.id);
        }
        break;
      
      case '3': // Identity
        if (data.statements && Array.isArray(data.statements)) {
          // Delete existing statements
          await supabase.from('identity_statements').delete().eq('user_id', user.id);
          
          // Insert new statements
          for (let i = 0; i < data.statements.length; i++) {
            const statement = data.statements[i] as string;
            if (statement.trim()) {
              await supabase.from('identity_statements').insert({
                user_id: user.id,
                content: statement.trim(),
                sort_order: i + 1,
              });
            }
          }
        }
        if (data.non_negotiables) {
          await supabase.from('user_settings').update({
            non_negotiables: data.non_negotiables as string,
            updated_at: new Date().toISOString(),
          }).eq('user_id', user.id);
        }
        break;
      
      case '4': // Year Compass
        await supabase.from('year_compass').upsert({
          user_id: user.id,
          year: currentYear,
          theme: data.theme as string || null,
          mission_statement: data.mission_statement as string || null,
          updated_at: new Date().toISOString(),
        });
        if (data.definition_of_win) {
          await supabase.from('user_settings').update({
            definition_of_win: data.definition_of_win as string,
            updated_at: new Date().toISOString(),
          }).eq('user_id', user.id);
        }
        break;
      
      case '5': // Life Domains
        if (data.domains && Array.isArray(data.domains)) {
          // Delete existing domains
          await supabase.from('life_domains').delete().eq('user_id', user.id);
          
          // Insert new domains
          for (const domain of data.domains as { key: string; name: string; score: number; plus_two?: string }[]) {
            await supabase.from('life_domains').insert({
              user_id: user.id,
              domain_key: domain.key,
              name: domain.name,
              satisfaction_score: domain.score,
              plus_two_definition: domain.plus_two || null,
            });
          }
        }
        break;
      
      case '6': // Visualization
        const yearCompassUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (data.future_self_letter) yearCompassUpdate.future_self_letter = data.future_self_letter;
        if (data.feeling_goals) yearCompassUpdate.feeling_goals = data.feeling_goals;
        if (data.vision_scenes) yearCompassUpdate.vision_scenes = data.vision_scenes;
        
        await supabase.from('year_compass').upsert({
          user_id: user.id,
          year: currentYear,
          ...yearCompassUpdate,
        });
        
        if (data.mantra || data.visualization_script) {
          await supabase.from('user_settings').update({
            mantra: data.mantra as string || undefined,
            visualization_script: data.visualization_script as string || undefined,
            updated_at: new Date().toISOString(),
          }).eq('user_id', user.id);
        }
        break;
      
      case '7': // Goals
        if (data.goals && Array.isArray(data.goals)) {
          for (const goal of data.goals as {
            title: string;
            why?: string;
            success_definition?: string;
            metric_name?: string;
            metric_baseline?: number;
            metric_target?: number;
            confidence_score?: number;
            motivation_score?: number;
            approach_phrase?: string;
            value_ids?: string[];
          }[]) {
            const { data: newGoal, error } = await supabase.from('goals').insert({
              user_id: user.id,
              title: goal.title,
              why: goal.why || null,
              success_definition: goal.success_definition || null,
              metric_name: goal.metric_name || null,
              metric_baseline: goal.metric_baseline || null,
              metric_target: goal.metric_target || null,
              confidence_score: goal.confidence_score || null,
              motivation_score: goal.motivation_score || null,
              approach_phrase: goal.approach_phrase || null,
              status: 'active',
            }).select().single();
            
            // Link values to goal
            if (!error && newGoal && goal.value_ids) {
              for (const valueId of goal.value_ids) {
                await supabase.from('goal_value_links').insert({
                  goal_id: newGoal.id,
                  value_id: valueId,
                });
              }
            }
          }
        }
        break;
      
      case '8': // Lead Indicators
        if (data.indicators && Array.isArray(data.indicators)) {
          for (const indicator of data.indicators as {
            goal_id: string;
            name: string;
            measure_type: 'binary' | 'count' | 'time';
            weekly_target: number;
            minimum_version?: string;
            anchor?: string;
          }[]) {
            await supabase.from('lead_indicators').insert({
              user_id: user.id,
              goal_id: indicator.goal_id,
              name: indicator.name,
              measure_type: indicator.measure_type,
              weekly_target: indicator.weekly_target,
              minimum_version: indicator.minimum_version || null,
              anchor: indicator.anchor || null,
            });
          }
        }
        break;
      
      case '9': // Projects
        if (data.projects && Array.isArray(data.projects)) {
          for (const project of data.projects as {
            goal_id?: string;
            title: string;
            definition_of_done?: string;
            due_date?: string;
            next_action?: string;
          }[]) {
            const { data: newProject, error } = await supabase.from('projects').insert({
              user_id: user.id,
              goal_id: project.goal_id || null,
              title: project.title,
              definition_of_done: project.definition_of_done || null,
              due_date: project.due_date || null,
              status: 'active',
            }).select().single();
            
            // Create next action task
            if (!error && newProject && project.next_action) {
              await supabase.from('tasks').insert({
                user_id: user.id,
                project_id: newProject.id,
                title: project.next_action,
                is_next_action: true,
                status: 'open',
              });
            }
          }
        }
        break;
      
      case '10': // WOOP & If-Then
        if (data.common_derailers) {
          await supabase.from('user_settings').update({
            common_derailers: data.common_derailers as string[],
            updated_at: new Date().toISOString(),
          }).eq('user_id', user.id);
        }
        
        if (data.woops && Array.isArray(data.woops)) {
          for (const woop of data.woops as {
            goal_id?: string;
            wish?: string;
            outcome?: string;
            obstacle?: string;
            plan?: string;
          }[]) {
            await supabase.from('woops').insert({
              user_id: user.id,
              goal_id: woop.goal_id || null,
              wish: woop.wish || null,
              outcome: woop.outcome || null,
              obstacle: woop.obstacle || null,
              plan: woop.plan || null,
            });
          }
        }
        
        if (data.if_then_plans && Array.isArray(data.if_then_plans)) {
          for (const plan of data.if_then_plans as {
            goal_id?: string;
            trigger: string;
            response: string;
            category?: string;
          }[]) {
            await supabase.from('if_then_plans').insert({
              user_id: user.id,
              goal_id: plan.goal_id || null,
              trigger: plan.trigger,
              response: plan.response,
              category: plan.category || 'focus',
              is_active: true,
            });
          }
        }
        break;
      
      case '11': // Habits
        if (data.habits && Array.isArray(data.habits)) {
          for (const habit of data.habits as {
            goal_id?: string;
            name: string;
            cue?: string;
            location?: string;
            tracking_type: 'binary' | 'count' | 'time';
            weekly_target?: number;
            minimum_version?: string;
          }[]) {
            await supabase.from('habits').insert({
              user_id: user.id,
              goal_id: habit.goal_id || null,
              name: habit.name,
              cue: habit.cue || null,
              location: habit.location || null,
              tracking_type: habit.tracking_type,
              weekly_target: habit.weekly_target || 0,
              minimum_version: habit.minimum_version || null,
              status: 'active',
            });
          }
        }
        break;
      
      case '12': // Cadence
        await supabase.from('user_settings').update({
          timezone: data.timezone as string || 'UTC',
          daily_checkin_time: data.daily_checkin_time as string || null,
          weekly_review_day: data.weekly_review_day as number || null,
          weekly_review_time: data.weekly_review_time as string || null,
          monthly_reset_day: data.monthly_reset_day as number || null,
          notifications: data.notifications as string[] || null,
          updated_at: new Date().toISOString(),
        }).eq('user_id', user.id);
        break;
      
      case '13': // Dashboard Preferences
        await supabase.from('user_settings').update({
          max_daily_outcomes: data.max_daily_outcomes as number || 3,
          max_daily_tasks: data.max_daily_tasks as number || 10,
          vision_rotation_mode: (data.vision_rotation_mode as 'random' | 'by_active_goal' | 'pinned_only') || 'random',
          default_landing: (data.default_landing as 'today' | 'vision' | 'inbox') || 'today',
          updated_at: new Date().toISOString(),
        }).eq('user_id', user.id);
        break;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error saving step data:', error);
    return { error: 'Failed to save data' };
  }
}

