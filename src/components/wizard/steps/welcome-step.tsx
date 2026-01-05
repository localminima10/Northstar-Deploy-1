'use client';

import { useState } from 'react';
import { WizardShell } from '../wizard-shell';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Json } from '@/lib/types/database';

interface WelcomeStepProps {
  stepId: string;
  initialData: Json;
}

export function WelcomeStep({ stepId, initialData }: WelcomeStepProps) {
  const data = initialData as Record<string, unknown>;
  
  const [intention, setIntention] = useState<string>((data.intention as string) || '');
  const [overwhelmLevel, setOverwhelmLevel] = useState<number>((data.overwhelm_level as number) || 5);
  const [motivationLevel, setMotivationLevel] = useState<number>((data.motivation_level as number) || 5);
  const [timeBudget, setTimeBudget] = useState<number>((data.time_budget_weekly_hours as number) || 10);
  
  const formData = {
    intention,
    overwhelm_level: overwhelmLevel,
    motivation_level: motivationLevel,
    time_budget_weekly_hours: timeBudget,
  };
  
  const canProceed = overwhelmLevel !== undefined && motivationLevel !== undefined;

  return (
    <WizardShell
      stepId={stepId}
      initialData={initialData}
      formData={formData}
      canProceed={canProceed}
      skipable={false}
    >
      <div className="space-y-8">
        {/* Intention */}
        <div className="space-y-3">
          <Label htmlFor="intention" className="text-base font-medium">
            What do you want this app to help you feel more of in 2026?
          </Label>
          <p className="text-sm text-muted-foreground">
            Example: calm, focused, confident, consistent.
          </p>
          <Textarea
            id="intention"
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="I want to feel more..."
            className="min-h-[100px]"
            maxLength={500}
          />
        </div>
        
        {/* Overwhelm Level */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              Right now, how overwhelmed do you feel?
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              0 = Clear mind, 10 = Completely overwhelmed
            </p>
          </div>
          <div className="space-y-3">
            <Slider
              value={[overwhelmLevel]}
              onValueChange={([value]) => setOverwhelmLevel(value)}
              min={0}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Clear</span>
              <span className="font-medium text-foreground text-lg">{overwhelmLevel}</span>
              <span>Overwhelmed</span>
            </div>
          </div>
        </div>
        
        {/* Motivation Level */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              Right now, how motivated do you feel?
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              0 = No motivation, 10 = Highly motivated
            </p>
          </div>
          <div className="space-y-3">
            <Slider
              value={[motivationLevel]}
              onValueChange={([value]) => setMotivationLevel(value)}
              min={0}
              max={10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>None</span>
              <span className="font-medium text-foreground text-lg">{motivationLevel}</span>
              <span>High</span>
            </div>
          </div>
        </div>
        
        {/* Time Budget */}
        <div className="space-y-3">
          <Label htmlFor="timeBudget" className="text-base font-medium">
            Realistically, how many hours per week can you invest in your goals/projects?
          </Label>
          <div className="flex items-center gap-3">
            <Input
              id="timeBudget"
              type="number"
              value={timeBudget}
              onChange={(e) => setTimeBudget(parseInt(e.target.value) || 0)}
              min={0}
              max={80}
              className="w-24"
            />
            <span className="text-muted-foreground">hours/week</span>
          </div>
        </div>
      </div>
    </WizardShell>
  );
}

