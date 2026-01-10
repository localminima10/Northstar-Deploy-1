'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  UserSettings,
  UserBaseline,
  LifeDomain,
  IdentityStatement,
  UserValue,
  YearCompass,
  Goal,
  Project,
  Task,
  Habit,
  Woop,
  IfThenPlan,
  LeadIndicator,
} from '@/lib/types/database';

export interface ExportData {
  exportedAt: string;
  settings: UserSettings | null;
  baseline: UserBaseline | null;
  lifeDomains: LifeDomain[];
  identityStatements: IdentityStatement[];
  values: UserValue[];
  yearCompass: YearCompass | null;
  goals: (Goal & { linkedValues?: UserValue[] })[];
  projects: (Project & { tasks?: Task[] })[];
  habits: Habit[];
  leadIndicators: LeadIndicator[];
  woops: Woop[];
  ifThenPlans: IfThenPlan[];
}

export async function getAllUserData(): Promise<{ data?: ExportData; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }

  const currentYear = new Date().getFullYear();

  // Fetch all data in parallel for efficiency
  const [
    settingsResult,
    baselineResult,
    lifeDomainsResult,
    identityStatementsResult,
    valuesResult,
    yearCompassResult,
    goalsResult,
    goalValueLinksResult,
    projectsResult,
    tasksResult,
    habitsResult,
    leadIndicatorsResult,
    woopsResult,
    ifThenPlansResult,
  ] = await Promise.all([
    supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('user_baseline')
      .select('*')
      .eq('user_id', user.id)
      .single(),
    supabase
      .from('life_domains')
      .select('*')
      .eq('user_id', user.id)
      .order('name'),
    supabase
      .from('identity_statements')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order'),
    supabase
      .from('user_values')
      .select('*')
      .eq('user_id', user.id)
      .order('rank_order', { ascending: true, nullsFirst: false }),
    supabase
      .from('year_compass')
      .select('*')
      .eq('user_id', user.id)
      .eq('year', currentYear)
      .single(),
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('goal_value_links')
      .select('goal_id, value_id'),
    supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('lead_indicators')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('woops')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('if_then_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  // Process goals with linked values
  const goals = goalsResult.data || [];
  const values = valuesResult.data || [];
  const goalValueLinks = goalValueLinksResult.data || [];

  const goalsWithValues = goals.map((goal) => {
    const linkedValueIds = goalValueLinks
      .filter((link) => link.goal_id === goal.id)
      .map((link) => link.value_id);
    const linkedValues = values.filter((v) => linkedValueIds.includes(v.id));
    return { ...goal, linkedValues };
  });

  // Process projects with tasks
  const projects = projectsResult.data || [];
  const tasks = tasksResult.data || [];

  const projectsWithTasks = projects.map((project) => {
    const projectTasks = tasks.filter((task) => task.project_id === project.id);
    return { ...project, tasks: projectTasks };
  });

  return {
    data: {
      exportedAt: new Date().toISOString(),
      settings: settingsResult.data,
      baseline: baselineResult.data,
      lifeDomains: lifeDomainsResult.data || [],
      identityStatements: identityStatementsResult.data || [],
      values,
      yearCompass: yearCompassResult.data,
      goals: goalsWithValues,
      projects: projectsWithTasks,
      habits: habitsResult.data || [],
      leadIndicators: leadIndicatorsResult.data || [],
      woops: woopsResult.data || [],
      ifThenPlans: ifThenPlansResult.data || [],
    },
  };
}
