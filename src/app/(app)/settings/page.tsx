import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from './settings-form';

export default async function SettingsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  // Get user settings
  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  // Get baseline
  const { data: baseline } = await supabase
    .from('user_baseline')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  // Get life domains
  const { data: lifeDomains } = await supabase
    .from('life_domains')
    .select('*')
    .eq('user_id', user.id)
    .order('name');
  
  // Get values
  const { data: values } = await supabase
    .from('user_values')
    .select('*')
    .eq('user_id', user.id)
    .order('rank_order', { ascending: true, nullsFirst: false });
  
  // Get identity statements
  const { data: identityStatements } = await supabase
    .from('identity_statements')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order');
  
  // Get if-then plans
  const { data: ifThenPlans } = await supabase
    .from('if_then_plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize your Northstar experience
        </p>
      </div>
      
      <SettingsForm
        settings={settings}
        baseline={baseline}
        lifeDomains={lifeDomains || []}
        values={values || []}
        identityStatements={identityStatements || []}
        ifThenPlans={ifThenPlans || []}
        userEmail={user.email || ''}
      />
    </div>
  );
}
