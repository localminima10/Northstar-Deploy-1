'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { createGoal, updateGoal, deleteGoal } from '@/app/actions/goals';
import { toast } from 'sonner';
import type { Goal, UserValue, GoalValueLink, Project, LeadIndicator, Habit } from '@/lib/types/database';

interface GoalWithRelations extends Goal {
  projects: Pick<Project, 'id' | 'title' | 'status'>[];
  lead_indicators: Pick<LeadIndicator, 'id' | 'name'>[];
  habits: Pick<Habit, 'id' | 'name'>[];
}

interface GoalsListProps {
  goals: GoalWithRelations[];
  values: UserValue[];
  goalValueLinks: GoalValueLink[];
}

export function GoalsList({ goals, values, goalValueLinks }: GoalsListProps) {
  const [isPending, startTransition] = useTransition();
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalWithRelations | null>(null);
  
  const activeGoals = goals.filter(g => g.status === 'active');
  const pausedGoals = goals.filter(g => g.status === 'paused');
  const archivedGoals = goals.filter(g => g.status === 'archived');
  
  const getLinkedValues = (goalId: string) => {
    const linkedIds = goalValueLinks.filter(l => l.goal_id === goalId).map(l => l.value_id);
    return values.filter(v => linkedIds.includes(v.id));
  };
  
  const calculateProgress = (goal: Goal) => {
    if (!goal.metric_baseline || !goal.metric_target || !goal.metric_current) return null;
    const total = goal.metric_target - goal.metric_baseline;
    if (total === 0) return 100;
    const progress = ((goal.metric_current - goal.metric_baseline) / total) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active Goals</p>
          <p className="text-2xl font-bold text-primary">{activeGoals.length}/5</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Paused</p>
          <p className="text-2xl font-bold text-warning">{pausedGoals.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Archived</p>
          <p className="text-2xl font-bold text-muted-foreground">{archivedGoals.length}</p>
        </Card>
      </div>
      
      {/* Add New Goal */}
      <Dialog open={showNewGoal} onOpenChange={setShowNewGoal}>
        <DialogTrigger asChild>
          <Button 
            disabled={activeGoals.length >= 5}
            className="w-full"
          >
            {activeGoals.length >= 5 ? 'Maximum 5 Active Goals Reached' : '+ Add New Goal'}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>
          <GoalForm
            values={values}
            onSubmit={async (data) => {
              startTransition(async () => {
                const result = await createGoal(data);
                if (result.error) {
                  toast.error(result.error);
                } else {
                  toast.success('Goal created!');
                  setShowNewGoal(false);
                }
              });
            }}
            isPending={isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Goals Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active ({activeGoals.length})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({pausedGoals.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archivedGoals.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4 mt-4">
          {activeGoals.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No active goals yet. Create your first goal!</p>
            </Card>
          ) : (
            activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                linkedValues={getLinkedValues(goal.id)}
                progress={calculateProgress(goal)}
                onEdit={() => setEditingGoal(goal)}
                onStatusChange={(status) => {
                  startTransition(async () => {
                    const result = await updateGoal(goal.id, { status });
                    if (result.error) {
                      toast.error(result.error);
                    } else {
                      toast.success(`Goal ${status}`);
                    }
                  });
                }}
                onDelete={() => {
                  startTransition(async () => {
                    const result = await deleteGoal(goal.id);
                    if (result.error) {
                      toast.error(result.error);
                    } else {
                      toast.success('Goal deleted');
                    }
                  });
                }}
                isPending={isPending}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="paused" className="space-y-4 mt-4">
          {pausedGoals.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No paused goals.</p>
            </Card>
          ) : (
            pausedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                linkedValues={getLinkedValues(goal.id)}
                progress={calculateProgress(goal)}
                onEdit={() => setEditingGoal(goal)}
                onStatusChange={(status) => {
                  startTransition(async () => {
                    const result = await updateGoal(goal.id, { status });
                    if (result.error) {
                      toast.error(result.error);
                    }
                  });
                }}
                onDelete={() => {
                  startTransition(async () => {
                    await deleteGoal(goal.id);
                  });
                }}
                isPending={isPending}
              />
            ))
          )}
        </TabsContent>
        
        <TabsContent value="archived" className="space-y-4 mt-4">
          {archivedGoals.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No archived goals.</p>
            </Card>
          ) : (
            archivedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                linkedValues={getLinkedValues(goal.id)}
                progress={calculateProgress(goal)}
                onEdit={() => setEditingGoal(goal)}
                onStatusChange={(status) => {
                  startTransition(async () => {
                    const result = await updateGoal(goal.id, { status });
                    if (result.error) {
                      toast.error(result.error);
                    }
                  });
                }}
                onDelete={() => {
                  startTransition(async () => {
                    await deleteGoal(goal.id);
                  });
                }}
                isPending={isPending}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
      
      {/* Edit Goal Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={(open) => !open && setEditingGoal(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          {editingGoal && (
            <GoalForm
              goal={editingGoal}
              values={values}
              linkedValueIds={goalValueLinks.filter(l => l.goal_id === editingGoal.id).map(l => l.value_id)}
              onSubmit={async (data) => {
                startTransition(async () => {
                  const result = await updateGoal(editingGoal.id, data);
                  if (result.error) {
                    toast.error(result.error);
                  } else {
                    toast.success('Goal updated');
                    setEditingGoal(null);
                  }
                });
              }}
              isPending={isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface GoalCardProps {
  goal: GoalWithRelations;
  linkedValues: UserValue[];
  progress: number | null;
  onEdit: () => void;
  onStatusChange: (status: 'active' | 'paused' | 'archived') => void;
  onDelete: () => void;
  isPending: boolean;
}

function GoalCard({ goal, linkedValues, progress, onEdit, onStatusChange, onDelete, isPending }: GoalCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{goal.title}</CardTitle>
            {goal.why && (
              <p className="text-muted-foreground mt-1 text-sm">{goal.why}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit} disabled={isPending}>
              Edit
            </Button>
            <Select
              value={goal.status}
              onValueChange={(value) => onStatusChange(value as 'active' | 'paused' | 'archived')}
              disabled={isPending}
            >
              <SelectTrigger className="w-[110px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Values */}
        {linkedValues.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {linkedValues.map((value) => (
              <Badge key={value.id} variant="secondary" className="text-xs">
                {value.name}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Metric Progress */}
        {progress !== null && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">{goal.metric_name}</span>
              <span className="font-medium">
                {goal.metric_current} / {goal.metric_target}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
        
        {/* Scores */}
        <div className="flex gap-4 text-sm">
          {goal.confidence_score !== null && (
            <div>
              <span className="text-muted-foreground">Confidence: </span>
              <span className="font-medium">{goal.confidence_score}/10</span>
            </div>
          )}
          {goal.motivation_score !== null && (
            <div>
              <span className="text-muted-foreground">Motivation: </span>
              <span className="font-medium">{goal.motivation_score}/10</span>
            </div>
          )}
        </div>
        
        {/* Related Items */}
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground pt-2 border-t">
          <span>{goal.projects?.length || 0} projects</span>
          <span>{goal.lead_indicators?.length || 0} lead indicators</span>
          <span>{goal.habits?.length || 0} habits</span>
        </div>
        
        {/* Delete */}
        <div className="pt-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive"
            onClick={onDelete}
            disabled={isPending}
          >
            Delete Goal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface GoalFormProps {
  goal?: GoalWithRelations;
  values: UserValue[];
  linkedValueIds?: string[];
  onSubmit: (data: {
    title: string;
    why?: string;
    success_definition?: string;
    metric_name?: string;
    metric_baseline?: number;
    metric_target?: number;
    metric_current?: number;
    confidence_score?: number;
    motivation_score?: number;
    approach_phrase?: string;
    value_ids?: string[];
  }) => void;
  isPending: boolean;
}

function GoalForm({ goal, values, linkedValueIds = [], onSubmit, isPending }: GoalFormProps) {
  const [title, setTitle] = useState(goal?.title || '');
  const [why, setWhy] = useState(goal?.why || '');
  const [successDefinition, setSuccessDefinition] = useState(goal?.success_definition || '');
  const [metricName, setMetricName] = useState(goal?.metric_name || '');
  const [metricBaseline, setMetricBaseline] = useState(goal?.metric_baseline?.toString() || '');
  const [metricTarget, setMetricTarget] = useState(goal?.metric_target?.toString() || '');
  const [metricCurrent, setMetricCurrent] = useState(goal?.metric_current?.toString() || '');
  const [confidenceScore, setConfidenceScore] = useState(goal?.confidence_score?.toString() || '');
  const [motivationScore, setMotivationScore] = useState(goal?.motivation_score?.toString() || '');
  const [approachPhrase, setApproachPhrase] = useState(goal?.approach_phrase || '');
  const [selectedValues, setSelectedValues] = useState<string[]>(linkedValueIds);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      why: why || undefined,
      success_definition: successDefinition || undefined,
      metric_name: metricName || undefined,
      metric_baseline: metricBaseline ? parseFloat(metricBaseline) : undefined,
      metric_target: metricTarget ? parseFloat(metricTarget) : undefined,
      metric_current: metricCurrent ? parseFloat(metricCurrent) : undefined,
      confidence_score: confidenceScore ? parseInt(confidenceScore) : undefined,
      motivation_score: motivationScore ? parseInt(motivationScore) : undefined,
      approach_phrase: approachPhrase || undefined,
      value_ids: selectedValues,
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Goal Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Run a marathon"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="why">Why is this important?</Label>
        <Textarea
          id="why"
          value={why}
          onChange={(e) => setWhy(e.target.value)}
          placeholder="What drives you toward this goal?"
          rows={2}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="success">How will you know you've succeeded?</Label>
        <Textarea
          id="success"
          value={successDefinition}
          onChange={(e) => setSuccessDefinition(e.target.value)}
          placeholder="Define success criteria"
          rows={2}
        />
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="metricName">Metric Name</Label>
          <Input
            id="metricName"
            value={metricName}
            onChange={(e) => setMetricName(e.target.value)}
            placeholder="e.g., Miles run per week"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="metricCurrent">Current Value</Label>
          <Input
            id="metricCurrent"
            type="number"
            value={metricCurrent}
            onChange={(e) => setMetricCurrent(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="metricBaseline">Baseline</Label>
          <Input
            id="metricBaseline"
            type="number"
            value={metricBaseline}
            onChange={(e) => setMetricBaseline(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="metricTarget">Target</Label>
          <Input
            id="metricTarget"
            type="number"
            value={metricTarget}
            onChange={(e) => setMetricTarget(e.target.value)}
          />
        </div>
      </div>
      
      {/* Scores */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="confidence">Confidence (1-10)</Label>
          <Input
            id="confidence"
            type="number"
            min="1"
            max="10"
            value={confidenceScore}
            onChange={(e) => setConfidenceScore(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="motivation">Motivation (1-10)</Label>
          <Input
            id="motivation"
            type="number"
            min="1"
            max="10"
            value={motivationScore}
            onChange={(e) => setMotivationScore(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="approach">Approach Phrase</Label>
        <Input
          id="approach"
          value={approachPhrase}
          onChange={(e) => setApproachPhrase(e.target.value)}
          placeholder="e.g., I am becoming someone who..."
        />
      </div>
      
      {/* Values */}
      {values.length > 0 && (
        <div className="space-y-2">
          <Label>Linked Values</Label>
          <div className="flex flex-wrap gap-2">
            {values.map((value) => (
              <label 
                key={value.id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={selectedValues.includes(value.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedValues([...selectedValues, value.id]);
                    } else {
                      setSelectedValues(selectedValues.filter(id => id !== value.id));
                    }
                  }}
                />
                <span className="text-sm">{value.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}
      
      <Button type="submit" disabled={isPending || !title.trim()} className="w-full">
        {isPending ? 'Saving...' : goal ? 'Update Goal' : 'Create Goal'}
      </Button>
    </form>
  );
}

