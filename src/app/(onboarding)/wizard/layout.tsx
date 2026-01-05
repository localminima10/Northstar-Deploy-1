import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Ensure user_settings exists
  const { data: settings } = await supabase
    .from('user_settings')
    .select('onboarding_completed')
    .eq('user_id', user.id)
    .single();
  
  const typedSettings = settings as { onboarding_completed: boolean } | null;
  
  if (!typedSettings) {
    // Create settings if not exists
    await (supabase.from('user_settings') as any).insert({
      user_id: user.id,
      onboarding_completed: false,
    });
  } else if (typedSettings.onboarding_completed) {
    // If onboarding is already complete, redirect to app
    redirect('/today');
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {children}
    </div>
  );
}

