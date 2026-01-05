'use client';

import { useState } from 'react';
import { WizardShell } from '../wizard-shell';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Json } from '@/lib/types/database';

interface YearThemeStepProps {
  stepId: string;
  initialData: Json;
}

export function YearThemeStep({ stepId, initialData }: YearThemeStepProps) {
  const data = initialData as Record<string, unknown>;
  const currentYear = new Date().getFullYear();
  
  const [theme, setTheme] = useState<string>((data.theme as string) || '');
  const [missionStatement, setMissionStatement] = useState<string>(
    (data.mission_statement as string) || ''
  );
  const [definitionOfWin, setDefinitionOfWin] = useState<string>(
    (data.definition_of_win as string) || ''
  );

  const formData = {
    theme,
    mission_statement: missionStatement,
    definition_of_win: definitionOfWin,
  };

  const canProceed = theme.trim().length > 0;

  return (
    <WizardShell
      stepId={stepId}
      initialData={initialData}
      formData={formData}
      canProceed={canProceed}
    >
      <div className="space-y-8">
        {/* Year Theme */}
        <div className="space-y-3">
          <Label htmlFor="theme" className="text-base font-medium">
            If {currentYear} had ONE theme, what would it be?
          </Label>
          <p className="text-sm text-muted-foreground">
            Examples: &quot;Consistency&quot;, &quot;Build&quot;, &quot;Peace + Power&quot;, &quot;Momentum&quot;, &quot;Foundation&quot;
          </p>
          <Input
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="My year theme is..."
            maxLength={80}
            className="text-lg"
          />
        </div>

        {/* Mission Statement */}
        <div className="space-y-3">
          <Label htmlFor="missionStatement" className="text-base font-medium">
            Write your mission for {currentYear} (1-3 sentences)
          </Label>
          <p className="text-sm text-muted-foreground">
            Keep it simple and motivating. This is your north star.
          </p>
          <Textarea
            id="missionStatement"
            value={missionStatement}
            onChange={(e) => setMissionStatement(e.target.value)}
            placeholder="This year, I will..."
            className="min-h-[100px]"
            maxLength={400}
          />
        </div>

        {/* Definition of Win */}
        <div className="space-y-3">
          <Label htmlFor="definitionOfWin" className="text-base font-medium">
            At the end of {currentYear}, what would make you say: &quot;This year was a win&quot;?
          </Label>
          <p className="text-sm text-muted-foreground">
            Be specific. What outcomes or feelings would define success?
          </p>
          <Textarea
            id="definitionOfWin"
            value={definitionOfWin}
            onChange={(e) => setDefinitionOfWin(e.target.value)}
            placeholder="This year is a win if:
- I've shipped [X project]
- I've built the habit of [Y]
- I feel [Z] most days
- My relationships with [A] are stronger"
            className="min-h-[150px]"
            maxLength={600}
          />
        </div>
      </div>
    </WizardShell>
  );
}

