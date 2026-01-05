'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { saveWeeklyReview } from '@/app/actions/reviews';
import { toast } from 'sonner';
import type { WeeklyReview as WeeklyReviewType, LeadIndicator, LifeDomain, Goal } from '@/lib/types/database';

interface LeadIndicatorWithGoal extends LeadIndicator {
  goal: { id: string; title: string } | null;
}

interface ProjectNeedingAction {
  id: string;
  title: string;
}

interface WeeklyReviewProps {
  currentReview: WeeklyReviewType | null;
  inboxCount: number;
  projectsNeedingNextAction: ProjectNeedingAction[];
  leadIndicators: LeadIndicatorWithGoal[];
  lifeDomains: LifeDomain[];
  weekStart: string;
  timezone: string;
}

export function WeeklyReview({
  currentReview,
  inboxCount,
  projectsNeedingNextAction,
  leadIndicators,
  lifeDomains,
}: WeeklyReviewProps) {
  const [isPending, startTransition] = useTransition();
  
  const [inboxProcessed, setInboxProcessed] = useState(currentReview?.inbox_processed || false);
  const [projectsChecked, setProjectsChecked] = useState(currentReview?.projects_checked || false);
  const [leadIndicatorsReviewed, setLeadIndicatorsReviewed] = useState(currentReview?.lead_indicators_reviewed || false);
  const [visionRefreshed, setVisionRefreshed] = useState(currentReview?.vision_refreshed || false);
  const [notes, setNotes] = useState(currentReview?.notes || '');
  
  const checklistItems = [
    { key: 'inbox', label: 'Process Inbox', checked: inboxProcessed, setChecked: setInboxProcessed },
    { key: 'projects', label: 'Review Projects & Next Actions', checked: projectsChecked, setChecked: setProjectsChecked },
    { key: 'indicators', label: 'Review Lead Indicators', checked: leadIndicatorsReviewed, setChecked: setLeadIndicatorsReviewed },
    { key: 'vision', label: 'Refresh Vision', checked: visionRefreshed, setChecked: setVisionRefreshed },
  ];
  
  const completedCount = checklistItems.filter(item => item.checked).length;
  const progress = (completedCount / checklistItems.length) * 100;
  
  const handleSave = () => {
    startTransition(async () => {
      const result = await saveWeeklyReview({
        inbox_processed: inboxProcessed,
        projects_checked: projectsChecked,
        lead_indicators_reviewed: leadIndicatorsReviewed,
        vision_refreshed: visionRefreshed,
        notes: notes || undefined,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Review saved!');
      }
    });
  };
  
  // Get lowest satisfaction domains for focus
  const lowestDomains = lifeDomains.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="font-medium">Review Progress</p>
            <p className="text-sm text-muted-foreground">
              {completedCount}/{checklistItems.length} complete
            </p>
          </div>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Checklist */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Review Checklist</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Inbox */}
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <Checkbox
                  checked={inboxProcessed}
                  onCheckedChange={(checked) => setInboxProcessed(!!checked)}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={inboxProcessed ? 'line-through text-muted-foreground' : 'font-medium'}>
                      Process Inbox
                    </p>
                    {inboxCount > 0 ? (
                      <Badge variant="secondary">{inboxCount} items</Badge>
                    ) : (
                      <Badge variant="outline" className="text-success">Zero!</Badge>
                    )}
                  </div>
                  <Link href="/inbox" className="text-sm text-primary hover:underline">
                    Go to Inbox →
                  </Link>
                </div>
              </div>
              
              {/* Projects */}
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <Checkbox
                  checked={projectsChecked}
                  onCheckedChange={(checked) => setProjectsChecked(!!checked)}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={projectsChecked ? 'line-through text-muted-foreground' : 'font-medium'}>
                      Review Projects & Next Actions
                    </p>
                    {projectsNeedingNextAction.length > 0 ? (
                      <Badge variant="destructive">{projectsNeedingNextAction.length} need action</Badge>
                    ) : (
                      <Badge variant="outline" className="text-success">All set!</Badge>
                    )}
                  </div>
                  {projectsNeedingNextAction.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {projectsNeedingNextAction.map(p => p.title).join(', ')}
                    </p>
                  )}
                  <Link href="/projects" className="text-sm text-primary hover:underline">
                    Go to Projects →
                  </Link>
                </div>
              </div>
              
              {/* Lead Indicators */}
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <Checkbox
                  checked={leadIndicatorsReviewed}
                  onCheckedChange={(checked) => setLeadIndicatorsReviewed(!!checked)}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className={leadIndicatorsReviewed ? 'line-through text-muted-foreground' : 'font-medium'}>
                      Review Lead Indicators
                    </p>
                    <Badge variant="secondary">{leadIndicators.length} indicators</Badge>
                  </div>
                  <Link href="/goals" className="text-sm text-primary hover:underline">
                    Go to Goals →
                  </Link>
                </div>
              </div>
              
              {/* Vision */}
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                <Checkbox
                  checked={visionRefreshed}
                  onCheckedChange={(checked) => setVisionRefreshed(!!checked)}
                />
                <div className="flex-1">
                  <p className={visionRefreshed ? 'line-through text-muted-foreground' : 'font-medium'}>
                    Refresh Vision
                  </p>
                  <Link href="/vision" className="text-sm text-primary hover:underline">
                    Go to Vision →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Notes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Weekly Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reflections, insights, adjustments for next week..."
                rows={4}
              />
            </CardContent>
          </Card>
          
          <Button 
            onClick={handleSave} 
            disabled={isPending}
            className="w-full"
            size="lg"
          >
            {isPending ? 'Saving...' : 'Save Weekly Review'}
          </Button>
        </div>
        
        {/* Right Column: Insights */}
        <div className="space-y-4">
          {/* Lead Indicators Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Lead Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              {leadIndicators.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No lead indicators set up yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {leadIndicators.map((indicator) => (
                    <div key={indicator.id} className="flex items-center justify-between p-2 rounded bg-muted/30">
                      <div>
                        <p className="font-medium text-sm">{indicator.name}</p>
                        {indicator.goal && (
                          <p className="text-xs text-muted-foreground">{indicator.goal.title}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">0/{indicator.weekly_target}</p>
                        <p className="text-xs text-muted-foreground">this week</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Life Domains Focus */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Areas Needing Attention</CardTitle>
            </CardHeader>
            <CardContent>
              {lifeDomains.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-4">
                  No life domains set up yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {lowestDomains.map((domain) => (
                    <div key={domain.id} className="p-3 rounded bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{domain.name}</p>
                        <Badge 
                          variant={domain.satisfaction_score < 5 ? 'destructive' : 'secondary'}
                        >
                          {domain.satisfaction_score}/10
                        </Badge>
                      </div>
                      <Progress value={domain.satisfaction_score * 10} className="h-2" />
                      {domain.plus_two_definition && (
                        <p className="text-xs text-muted-foreground mt-2">
                          +2: {domain.plus_two_definition}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <Link 
                href="/settings" 
                className="text-sm text-primary hover:underline block mt-4 text-center"
              >
                Manage Life Domains →
              </Link>
            </CardContent>
          </Card>
          
          {/* Quick Tips */}
          <Card className="bg-accent/5 border-accent/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Review Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>✓ Clear your inbox completely - don't leave anything unprocessed</p>
              <p>✓ Every active project should have a clear next action</p>
              <p>✓ Look at your lead indicators - are you doing the behaviors?</p>
              <p>✓ Spend 2-3 minutes with your vision to reconnect with your why</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

