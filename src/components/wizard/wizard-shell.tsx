'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WIZARD_STEPS, TOTAL_STEPS } from '@/lib/wizard-config';
import { saveWizardProgress, saveStepData } from '@/app/actions/wizard';
import { Json } from '@/lib/types/database';

interface WizardShellProps {
  stepId: string;
  initialData?: Json;
  children: React.ReactNode;
  onDataChange?: (data: Record<string, unknown>) => void;
  formData?: Record<string, unknown>;
  canProceed?: boolean;
  skipable?: boolean;
}

export function WizardShell({
  stepId,
  initialData,
  children,
  formData = {},
  canProceed = true,
  skipable = true,
}: WizardShellProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const stepIndex = parseInt(stepId);
  const step = WIZARD_STEPS[stepIndex];
  const progress = ((stepIndex + 1) / TOTAL_STEPS) * 100;
  
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === TOTAL_STEPS - 1;
  
  // Debounced autosave
  useEffect(() => {
    if (Object.keys(formData).length === 0) return;
    
    const timeout = setTimeout(async () => {
      setIsSaving(true);
      await saveWizardProgress(stepId, formData as Json, false);
      setLastSaved(new Date());
      setIsSaving(false);
    }, 1000);
    
    return () => clearTimeout(timeout);
  }, [formData, stepId]);
  
  const handleNext = useCallback(async () => {
    startTransition(async () => {
      // Save step data to appropriate tables
      await saveStepData(stepId, formData);
      
      // Mark step as complete
      await saveWizardProgress(stepId, formData as Json, true);
      
      // Navigate to next step
      if (!isLastStep) {
        router.push(`/wizard/${stepIndex + 1}`);
      }
    });
  }, [formData, stepId, stepIndex, isLastStep, router]);
  
  const handleSkip = useCallback(async () => {
    startTransition(async () => {
      // Save current progress but mark as incomplete
      await saveWizardProgress(stepId, formData as Json, false);
      
      // Navigate to next step
      if (!isLastStep) {
        router.push(`/wizard/${stepIndex + 1}`);
      }
    });
  }, [formData, stepId, stepIndex, isLastStep, router]);
  
  const handlePrevious = useCallback(() => {
    if (!isFirstStep) {
      router.push(`/wizard/${stepIndex - 1}`);
    }
  }, [stepIndex, isFirstStep, router]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="text-xl font-semibold text-primary">
              Northstar
            </Link>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {isSaving && <span className="animate-pulse">Saving...</span>}
              {lastSaved && !isSaving && (
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              )}
              <span className="font-medium">
                Step {stepIndex + 1} of {TOTAL_STEPS}
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      </header>
      
      {/* Content */}
      <main className="flex-1 container max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {step?.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {step?.description}
          </p>
          {step?.estimatedMinutes && (
            <p className="text-sm text-muted-foreground/70 mt-1">
              ~{step.estimatedMinutes} minutes
            </p>
          )}
        </div>
        
        <div className="space-y-8">
          {children}
        </div>
      </main>
      
      {/* Footer navigation */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm sticky bottom-0">
        <div className="container max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handlePrevious}
              disabled={isFirstStep || isPending}
            >
              ← Previous
            </Button>
            
            <div className="flex items-center gap-3">
              {skipable && !isLastStep && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={isPending}
                  className="text-muted-foreground"
                >
                  Skip for now
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={!canProceed || isPending}
              >
                {isPending ? 'Saving...' : isLastStep ? 'Finish Setup' : 'Continue →'}
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

