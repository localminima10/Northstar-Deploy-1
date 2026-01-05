'use client';

import { useState } from 'react';
import { WizardShell } from '../wizard-shell';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Json } from '@/lib/types/database';

interface BrainDumpStepProps {
  stepId: string;
  initialData: Json;
}

export function BrainDumpStep({ stepId, initialData }: BrainDumpStepProps) {
  const data = initialData as Record<string, unknown>;
  
  const [brainDump, setBrainDump] = useState<string>((data.brain_dump as string) || '');
  const [captureStyle, setCaptureStyle] = useState<string>((data.capture_style as string) || 'brain_dump');

  const formData = {
    brain_dump: brainDump,
    capture_style: captureStyle,
  };

  return (
    <WizardShell
      stepId={stepId}
      initialData={initialData}
      formData={formData}
      canProceed={true}
    >
      <div className="space-y-8">
        {/* Brain Dump */}
        <div className="space-y-3">
          <Label htmlFor="brainDump" className="text-base font-medium">
            Brain dump everything on your mind
          </Label>
          <p className="text-sm text-muted-foreground">
            Tasks, worries, ideas, projects, goals — don&apos;t organize, just unload. One item per line.
          </p>
          <Textarea
            id="brainDump"
            value={brainDump}
            onChange={(e) => setBrainDump(e.target.value)}
            placeholder="- Finish the project proposal
- Call mom about weekend plans
- Learn TypeScript
- Fix the leaky faucet
- Sign up for gym
- Research vacation destinations
..."
            className="min-h-[300px] font-mono text-sm"
            maxLength={10000}
          />
          <p className="text-xs text-muted-foreground text-right">
            {brainDump.split('\n').filter(line => line.trim()).length} items
          </p>
        </div>
        
        {/* Capture Style Preference */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              How do you prefer to capture thoughts going forward?
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              This sets your default quick capture mode.
            </p>
          </div>
          
          <RadioGroup
            value={captureStyle}
            onValueChange={setCaptureStyle}
            className="space-y-3"
          >
            <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer">
              <RadioGroupItem value="brain_dump" id="brain_dump" className="mt-0.5" />
              <div>
                <Label htmlFor="brain_dump" className="font-medium cursor-pointer">
                  Big brain dump
                </Label>
                <p className="text-sm text-muted-foreground">
                  Multi-line textarea for dumping multiple thoughts at once
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer">
              <RadioGroupItem value="single_line" id="single_line" className="mt-0.5" />
              <div>
                <Label htmlFor="single_line" className="font-medium cursor-pointer">
                  Quick single-line capture
                </Label>
                <p className="text-sm text-muted-foreground">
                  Fast, one-thought-at-a-time input field
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-accent/50 cursor-pointer">
              <RadioGroupItem value="voice_to_text" id="voice_to_text" className="mt-0.5" />
              <div>
                <Label htmlFor="voice_to_text" className="font-medium cursor-pointer">
                  Voice-to-text (manual)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Use your device&apos;s dictation feature
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>
      </div>
    </WizardShell>
  );
}

