import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AppSidebar } from '@/components/shared/app-sidebar';
import { MobileNav } from '@/components/shared/mobile-nav';
import { SetupIncompleteBanner } from '@/components/shared/setup-incomplete-banner';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Get user settings
  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  // Check for incomplete wizard steps
  const { data: wizardProgress } = await supabase
    .from('wizard_progress')
    .select('step_id, completed')
    .eq('user_id', user.id);
  
  const incompleteSteps = (wizardProgress as Array<{ step_id: string; completed: boolean }> | null)?.filter(step => !step.completed) || [];
  
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar user={user} settings={settings} />
      <div className="flex-1 flex flex-col overflow-auto">
        <MobileNav user={user} settings={settings} />
        <main className="flex-1 overflow-auto">
          {incompleteSteps.length > 0 && (
            <SetupIncompleteBanner incompleteSteps={incompleteSteps} />
          )}
          <div className="container mx-auto p-4 md:p-6 max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

