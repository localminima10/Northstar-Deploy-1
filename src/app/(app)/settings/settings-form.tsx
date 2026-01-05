'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { updateSettings, updateBaseline } from '@/app/actions/settings';
import { signOut } from '@/app/actions/auth';
import { TIMEZONE_OPTIONS } from '@/lib/utils/timezone';
import { toast } from 'sonner';
import type { UserSettings, UserBaseline, LifeDomain, UserValue, IdentityStatement, IfThenPlan } from '@/lib/types/database';

interface SettingsFormProps {
  settings: UserSettings | null;
  baseline: UserBaseline | null;
  lifeDomains: LifeDomain[];
  values: UserValue[];
  identityStatements: IdentityStatement[];
  ifThenPlans: IfThenPlan[];
  userEmail: string;
}

export function SettingsForm({
  settings,
  baseline,
  lifeDomains,
  values,
  identityStatements,
  ifThenPlans,
  userEmail,
}: SettingsFormProps) {
  const [isPending, startTransition] = useTransition();
  
  // General settings
  const [timezone, setTimezone] = useState(settings?.timezone || 'UTC');
  const [defaultLanding, setDefaultLanding] = useState<string>(settings?.default_landing || 'today');
  
  // Dashboard caps
  const [maxDailyOutcomes, setMaxDailyOutcomes] = useState(settings?.max_daily_outcomes || 3);
  const [maxDailyTasks, setMaxDailyTasks] = useState(settings?.max_daily_tasks || 10);
  
  // Vision settings
  const [visionRotationMode, setVisionRotationMode] = useState<string>(settings?.vision_rotation_mode || 'random');
  const [mantra, setMantra] = useState(settings?.mantra || '');
  const [visualizationScript, setVisualizationScript] = useState(settings?.visualization_script || '');
  
  // Cadence
  const [dailyCheckinTime, setDailyCheckinTime] = useState(settings?.daily_checkin_time || '');
  const [weeklyReviewDay, setWeeklyReviewDay] = useState(settings?.weekly_review_day?.toString() || '0');
  const [weeklyReviewTime, setWeeklyReviewTime] = useState(settings?.weekly_review_time || '');
  
  // Notifications
  const [notifications, setNotifications] = useState<string[]>(settings?.notifications || []);
  
  // Derailers
  const [commonDerailers, setCommonDerailers] = useState<string[]>(settings?.common_derailers || []);
  const [newDerailer, setNewDerailer] = useState('');
  
  // Baseline
  const [overwhelmLevel, setOverwhelmLevel] = useState(baseline?.overwhelm_level || 5);
  const [motivationLevel, setMotivationLevel] = useState(baseline?.motivation_level || 5);
  
  const handleSaveGeneral = () => {
    startTransition(async () => {
      const result = await updateSettings({
        timezone,
        default_landing: defaultLanding as 'today' | 'vision' | 'inbox',
        max_daily_outcomes: maxDailyOutcomes,
        max_daily_tasks: maxDailyTasks,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Settings saved');
      }
    });
  };
  
  const handleSaveVision = () => {
    startTransition(async () => {
      const result = await updateSettings({
        vision_rotation_mode: visionRotationMode as 'random' | 'by_active_goal' | 'pinned_only',
        mantra: mantra || undefined,
        visualization_script: visualizationScript || undefined,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Vision settings saved');
      }
    });
  };
  
  const handleSaveCadence = () => {
    startTransition(async () => {
      const result = await updateSettings({
        daily_checkin_time: dailyCheckinTime || undefined,
        weekly_review_day: weeklyReviewDay ? parseInt(weeklyReviewDay) : undefined,
        weekly_review_time: weeklyReviewTime || undefined,
        notifications,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Cadence settings saved');
      }
    });
  };
  
  const handleSaveDerailers = () => {
    startTransition(async () => {
      const result = await updateSettings({
        common_derailers: commonDerailers,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Derailers saved');
      }
    });
  };
  
  const handleSaveBaseline = () => {
    startTransition(async () => {
      const result = await updateBaseline(overwhelmLevel, motivationLevel);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Baseline updated');
      }
    });
  };
  
  const addDerailer = () => {
    if (newDerailer.trim() && !commonDerailers.includes(newDerailer.trim())) {
      setCommonDerailers([...commonDerailers, newDerailer.trim()]);
      setNewDerailer('');
    }
  };
  
  const removeDerailer = (derailer: string) => {
    setCommonDerailers(commonDerailers.filter(d => d !== derailer));
  };
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="vision">Vision</TabsTrigger>
        <TabsTrigger value="cadence">Cadence</TabsTrigger>
        <TabsTrigger value="obstacles">Obstacles</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
      </TabsList>
      
      {/* General Settings */}
      <TabsContent value="general" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Configure your basic preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Default Landing Page</Label>
              <Select value={defaultLanding} onValueChange={setDefaultLanding}>
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
            
            <div className="space-y-2">
              <Label>Max Daily Outcomes: {maxDailyOutcomes}</Label>
              <Slider
                value={[maxDailyOutcomes]}
                onValueChange={([v]) => setMaxDailyOutcomes(v)}
                min={1}
                max={5}
                step={1}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Max Daily Tasks: {maxDailyTasks}</Label>
              <Slider
                value={[maxDailyTasks]}
                onValueChange={([v]) => setMaxDailyTasks(v)}
                min={3}
                max={20}
                step={1}
              />
            </div>
            
            <Button onClick={handleSaveGeneral} disabled={isPending}>
              {isPending ? 'Saving...' : 'Save General Settings'}
            </Button>
          </CardContent>
        </Card>
        
        {/* Current Baseline */}
        <Card>
          <CardHeader>
            <CardTitle>Current Baseline</CardTitle>
            <CardDescription>Track how you're feeling to measure progress over time</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Overwhelm Level: {overwhelmLevel}/10</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  0 = Clear mind, 10 = Completely overwhelmed
                </p>
                <Slider
                  value={[overwhelmLevel]}
                  onValueChange={([v]) => setOverwhelmLevel(v)}
                  min={0}
                  max={10}
                  step={1}
                />
              </div>
              
              <div>
                <Label>Motivation Level: {motivationLevel}/10</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  0 = No motivation, 10 = Highly motivated
                </p>
                <Slider
                  value={[motivationLevel]}
                  onValueChange={([v]) => setMotivationLevel(v)}
                  min={0}
                  max={10}
                  step={1}
                />
              </div>
            </div>
            
            {baseline && (
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date(baseline.captured_at).toLocaleDateString()}
              </p>
            )}
            
            <Button onClick={handleSaveBaseline} disabled={isPending}>
              {isPending ? 'Saving...' : 'Update Baseline'}
            </Button>
          </CardContent>
        </Card>
        
        {/* Life Domains Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Life Domains</CardTitle>
            <CardDescription>Your {lifeDomains.length} life areas</CardDescription>
          </CardHeader>
          <CardContent>
            {lifeDomains.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No life domains set up. Complete the onboarding wizard to add them.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {lifeDomains.map((domain) => (
                  <div key={domain.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm">{domain.name}</span>
                    <span className="text-sm font-medium">{domain.satisfaction_score}/10</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Values Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Core Values</CardTitle>
            <CardDescription>Your {values.length} values</CardDescription>
          </CardHeader>
          <CardContent>
            {values.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No values set up. Complete the onboarding wizard to add them.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {values.map((value, index) => (
                  <span 
                    key={value.id} 
                    className={`px-3 py-1 rounded-full text-sm ${
                      index < 5 ? 'bg-primary/10 text-primary font-medium' : 'bg-muted'
                    }`}
                  >
                    {value.name}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Identity Statements Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Identity Statements</CardTitle>
            <CardDescription>Who you are becoming</CardDescription>
          </CardHeader>
          <CardContent>
            {identityStatements.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No identity statements set up.
              </p>
            ) : (
              <div className="space-y-2">
                {identityStatements.map((statement) => (
                  <p key={statement.id} className="text-sm italic">
                    "{statement.content}"
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Vision Settings */}
      <TabsContent value="vision" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Vision Settings</CardTitle>
            <CardDescription>Customize your manifestation experience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Vision Tile Rotation</Label>
              <Select value={visionRotationMode} onValueChange={setVisionRotationMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="by_active_goal">By Active Goal</SelectItem>
                  <SelectItem value="pinned_only">Pinned Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Daily Mantra</Label>
              <Input
                value={mantra}
                onChange={(e) => setMantra(e.target.value)}
                placeholder="A short phrase that energizes you"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Visualization Script</Label>
              <Textarea
                value={visualizationScript}
                onChange={(e) => setVisualizationScript(e.target.value)}
                placeholder="Write a guided visualization to read each morning..."
                rows={6}
              />
            </div>
            
            <Button onClick={handleSaveVision} disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Vision Settings'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Cadence Settings */}
      <TabsContent value="cadence" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Cadence Settings</CardTitle>
            <CardDescription>Set your rhythm and reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Daily Check-in Time</Label>
              <Input
                type="time"
                value={dailyCheckinTime}
                onChange={(e) => setDailyCheckinTime(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Weekly Review Day</Label>
                <Select value={weeklyReviewDay} onValueChange={setWeeklyReviewDay}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dayNames.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Weekly Review Time</Label>
                <Input
                  type="time"
                  value={weeklyReviewTime}
                  onChange={(e) => setWeeklyReviewTime(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Notifications</Label>
              <div className="space-y-2">
                {['daily_checkin', 'weekly_review', 'monthly_reset'].map((notif) => (
                  <label key={notif} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={notifications.includes(notif)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setNotifications([...notifications, notif]);
                        } else {
                          setNotifications(notifications.filter(n => n !== notif));
                        }
                      }}
                    />
                    <span className="text-sm">
                      {notif === 'daily_checkin' && 'Daily Check-in Reminder'}
                      {notif === 'weekly_review' && 'Weekly Review Reminder'}
                      {notif === 'monthly_reset' && 'Monthly Reset Reminder'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            
            <Button onClick={handleSaveCadence} disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Cadence Settings'}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Obstacles Settings */}
      <TabsContent value="obstacles" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Common Derailers</CardTitle>
            <CardDescription>Things that typically get in your way</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newDerailer}
                onChange={(e) => setNewDerailer(e.target.value)}
                placeholder="Add a derailer..."
                onKeyDown={(e) => e.key === 'Enter' && addDerailer()}
              />
              <Button onClick={addDerailer} variant="secondary">
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {commonDerailers.map((derailer) => (
                <span 
                  key={derailer}
                  className="px-3 py-1 bg-muted rounded-full text-sm flex items-center gap-2"
                >
                  {derailer}
                  <button
                    onClick={() => removeDerailer(derailer)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            
            <Button onClick={handleSaveDerailers} disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Derailers'}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>If-Then Plans</CardTitle>
            <CardDescription>Your {ifThenPlans.length} contingency plans</CardDescription>
          </CardHeader>
          <CardContent>
            {ifThenPlans.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No if-then plans set up. Create them during onboarding or weekly reviews.
              </p>
            ) : (
              <div className="space-y-2">
                {ifThenPlans.slice(0, 5).map((plan) => (
                  <div key={plan.id} className="p-3 bg-muted/30 rounded">
                    <p className="text-sm">
                      <span className="text-muted-foreground">If</span>{' '}
                      <span className="font-medium">{plan.trigger}</span>,{' '}
                      <span className="text-muted-foreground">then</span>{' '}
                      <span className="font-medium text-primary">{plan.response}</span>
                    </p>
                  </div>
                ))}
                {ifThenPlans.length > 5 && (
                  <p className="text-sm text-muted-foreground">
                    +{ifThenPlans.length - 5} more plans
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Account Settings */}
      <TabsContent value="account" className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Email</Label>
              <p className="text-muted-foreground">{userEmail}</p>
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => signOut()}
                className="w-full"
              >
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

