import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TOTAL_STEPS } from '@/lib/wizard-config';

// Import step components
import { WelcomeStep } from '@/components/wizard/steps/welcome-step';
import { BrainDumpStep } from '@/components/wizard/steps/brain-dump-step';
import { ValuesStep } from '@/components/wizard/steps/values-step';
import { IdentityStep } from '@/components/wizard/steps/identity-step';
import { YearThemeStep } from '@/components/wizard/steps/year-theme-step';
import { LifeDomainsStep } from '@/components/wizard/steps/life-domains-step';
import { VisualizationStep } from '@/components/wizard/steps/visualization-step';
import { GoalsStep } from '@/components/wizard/steps/goals-step';
import { LeadIndicatorsStep } from '@/components/wizard/steps/lead-indicators-step';
import { ProjectsStep } from '@/components/wizard/steps/projects-step';
import { WoopStep } from '@/components/wizard/steps/woop-step';
import { HabitsStep } from '@/components/wizard/steps/habits-step';
import { CadenceStep } from '@/components/wizard/steps/cadence-step';
import { PreferencesStep } from '@/components/wizard/steps/preferences-step';
import { FinishStep } from '@/components/wizard/steps/finish-step';

interface PageProps {
  params: Promise<{ step: string }>;
}

export default async function WizardStepPage({ params }: PageProps) {
  const { step } = await params;
  const stepNumber = parseInt(step);
  
  // Validate step number
  if (isNaN(stepNumber) || stepNumber < 0 || stepNumber >= TOTAL_STEPS) {
    redirect('/wizard/0');
  }
  
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }
  
  // Get existing wizard progress for this step
  const { data: progress } = await supabase
    .from('wizard_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('step_id', step)
    .single() as { data: { payload: Record<string, unknown> } | null };
  
  // Get all progress to pass to steps that need previous data
  const { data: allProgress } = await supabase
    .from('wizard_progress')
    .select('*')
    .eq('user_id', user.id);
  
  // Get user's goals for steps that need them
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id);
  
  // Get user's values for steps that need them
  const { data: values } = await supabase
    .from('user_values')
    .select('*')
    .eq('user_id', user.id);
  
  // Get lead indicators for habit step
  const { data: leadIndicators } = await supabase
    .from('lead_indicators')
    .select('*')
    .eq('user_id', user.id);
  
  const initialData = (progress?.payload || {}) as any;
  
  // Render the appropriate step component
  const stepComponents: Record<number, React.ReactNode> = {
    0: <WelcomeStep stepId={step} initialData={initialData} />,
    1: <BrainDumpStep stepId={step} initialData={initialData} />,
    2: <ValuesStep stepId={step} initialData={initialData} />,
    3: <IdentityStep stepId={step} initialData={initialData} />,
    4: <YearThemeStep stepId={step} initialData={initialData} />,
    5: <LifeDomainsStep stepId={step} initialData={initialData} />,
    6: <VisualizationStep stepId={step} initialData={initialData} />,
    7: <GoalsStep stepId={step} initialData={initialData} userValues={values || []} />,
    8: <LeadIndicatorsStep stepId={step} initialData={initialData} goals={goals || []} />,
    9: <ProjectsStep stepId={step} initialData={initialData} goals={goals || []} />,
    10: <WoopStep stepId={step} initialData={initialData} goals={goals || []} />,
    11: <HabitsStep stepId={step} initialData={initialData} goals={goals || []} leadIndicators={leadIndicators || []} />,
    12: <CadenceStep stepId={step} initialData={initialData} />,
    13: <PreferencesStep stepId={step} initialData={initialData} />,
    14: <FinishStep stepId={step} allProgress={allProgress || []} goals={goals || []} />,
  };
  
  return stepComponents[stepNumber] || redirect('/wizard/0');
}

