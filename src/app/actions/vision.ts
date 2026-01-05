'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export interface VisionTileInput {
  tile_type: 'image' | 'text';
  text_content?: string;
  image_path?: string;
  tags?: string[];
  pinned?: boolean;
}

export async function createVisionTile(input: VisionTileInput) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data: tile, error } = await supabase
    .from('vision_tiles')
    .insert({
      user_id: user.id,
      tile_type: input.tile_type,
      text_content: input.text_content || null,
      image_path: input.image_path || null,
      tags: input.tags || null,
      pinned: input.pinned || false,
    })
    .select()
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/vision');
  revalidatePath('/today');
  return { data: tile };
}

export async function updateVisionTile(tileId: string, input: Partial<VisionTileInput>) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data: tile, error } = await supabase
    .from('vision_tiles')
    .update(input)
    .eq('id', tileId)
    .eq('user_id', user.id)
    .select()
    .single();
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/vision');
  revalidatePath('/today');
  return { data: tile };
}

export async function deleteVisionTile(tileId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { error } = await supabase
    .from('vision_tiles')
    .delete()
    .eq('id', tileId)
    .eq('user_id', user.id);
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/vision');
  revalidatePath('/today');
  return { success: true };
}

export async function togglePinTile(tileId: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  // Get current tile
  const { data: current } = await supabase
    .from('vision_tiles')
    .select('pinned')
    .eq('id', tileId)
    .eq('user_id', user.id)
    .single();
  
  if (!current) {
    return { error: 'Tile not found' };
  }
  
  const { error } = await supabase
    .from('vision_tiles')
    .update({ pinned: !current.pinned })
    .eq('id', tileId)
    .eq('user_id', user.id);
  
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/vision');
  revalidatePath('/today');
  return { success: true, pinned: !current.pinned };
}

export async function getVisionTiles() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data, error } = await supabase
    .from('vision_tiles')
    .select('*')
    .eq('user_id', user.id)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });
  
  if (error) {
    return { error: error.message };
  }
  
  return { data };
}

export async function getRandomVisionTile() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  // Get user settings for rotation mode
  const { data: settings } = await supabase
    .from('user_settings')
    .select('vision_rotation_mode')
    .eq('user_id', user.id)
    .single();
  
  const mode = settings?.vision_rotation_mode || 'random';
  
  let query = supabase
    .from('vision_tiles')
    .select('*')
    .eq('user_id', user.id);
  
  if (mode === 'pinned_only') {
    query = query.eq('pinned', true);
  }
  
  const { data: tiles, error } = await query;
  
  if (error) {
    return { error: error.message };
  }
  
  if (!tiles || tiles.length === 0) {
    return { data: null };
  }
  
  // Pick a random tile (or pinned if mode is pinned_only)
  const randomIndex = Math.floor(Math.random() * tiles.length);
  return { data: tiles[randomIndex] };
}

export async function getYearCompass() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const currentYear = new Date().getFullYear();
  
  const { data, error } = await supabase
    .from('year_compass')
    .select('*')
    .eq('user_id', user.id)
    .eq('year', currentYear)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    return { error: error.message };
  }
  
  return { data };
}

export async function getIdentityStatements() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const { data, error } = await supabase
    .from('identity_statements')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true });
  
  if (error) {
    return { error: error.message };
  }
  
  return { data };
}

