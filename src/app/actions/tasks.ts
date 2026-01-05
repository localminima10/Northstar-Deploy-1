'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface TaskInput {
  project_id?: string;
  title: string;
  notes?: string;
  due_date?: string;
  status?: 'open' | 'done' | 'archived';
  is_next_action?: boolean;
}

export async function createTask(input: TaskInput) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  // If setting as next action, clear existing next action for this project
  if (input.is_next_action && input.project_id) {
    await supabase
      .from('tasks')
      .update({ is_next_action: false })
      .eq('project_id', input.project_id)
      .eq('is_next_action', true);
  }
  
  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      project_id: input.project_id || null,
      title: input.title,
      notes: input.notes || null,
      due_date: input.due_date || null,
      status: input.status || 'open',
      is_next_action: input.is_next_action || false,
    })
    .select()
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/projects');
  revalidatePath('/today');
  return { data: task };
}

export async function updateTask(taskId: string, input: Partial<TaskInput>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  // If setting as next action, clear existing next action for this project
  if (input.is_next_action) {
    // Get the task's project_id
    const { data: currentTask } = await supabase
      .from('tasks')
      .select('project_id')
      .eq('id', taskId)
      .single();
    
    if (currentTask?.project_id) {
      await supabase
        .from('tasks')
        .update({ is_next_action: false })
        .eq('project_id', currentTask.project_id)
        .eq('is_next_action', true)
        .neq('id', taskId);
    }
  }
  
  const { data: task, error } = await supabase
    .from('tasks')
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/projects');
  revalidatePath('/today');
  return { data: task };
}

export async function setNextAction(taskId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  // Get the task's project_id
  const { data: task } = await supabase
    .from('tasks')
    .select('project_id')
    .eq('id', taskId)
    .eq('user_id', user.id)
    .single();
  
  if (!task?.project_id) {
    return { error: 'Task must belong to a project to be a next action' };
  }
  
  // Clear existing next action for this project
  await supabase
    .from('tasks')
    .update({ is_next_action: false, updated_at: new Date().toISOString() })
    .eq('project_id', task.project_id)
    .eq('is_next_action', true);
  
  // Set this task as next action
  const { error } = await supabase
    .from('tasks')
    .update({ is_next_action: true, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .eq('user_id', user.id);
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/projects');
  revalidatePath('/today');
  return { success: true };
}

export async function completeTask(taskId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { error } = await supabase
    .from('tasks')
    .update({ 
      status: 'done', 
      is_next_action: false,
      updated_at: new Date().toISOString() 
    })
    .eq('id', taskId)
    .eq('user_id', user.id);
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/projects');
  revalidatePath('/today');
  return { success: true };
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', user.id);
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/projects');
  revalidatePath('/today');
  return { success: true };
}

export async function getNextActions() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      project:projects(id, title, goal_id)
    `)
    .eq('user_id', user.id)
    .eq('is_next_action', true)
    .eq('status', 'open')
    .order('created_at', { ascending: true });
  
  if (error) {
    return { error: error.message };
  }
  
  return { data };
}

