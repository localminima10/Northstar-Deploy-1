import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Check if user has completed onboarding
  const { data: settings } = await supabase
    .from('user_settings')
    .select('onboarding_completed, default_landing')
    .eq('user_id', user.id)
    .single();
  
  // If no settings or onboarding not completed, go to wizard
  if (!settings || !settings.onboarding_completed) {
    redirect('/wizard/0');
  }
  
  // Redirect to user's default landing page
  const landingMap: Record<string, string> = {
    today: '/today',
    vision: '/vision',
    inbox: '/inbox',
  };
  
  redirect(landingMap[settings.default_landing] || '/today');
}
