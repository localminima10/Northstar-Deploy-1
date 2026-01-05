'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface InboxItemInput {
  content: string;
  linked_goal_id?: string;
  linked_project_id?: string;
}

export async function createInboxItem(input: InboxItemInput) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data: item, error } = await supabase
    .from('inbox_items')
    .insert({
      user_id: user.id,
      content: input.content,
      status: 'inbox',
      linked_goal_id: input.linked_goal_id || null,
      linked_project_id: input.linked_project_id || null,
    })
    .select()
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/inbox');
  revalidatePath('/today');
  return { data: item };
}

export async function processInboxItem(
  itemId: string, 
  action: 'task' | 'project' | 'archive' | 'delete',
  options?: {
    projectId?: string;
    goalId?: string;
    title?: string;
    definitionOfDone?: string;
  }
) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  // Get the inbox item
  const { data: item } = await supabase
    .from('inbox_items')
    .select('*')
    .eq('id', itemId)
    .eq('user_id', user.id)
    .single() as { data: { content: string } | null };
  
  if (!item) {
    return { error: 'Item not found' };
  }
  
  switch (action) {
    case 'task':
      // Create task from inbox item (projectId is optional for standalone tasks)
      await (supabase.from('tasks') as any).insert({
        user_id: user.id,
        project_id: options?.projectId || null,
        title: options?.title || item.content,
        status: 'open',
        is_next_action: false,
      });
      break;
      
    case 'project':
      // Create project from inbox item
      const { data: project } = await (supabase.from('projects') as any).insert({
        user_id: user.id,
        goal_id: options?.goalId || null,
        title: options?.title || item.content,
        definition_of_done: options?.definitionOfDone || null,
        status: 'active',
      }).select().single();
      
      // Update inbox item with project link
      if (project) {
        await (supabase.from('inbox_items') as any).update({
          linked_project_id: project.id,
        }).eq('id', itemId);
      }
      break;
      
    case 'delete':
      await (supabase.from('inbox_items') as any).delete().eq('id', itemId).eq('user_id', user.id);
      revalidatePath('/inbox');
      revalidatePath('/today');
      return { success: true };
      
    case 'archive':
      // Archive case - just update status
      break;
  }
  
  // Mark as processed (for task, project, and archive actions)
  await (supabase.from('inbox_items') as any).update({
    status: action === 'archive' ? 'archived' : 'processed',
    processed_at: new Date().toISOString(),
  }).eq('id', itemId).eq('user_id', user.id);
  
  revalidatePath('/inbox');
  revalidatePath('/today');
  revalidatePath('/projects');
  return { success: true };
}

export async function getInboxItems(status: 'inbox' | 'processed' | 'archived' | 'all' = 'inbox') {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  let query = supabase
    .from('inbox_items')
    .select(`
      *,
      linked_goal:goals(id, title),
      linked_project:projects(id, title)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (status !== 'all') {
    query = query.eq('status', status);
  }
  
  const { data, error } = await query;
  
  if (error) {
    return { error: error.message };
  }
  
  return { data };
}

export async function getInboxCount() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { count, error } = await supabase
    .from('inbox_items')
    .select('id', { count: 'exact' })
    .eq('user_id', user.id)
    .eq('status', 'inbox');
  
  if (error) {
    return { error: error.message };
  }
  
  return { count: count || 0 };
}
