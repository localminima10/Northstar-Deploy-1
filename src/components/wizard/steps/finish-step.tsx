'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { completeOnboarding } from '@/app/actions/wizard';
import { WIZARD_STEPS } from '@/lib/wizard-config';
import { Goal, WizardProgress, Json } from '@/lib/types/database';

interface FinishStepProps {
  stepId: string;
  allProgress: WizardProgress[];
  goals: Goal[];
}

export function FinishStep({ stepId, allProgress, goals }: FinishStepProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // Calculate completion status
  const completedSteps = allProgress.filter(p => p.completed).length;
  const totalSteps = WIZARD_STEPS.length - 1; // Exclude finish step
  const completionPercent = Math.round((completedSteps / totalSteps) * 100);
  
  // Find incomplete steps
  const incompleteSteps = WIZARD_STEPS.slice(0, -1).filter(step => {
    const progress = allProgress.find(p => p.step_id === step.id);
    return !progress?.completed;
  });

  // Extract summary data from wizard progress
  const getStepPayload = (stepId: string): Record<string, unknown> => {
    const progress = allProgress.find(p => p.step_id === stepId);
    return (progress?.payload as Record<string, unknown>) || {};
  };

  const yearThemeData = getStepPayload('4');
  const yearTheme: string | null = typeof yearThemeData.theme === 'string' ? yearThemeData.theme : null;
  const missionStatement: string | null = typeof yearThemeData.mission_statement === 'string' ? yearThemeData.mission_statement : null;
  
  const valuesData = getStepPayload('2');
  const values = Array.isArray(valuesData.values) 
    ? (valuesData.values as { name: string }[]) 
    : [];

  const handleFinish = () => {
    startTransition(async () => {
      const result = await completeOnboarding();
      if (result?.error) {
        alert(result.error);
      }
    });
  };

  const handleGoToStep = (stepId: string) => {
    router.push(`/wizard/${stepId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-primary">Northstar</h1>
            <span className="text-sm text-muted-foreground font-medium">
              Setup Complete
            </span>
          </div>
          <Progress value={100} className="h-1" />
        </div>
      </header>
      
      {/* Content */}
      <main className="flex-1 container max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            You&apos;re ready to launch!
          </h1>
          <p className="text-lg text-muted-foreground">
            Review your setup below and start your journey.
          </p>
        </div>

        {/* Completion Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Setup Progress</span>
              <Badge variant={completionPercent === 100 ? 'default' : 'secondary'}>
                {completionPercent}% complete
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={completionPercent} className="h-2 mb-4" />
            
            {incompleteSteps.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Incomplete steps:</p>
                <div className="flex flex-wrap gap-2">
                  {incompleteSteps.map(step => (
                    <Button
                      key={step.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleGoToStep(step.id)}
                    >
                      {step.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Sections */}
        <div className="grid gap-6">
          {/* Year Theme */}
          {yearTheme && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Year Theme & Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-primary mb-2">
                  {yearTheme}
                </p>
                {missionStatement && (
                  <p className="text-muted-foreground">
                    {missionStatement}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Values */}
          {values.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Core Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {values.slice(0, 5).map((value, i) => (
                    <Badge key={i} variant="secondary" className="text-sm">
                      {i + 1}. {value.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Goals */}
          {goals.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Goals ({goals.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {goals.map((goal, i) => (
                    <div key={goal.id} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-medium">{goal.title}</p>
                        {goal.metric_name && (
                          <p className="text-sm text-muted-foreground">
                            {goal.metric_baseline} → {goal.metric_target} {goal.metric_name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-primary">{goals.length}</p>
                <p className="text-sm text-muted-foreground">Goals</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-primary">{values.length}</p>
                <p className="text-sm text-muted-foreground">Values</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-primary">{completedSteps}</p>
                <p className="text-sm text-muted-foreground">Steps Done</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-primary">{incompleteSteps.length}</p>
                <p className="text-sm text-muted-foreground">To Complete</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Launch Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={handleFinish}
            disabled={isPending || goals.length === 0}
            className="min-w-[200px]"
          >
            {isPending ? 'Launching...' : 'Launch Today Dashboard'}
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/wizard/6')}
            className="min-w-[200px]"
          >
            Go to Vision Mode
          </Button>
        </div>

        {goals.length === 0 && (
          <p className="text-center text-sm text-warning mt-4">
            You need at least one goal to complete setup.{' '}
            <Button variant="link" className="p-0 h-auto" onClick={() => handleGoToStep('7')}>
              Add a goal
            </Button>
          </p>
        )}
      </main>
    </div>
  );
}

