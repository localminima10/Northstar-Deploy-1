'use client';

import { useState } from 'react';
import { WizardShell } from '../wizard-shell';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Json } from '@/lib/types/database';

interface IdentityStepProps {
  stepId: string;
  initialData: Json;
}

export function IdentityStep({ stepId, initialData }: IdentityStepProps) {
  const data = initialData as Record<string, unknown>;
  
  const [statements, setStatements] = useState<string[]>(
    (data.statements as string[]) || ['', '', '']
  );
  const [nonNegotiables, setNonNegotiables] = useState<string>(
    (data.non_negotiables as string) || ''
  );

  const updateStatement = (index: number, value: string) => {
    const newStatements = [...statements];
    newStatements[index] = value;
    setStatements(newStatements);
  };

  const addStatement = () => {
    if (statements.length < 7) {
      setStatements([...statements, '']);
    }
  };

  const removeStatement = (index: number) => {
    if (statements.length > 3) {
      setStatements(statements.filter((_, i) => i !== index));
    }
  };

  const formData = {
    statements: statements.filter(s => s.trim()),
    non_negotiables: nonNegotiables,
  };

  const filledStatements = statements.filter(s => s.trim()).length;
  const canProceed = filledStatements >= 3;

  return (
    <WizardShell
      stepId={stepId}
      initialData={initialData}
      formData={formData}
      canProceed={canProceed}
    >
      <div className="space-y-8">
        {/* Identity Statements */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              Write 3-7 identity statements (who you are becoming)
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Start with: &quot;I am the kind of person who…&quot;
            </p>
          </div>
          
          <div className="space-y-3">
            {statements.map((statement, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    value={statement}
                    onChange={(e) => updateStatement(index, e.target.value)}
                    placeholder={`I am the kind of person who ${
                      index === 0 ? 'keeps promises to myself' :
                      index === 1 ? 'shows up every day' :
                      index === 2 ? 'embraces discomfort for growth' :
                      '...'
                    }`}
                    className="w-full"
                  />
                </div>
                {statements.length > 3 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStatement(index)}
                    className="text-destructive shrink-0"
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {statements.length < 7 && (
            <Button variant="outline" size="sm" onClick={addStatement}>
              + Add statement
            </Button>
          )}
          
          <p className="text-sm text-muted-foreground">
            {filledStatements}/7 statements
            {filledStatements < 3 && ' (minimum 3)'}
          </p>
        </div>

        {/* Non-negotiables */}
        <div className="space-y-3">
          <Label htmlFor="nonNegotiables" className="text-base font-medium">
            What are your non-negotiables (minimum standards) for 2026?
          </Label>
          <p className="text-sm text-muted-foreground">
            Examples: 7h sleep, exercise 3x/week, weekly review, no doomscrolling in bed.
          </p>
          <Textarea
            id="nonNegotiables"
            value={nonNegotiables}
            onChange={(e) => setNonNegotiables(e.target.value)}
            placeholder="My non-negotiables are:
- 7 hours of sleep minimum
- Move my body every day
- No phone in the first hour of waking
- Weekly review on Sundays"
            className="min-h-[150px]"
            maxLength={800}
          />
        </div>
      </div>
    </WizardShell>
  );
}

