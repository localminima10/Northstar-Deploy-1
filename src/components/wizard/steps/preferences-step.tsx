'use client';

import { useState } from 'react';
import { WizardShell } from '../wizard-shell';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Json } from '@/lib/types/database';

interface PreferencesStepProps {
  stepId: string;
  initialData: Json;
}

export function PreferencesStep({ stepId, initialData }: PreferencesStepProps) {
  const data = initialData as Record<string, unknown>;
  
  const [maxDailyOutcomes, setMaxDailyOutcomes] = useState<number>((data.max_daily_outcomes as number) || 3);
  const [maxDailyTasks, setMaxDailyTasks] = useState<number>((data.max_daily_tasks as number) || 10);
  const [visionRotationMode, setVisionRotationMode] = useState<string>((data.vision_rotation_mode as string) || 'random');
  const [defaultLanding, setDefaultLanding] = useState<string>((data.default_landing as string) || 'today');

  const formData = {
    max_daily_outcomes: maxDailyOutcomes,
    max_daily_tasks: maxDailyTasks,
    vision_rotation_mode: visionRotationMode,
    default_landing: defaultLanding,
  };

  return (
    <WizardShell
      stepId={stepId}
      initialData={initialData}
      formData={formData}
      canProceed={true}
    >
      <div className="space-y-8">
        {/* Max Daily Outcomes */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              Max focus outcomes per day
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              How many &quot;must-win&quot; items do you want to pick each morning?
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">1</span>
              <span className="font-medium text-lg">{maxDailyOutcomes}</span>
              <span className="text-muted-foreground">5</span>
            </div>
            <Slider
              value={[maxDailyOutcomes]}
              onValueChange={([v]) => setMaxDailyOutcomes(v)}
              min={1}
              max={5}
              step={1}
            />
          </div>
        </div>

        {/* Max Daily Tasks */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              Max tasks shown on Today dashboard
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Limits how many tasks appear at once to reduce overwhelm.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">3</span>
              <span className="font-medium text-lg">{maxDailyTasks}</span>
              <span className="text-muted-foreground">20</span>
            </div>
            <Slider
              value={[maxDailyTasks]}
              onValueChange={([v]) => setMaxDailyTasks(v)}
              min={3}
              max={20}
              step={1}
            />
          </div>
        </div>

        {/* Vision Rotation Mode */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              Vision tile rotation
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              How should vision tiles be displayed on your dashboard?
            </p>
          </div>
          
          <RadioGroup
            value={visionRotationMode}
            onValueChange={setVisionRotationMode}
            className="space-y-2"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50">
              <RadioGroupItem value="random" id="random" />
              <Label htmlFor="random" className="cursor-pointer flex-1">
                <span className="font-medium">Random</span>
                <p className="text-sm text-muted-foreground">Show different tiles each time</p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50">
              <RadioGroupItem value="by_active_goal" id="by_active_goal" />
              <Label htmlFor="by_active_goal" className="cursor-pointer flex-1">
                <span className="font-medium">By active goal</span>
                <p className="text-sm text-muted-foreground">Rotate tiles based on your current goals</p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50">
              <RadioGroupItem value="pinned_only" id="pinned_only" />
              <Label htmlFor="pinned_only" className="cursor-pointer flex-1">
                <span className="font-medium">Pinned only</span>
                <p className="text-sm text-muted-foreground">Only show tiles you&apos;ve pinned</p>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Default Landing */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              Default landing page
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Where should you land when you open the app?
            </p>
          </div>
          
          <RadioGroup
            value={defaultLanding}
            onValueChange={setDefaultLanding}
            className="space-y-2"
          >
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50">
              <RadioGroupItem value="today" id="today" />
              <Label htmlFor="today" className="cursor-pointer flex-1">
                <span className="font-medium">Today Dashboard</span>
                <p className="text-sm text-muted-foreground">Focus, tasks, and habits</p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50">
              <RadioGroupItem value="vision" id="vision" />
              <Label htmlFor="vision" className="cursor-pointer flex-1">
                <span className="font-medium">Vision Mode</span>
                <p className="text-sm text-muted-foreground">Full-screen visualization board</p>
              </Label>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-accent/50">
              <RadioGroupItem value="inbox" id="inbox" />
              <Label htmlFor="inbox" className="cursor-pointer flex-1">
                <span className="font-medium">Inbox</span>
                <p className="text-sm text-muted-foreground">Capture and process thoughts</p>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </WizardShell>
  );
}

