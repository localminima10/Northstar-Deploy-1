import { createClient } from '@/lib/supabase/server';
import { VisionMode } from '@/components/vision/vision-mode';

export default async function VisionPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const currentYear = new Date().getFullYear();
  
  // Get year compass
  const { data: yearCompass } = await supabase
    .from('year_compass')
    .select('*')
    .eq('user_id', user.id)
    .eq('year', currentYear)
    .single();
  
  // Get vision tiles
  const { data: visionTiles } = await supabase
    .from('vision_tiles')
    .select('*')
    .eq('user_id', user.id)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });
  
  // Get identity statements
  const { data: identityStatements } = await supabase
    .from('identity_statements')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order');
  
  // Get user settings for mantra and visualization script
  const { data: settings } = await supabase
    .from('user_settings')
    .select('mantra, visualization_script')
    .eq('user_id', user.id)
    .single();
  
  // Get active goals for context
  const { data: activeGoals } = await supabase
    .from('goals')
    .select('id, title, approach_phrase')
    .eq('user_id', user.id)
    .eq('status', 'active');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vision</h1>
          <p className="text-muted-foreground mt-1">
            Immerse yourself in your future reality
          </p>
        </div>
      </div>
      
      <VisionMode
        yearCompass={yearCompass}
        visionTiles={visionTiles || []}
        settings={settings}
        identityStatements={identityStatements || []}
        activeGoals={activeGoals || []}
      />
    </div>
  );
}
