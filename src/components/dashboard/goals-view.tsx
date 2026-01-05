'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createGoal, updateGoal, deleteGoal } from '@/app/actions/goals';
import { Goal, UserValue, GoalValueLink } from '@/lib/types/database';

interface GoalWithRelations extends Goal {
  projects: { id: string; title: string; status: string }[] | null;
  lead_indicators: { id: string; name: string }[] | null;
  habits: { id: string; name: string }[] | null;
}

interface GoalsViewProps {
  goals: GoalWithRelations[];
  values: Pick<UserValue, 'id' | 'name'>[];
  goalValueLinks: GoalValueLink[];
}

export function GoalsView({ goals, values, goalValueLinks }: GoalsViewProps) {
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalWithRelations | null>(null);
  
  // Form state
  const [title, setTitle] = useState('');
  const [why, setWhy] = useState('');
  const [successDef, setSuccessDef] = useState('');
  const [metricName, setMetricName] = useState('');
  const [baseline, setBaseline] = useState('');
  const [target, setTarget] = useState('');
  const [status, setStatus] = useState<'active' | 'paused' | 'archived'>('active');

  const activeGoals = goals.filter(g => g.status === 'active');
  const otherGoals = goals.filter(g => g.status !== 'active');

  const resetForm = () => {
    setTitle('');
    setWhy('');
    setSuccessDef('');
    setMetricName('');
    setBaseline('');
    setTarget('');
    setStatus('active');
    setEditingGoal(null);
  };

  const openEditDialog = (goal: GoalWithRelations) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setWhy(goal.why || '');
    setSuccessDef(goal.success_definition || '');
    setMetricName(goal.metric_name || '');
    setBaseline(goal.metric_baseline?.toString() || '');
    setTarget(goal.metric_target?.toString() || '');
    setStatus(goal.status);
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    startTransition(async () => {
      const data = {
        title,
        why: why || undefined,
        success_definition: successDef || undefined,
        metric_name: metricName || undefined,
        metric_baseline: baseline ? parseFloat(baseline) : undefined,
        metric_target: target ? parseFloat(target) : undefined,
        status,
      };

      if (editingGoal) {
        await updateGoal(editingGoal.id, data);
      } else {
        await createGoal(data);
      }

      setIsDialogOpen(false);
      resetForm();
    });
  };

  const handleDelete = (goalId: string) => {
    if (!confirm('Are you sure? This will delete the goal and all related projects.')) return;
    startTransition(async () => {
      await deleteGoal(goalId);
    });
  };

  const handleStatusChange = (goalId: string, newStatus: 'active' | 'paused' | 'archived') => {
    startTransition(async () => {
      await updateGoal(goalId, { status: newStatus });
    });
  };

  const getProgress = (goal: Goal) => {
    if (!goal.metric_baseline || !goal.metric_target || !goal.metric_current) return 0;
    const range = goal.metric_target - goal.metric_baseline;
    if (range === 0) return 100;
    const progress = ((goal.metric_current - goal.metric_baseline) / range) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getLinkedValues = (goalId: string) => {
    const links = goalValueLinks.filter(l => l.goal_id === goalId);
    return values.filter(v => links.some(l => l.value_id === v.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Goals</h1>
          <p className="text-muted-foreground">
            {activeGoals.length}/5 active goals
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button disabled={activeGoals.length >= 5}>
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Edit Goal' : 'New Goal'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Goal title" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Why does this matter?</label>
                <Textarea value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Why this goal matters..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Success definition</label>
                <Textarea value={successDef} onChange={(e) => setSuccessDef(e.target.value)} placeholder="How will you know you succeeded?" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Metric</label>
                  <Input value={metricName} onChange={(e) => setMetricName(e.target.value)} placeholder="e.g., weight" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Baseline</label>
                  <Input type="number" value={baseline} onChange={(e) => setBaseline(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target</label>
                  <Input type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
                </div>
              </div>
              {editingGoal && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'paused' | 'archived')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} disabled={isPending || !title.trim()}>
                  {editingGoal ? 'Update' : 'Create'} Goal
                </Button>
                <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Goals */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Goals</h2>
        {activeGoals.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No active goals. Add your first goal!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeGoals.map((goal) => {
              const linkedValues = getLinkedValues(goal.id);
              const progress = getProgress(goal);
              return (
                <Card key={goal.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        {goal.why && (
                          <p className="text-sm text-muted-foreground mt-1">{goal.why}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(goal)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(goal.id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    {goal.metric_name && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{goal.metric_name}</span>
                          <span>{goal.metric_current || goal.metric_baseline} / {goal.metric_target}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                    
                    {/* Values */}
                    {linkedValues.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {linkedValues.map(v => (
                          <Badge key={v.id} variant="outline">{v.name}</Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Related Items */}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{goal.projects?.length || 0} projects</span>
                      <span>{goal.lead_indicators?.length || 0} lead indicators</span>
                      <span>{goal.habits?.length || 0} habits</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Other Goals */}
      {otherGoals.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-muted-foreground">Paused & Archived</h2>
          <div className="grid gap-4">
            {otherGoals.map((goal) => (
              <Card key={goal.id} className="opacity-60">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <Badge variant="secondary">{goal.status}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleStatusChange(goal.id, 'active')}>
                        Reactivate
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(goal.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

