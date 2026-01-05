'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TIMEZONE_OPTIONS } from '@/lib/utils/timezone';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { UserSettings, UserBaseline, LifeDomain, IdentityStatement, UserValue } from '@/lib/types/database';

interface SettingsViewProps {
  settings: UserSettings | null;
  baseline: UserBaseline | null;
  domains: LifeDomain[];
  identityStatements: IdentityStatement[];
  values: UserValue[];
}

export function SettingsView({ settings, baseline, domains, identityStatements, values }: SettingsViewProps) {
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();
  
  // Settings state
  const [timezone, setTimezone] = useState(settings?.timezone || 'UTC');
  const [maxOutcomes, setMaxOutcomes] = useState(settings?.max_daily_outcomes || 3);
  const [maxTasks, setMaxTasks] = useState(settings?.max_daily_tasks || 10);
  const [rotationMode, setRotationMode] = useState<string>(settings?.vision_rotation_mode || 'random');
  const [defaultLanding, setDefaultLanding] = useState<string>(settings?.default_landing || 'today');
  
  // Baseline state
  const [overwhelm, setOverwhelm] = useState(baseline?.overwhelm_level || 5);
  const [motivation, setMotivation] = useState(baseline?.motivation_level || 5);

  const handleSaveSettings = async () => {
    startTransition(async () => {
      const { error } = await (supabase
        .from('user_settings') as any)
        .update({
          timezone,
          max_daily_outcomes: maxOutcomes,
          max_daily_tasks: maxTasks,
          vision_rotation_mode: rotationMode,
          default_landing: defaultLanding,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', settings?.user_id);
      
      if (error) {
        toast.error('Failed to save settings');
      } else {
        toast.success('Settings saved');
      }
    });
  };

  const handleSaveBaseline = async () => {
    startTransition(async () => {
      const { error } = await (supabase
        .from('user_baseline') as any)
        .upsert({
          user_id: settings?.user_id,
          overwhelm_level: overwhelm,
          motivation_level: motivation,
          captured_at: new Date().toISOString(),
        });
      
      if (error) {
        toast.error('Failed to save baseline');
      } else {
        toast.success('Baseline updated');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your preferences and profile</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="baseline">Baseline</TabsTrigger>
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="domains">Life Domains</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Timezone</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map(tz => (
                    <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dashboard Caps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Max daily outcomes</label>
                  <span>{maxOutcomes}</span>
                </div>
                <Slider
                  value={[maxOutcomes]}
                  onValueChange={([v]) => setMaxOutcomes(v)}
                  min={1}
                  max={5}
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Max daily tasks shown</label>
                  <span>{maxTasks}</span>
                </div>
                <Slider
                  value={[maxTasks]}
                  onValueChange={([v]) => setMaxTasks(v)}
                  min={3}
                  max={20}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Vision rotation mode</label>
                <Select value={rotationMode} onValueChange={(v) => setRotationMode(v as 'random' | 'by_active_goal' | 'pinned_only')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Random</SelectItem>
                    <SelectItem value="by_active_goal">By active goal</SelectItem>
                    <SelectItem value="pinned_only">Pinned only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default landing page</label>
                <Select value={defaultLanding} onValueChange={(v) => setDefaultLanding(v as 'today' | 'vision' | 'inbox')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Today Dashboard</SelectItem>
                    <SelectItem value="vision">Vision Mode</SelectItem>
                    <SelectItem value="inbox">Inbox</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSaveSettings} disabled={isPending}>
            Save Settings
          </Button>
        </TabsContent>

        {/* Baseline */}
        <TabsContent value="baseline" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Baseline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Refresh these periodically to track your progress.
                {baseline?.captured_at && (
                  <span> Last updated: {new Date(baseline.captured_at).toLocaleDateString()}</span>
                )}
              </p>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Overwhelm level</label>
                  <span>{overwhelm}/10</span>
                </div>
                <Slider
                  value={[overwhelm]}
                  onValueChange={([v]) => setOverwhelm(v)}
                  min={0}
                  max={10}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Clear</span>
                  <span>Overwhelmed</span>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium">Motivation level</label>
                  <span>{motivation}/10</span>
                </div>
                <Slider
                  value={[motivation]}
                  onValueChange={([v]) => setMotivation(v)}
                  min={0}
                  max={10}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>None</span>
                  <span>High</span>
                </div>
              </div>
              
              <Button onClick={handleSaveBaseline} disabled={isPending}>
                Update Baseline
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Identity */}
        <TabsContent value="identity" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Identity Statements</CardTitle>
            </CardHeader>
            <CardContent>
              {identityStatements.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No identity statements. Complete the onboarding wizard to add some.
                </p>
              ) : (
                <ul className="space-y-2">
                  {identityStatements.map((statement, i) => (
                    <li key={statement.id} className="flex items-start gap-2">
                      <span className="text-muted-foreground">{i + 1}.</span>
                      <span>{statement.content}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Core Values</CardTitle>
            </CardHeader>
            <CardContent>
              {values.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No values defined. Complete the onboarding wizard to add some.
                </p>
              ) : (
                <div className="space-y-3">
                  {values.map((value, i) => (
                    <div key={value.id} className="flex items-start gap-3">
                      {value.rank_order && (
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                          {value.rank_order}
                        </span>
                      )}
                      <div>
                        <p className="font-medium">{value.name}</p>
                        {value.definition && (
                          <p className="text-sm text-muted-foreground">{value.definition}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Life Domains */}
        <TabsContent value="domains" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Life Domains</CardTitle>
            </CardHeader>
            <CardContent>
              {domains.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No life domains. Complete the onboarding wizard to add some.
                </p>
              ) : (
                <div className="space-y-4">
                  {domains.map((domain) => (
                    <div key={domain.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{domain.name}</span>
                        <span className="text-sm">{domain.satisfaction_score}/10</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all"
                          style={{ width: `${domain.satisfaction_score * 10}%` }}
                        />
                      </div>
                      {domain.plus_two_definition && (
                        <p className="text-xs text-muted-foreground">
                          +2: {domain.plus_two_definition}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

