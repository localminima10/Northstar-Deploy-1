'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface SetupIncompleteBannerProps {
  incompleteSteps: { step_id: string; completed: boolean }[];
}

const stepLabels: Record<string, string> = {
  '0': 'Welcome & Baseline',
  '1': 'Brain Dump',
  '2': 'Values',
  '3': 'Identity',
  '4': 'Year Theme',
  '5': 'Life Domains',
  '6': 'Visualization',
  '7': 'Goals',
  '8': 'Lead Indicators',
  '9': 'Projects',
  '10': 'WOOP & If-Then',
  '11': 'Habits',
  '12': 'Cadence',
  '13': 'Preferences',
};

export function SetupIncompleteBanner({ incompleteSteps }: SetupIncompleteBannerProps) {
  if (incompleteSteps.length === 0) return null;
  
  // Find the first incomplete step number
  const firstIncomplete = incompleteSteps
    .map(s => parseInt(s.step_id))
    .filter(n => !isNaN(n))
    .sort((a, b) => a - b)[0];
  
  const stepLabel = firstIncomplete !== undefined 
    ? stepLabels[firstIncomplete.toString()] || `Step ${firstIncomplete}`
    : 'setup';

  return (
    <div className="bg-warning/10 border-b border-warning/20 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-warning text-lg">⚠</span>
        <p className="text-sm text-warning-foreground">
          <span className="font-medium">Setup incomplete:</span>{' '}
          {incompleteSteps.length} step{incompleteSteps.length > 1 ? 's' : ''} remaining
        </p>
      </div>
      <Button asChild size="sm" variant="outline" className="border-warning/30 hover:bg-warning/10">
        <Link href={`/wizard/${firstIncomplete ?? 0}`}>
          Continue {stepLabel}
        </Link>
      </Button>
    </div>
  );
}

