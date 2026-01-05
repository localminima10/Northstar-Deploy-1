'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface ProjectInput {
  goal_id?: string;
  title: string;
  definition_of_done?: string;
  due_date?: string;
  status?: 'active' | 'paused' | 'archived';
}

export async function createProject(input: ProjectInput) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      goal_id: input.goal_id || null,
      title: input.title,
      definition_of_done: input.definition_of_done || null,
      due_date: input.due_date || null,
      status: input.status || 'active',
    })
    .select()
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/projects');
  revalidatePath('/today');
  return { data: project };
}

export async function updateProject(projectId: string, input: Partial<ProjectInput>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data: project, error } = await supabase
    .from('projects')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/projects');
  revalidatePath('/today');
  return { data: project };
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)
    .eq('user_id', user.id);
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/projects');
  revalidatePath('/today');
  return { success: true };
}

export async function getProjects() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      goal:goals(id, title),
      tasks(id, title, status, is_next_action)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (error) {
    return { error: error.message };
  }
  
  return { data };
}

export async function getProjectsNeedingNextAction() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  // Get all active projects with their tasks
  const { data: projects, error } = await supabase
    .from('projects')
    .select(`
      *,
      tasks(id, title, status, is_next_action)
    `)
    .eq('user_id', user.id)
    .eq('status', 'active');
  
  if (error) {
    return { error: error.message };
  }
  
  // Filter to projects without a next action
  const projectsNeedingAction = projects?.filter(p => {
    const openTasks = p.tasks?.filter((t: { status: string }) => t.status === 'open') || [];
    const hasNextAction = openTasks.some((t: { is_next_action: boolean }) => t.is_next_action);
    return !hasNextAction;
  }) || [];
  
  return { data: projectsNeedingAction };
}

