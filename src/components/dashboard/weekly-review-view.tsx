'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { saveWeeklyReview } from '@/app/actions/checkins';
import { WeeklyReview, LeadIndicator } from '@/lib/types/database';

interface ProjectWithTasks {
  id: string;
  title: string;
  tasks: { id: string; is_next_action: boolean; status: string }[] | null;
}

interface WeeklyReviewViewProps {
  weeklyReview: WeeklyReview | null;
  weekStart: string;
  inboxCount: number;
  projectsNeedingAction: ProjectWithTasks[];
  leadIndicators: Pick<LeadIndicator, 'id' | 'name' | 'weekly_target'>[];
}

export function WeeklyReviewView({
  weeklyReview,
  weekStart,
  inboxCount,
  projectsNeedingAction,
  leadIndicators,
}: WeeklyReviewViewProps) {
  const [isPending, startTransition] = useTransition();
  
  const [notes, setNotes] = useState(weeklyReview?.notes || '');
  const [inboxProcessed, setInboxProcessed] = useState(weeklyReview?.inbox_processed || false);
  const [projectsChecked, setProjectsChecked] = useState(weeklyReview?.projects_checked || false);
  const [indicatorsReviewed, setIndicatorsReviewed] = useState(weeklyReview?.lead_indicators_reviewed || false);
  const [visionRefreshed, setVisionRefreshed] = useState(weeklyReview?.vision_refreshed || false);

  const checklist = [
    { id: 'inbox', label: 'Process inbox', checked: inboxProcessed, setter: setInboxProcessed },
    { id: 'projects', label: 'Review projects & next actions', checked: projectsChecked, setter: setProjectsChecked },
    { id: 'indicators', label: 'Review lead indicators', checked: indicatorsReviewed, setter: setIndicatorsReviewed },
    { id: 'vision', label: 'Refresh vision mode', checked: visionRefreshed, setter: setVisionRefreshed },
  ];
  
  const completedCount = checklist.filter(item => item.checked).length;
  const progress = (completedCount / checklist.length) * 100;

  const handleSave = () => {
    startTransition(async () => {
      await saveWeeklyReview({
        notes,
        inbox_processed: inboxProcessed,
        projects_checked: projectsChecked,
        lead_indicators_reviewed: indicatorsReviewed,
        vision_refreshed: visionRefreshed,
      });
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Weekly Review</h1>
        <p className="text-muted-foreground">
          Week of {new Date(weekStart).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric',
            year: 'numeric'
          })}
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Review Progress</span>
            <span className="text-sm text-muted-foreground">{completedCount}/{checklist.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Review Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {checklist.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  item.checked ? 'bg-success/10 border-success/30' : 'border-border'
                }`}
              >
                <Checkbox
                  checked={item.checked}
                  onCheckedChange={(checked) => item.setter(!!checked)}
                />
                <span className={item.checked ? 'line-through text-muted-foreground' : ''}>
                  {item.label}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Warnings */}
        <div className="space-y-4">
          {/* Inbox Warning */}
          {inboxCount > 0 && (
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-warning-foreground">
                      Inbox has {inboxCount} unprocessed items
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Process these before completing your review
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/inbox">Process Inbox</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects Warning */}
          {projectsNeedingAction.length > 0 && (
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="pt-6">
                <p className="font-medium text-warning-foreground mb-3">
                  {projectsNeedingAction.length} project(s) need next actions
                </p>
                <ul className="space-y-2 text-sm">
                  {projectsNeedingAction.slice(0, 5).map((project) => (
                    <li key={project.id} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">No next action</Badge>
                      <span>{project.title}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href="/projects">Fix Projects</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Lead Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lead Indicators This Week</CardTitle>
            </CardHeader>
            <CardContent>
              {leadIndicators.length === 0 ? (
                <p className="text-sm text-muted-foreground">No lead indicators defined.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {leadIndicators.map((indicator) => (
                    <li key={indicator.id} className="flex items-center justify-between">
                      <span>{indicator.name}</span>
                      <Badge variant="secondary">Target: {indicator.weekly_target}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Review Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Reflect on your week. What went well? What needs adjustment?"
            className="min-h-[150px]"
          />
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Review'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

