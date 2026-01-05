'use client';

import { useState } from 'react';
import { WizardShell } from '../wizard-shell';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserValue, Json } from '@/lib/types/database';

interface GoalItem {
  title: string;
  why: string;
  success_definition: string;
  metric_name: string;
  metric_baseline: number | null;
  metric_target: number | null;
  confidence_score: number;
  motivation_score: number;
  approach_phrase: string;
  value_ids: string[];
}

interface GoalsStepProps {
  stepId: string;
  initialData: Json;
  userValues: UserValue[];
}

const emptyGoal: GoalItem = {
  title: '',
  why: '',
  success_definition: '',
  metric_name: '',
  metric_baseline: null,
  metric_target: null,
  confidence_score: 5,
  motivation_score: 5,
  approach_phrase: '',
  value_ids: [],
};

export function GoalsStep({ stepId, initialData, userValues }: GoalsStepProps) {
  const data = initialData as Record<string, unknown>;
  
  const [goals, setGoals] = useState<GoalItem[]>(
    (data.goals as GoalItem[]) || [{ ...emptyGoal }]
  );
  const [expandedGoal, setExpandedGoal] = useState<number>(0);

  const addGoal = () => {
    if (goals.length < 5) {
      setGoals([...goals, { ...emptyGoal }]);
      setExpandedGoal(goals.length);
    }
  };

  const removeGoal = (index: number) => {
    if (goals.length > 1) {
      setGoals(goals.filter((_, i) => i !== index));
      if (expandedGoal >= goals.length - 1) {
        setExpandedGoal(Math.max(0, goals.length - 2));
      }
    }
  };

  const updateGoal = (index: number, field: keyof GoalItem, value: unknown) => {
    setGoals(goals.map((g, i) => i === index ? { ...g, [field]: value } : g));
  };

  const toggleValue = (goalIndex: number, valueId: string) => {
    const goal = goals[goalIndex];
    const newValueIds = goal.value_ids.includes(valueId)
      ? goal.value_ids.filter(id => id !== valueId)
      : [...goal.value_ids, valueId];
    updateGoal(goalIndex, 'value_ids', newValueIds);
  };

  const formData = {
    goals: goals.filter(g => g.title.trim()),
  };

  const validGoals = goals.filter(g => g.title.trim()).length;
  const canProceed = validGoals >= 1;

  return (
    <WizardShell
      stepId={stepId}
      initialData={initialData}
      formData={formData}
      canProceed={canProceed}
    >
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">
            Define 1-5 annual goals. Focus on outcomes you can measure.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {validGoals}/5 goals defined
          </p>
        </div>

        {goals.map((goal, index) => (
          <Card key={index} className="border-border">
            <CardHeader 
              className="cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setExpandedGoal(expandedGoal === index ? -1 : index)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center">
                    {index + 1}
                  </span>
                  {goal.title || 'Untitled Goal'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {goals.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeGoal(index);
                      }}
                      className="text-destructive"
                    >
                      Remove
                    </Button>
                  )}
                  <span>{expandedGoal === index ? '▼' : '▶'}</span>
                </div>
              </div>
            </CardHeader>
            
            {expandedGoal === index && (
              <CardContent className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label>Goal title (2-6 words)</Label>
                  <Input
                    value={goal.title}
                    onChange={(e) => updateGoal(index, 'title', e.target.value)}
                    placeholder="e.g., Launch my SaaS product"
                    maxLength={60}
                  />
                </div>

                {/* Why */}
                <div className="space-y-2">
                  <Label>Why does this goal matter to you?</Label>
                  <Textarea
                    value={goal.why}
                    onChange={(e) => updateGoal(index, 'why', e.target.value)}
                    placeholder="This matters because..."
                    maxLength={400}
                  />
                </div>

                {/* Values */}
                {userValues.length > 0 && (
                  <div className="space-y-2">
                    <Label>Which values does this goal serve?</Label>
                    <div className="flex flex-wrap gap-2">
                      {userValues.map((value) => (
                        <Badge
                          key={value.id}
                          variant={goal.value_ids.includes(value.id) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleValue(index, value.id)}
                        >
                          {value.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Success Definition */}
                <div className="space-y-2">
                  <Label>Define success clearly. What proves this goal happened?</Label>
                  <Textarea
                    value={goal.success_definition}
                    onChange={(e) => updateGoal(index, 'success_definition', e.target.value)}
                    placeholder="I'll know I succeeded when..."
                    maxLength={400}
                  />
                </div>

                {/* Metric */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Metric to track</Label>
                    <Input
                      value={goal.metric_name}
                      onChange={(e) => updateGoal(index, 'metric_name', e.target.value)}
                      placeholder="e.g., revenue, weight, hours"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current baseline</Label>
                    <Input
                      type="number"
                      value={goal.metric_baseline ?? ''}
                      onChange={(e) => updateGoal(index, 'metric_baseline', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="e.g., 0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Target by year end</Label>
                    <Input
                      type="number"
                      value={goal.metric_target ?? ''}
                      onChange={(e) => updateGoal(index, 'metric_target', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="e.g., 10000"
                    />
                  </div>
                </div>

                {/* Confidence & Motivation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>How confident are you? (0-10)</Label>
                      <span className="font-medium">{goal.confidence_score}</span>
                    </div>
                    <Slider
                      value={[goal.confidence_score]}
                      onValueChange={([v]) => updateGoal(index, 'confidence_score', v)}
                      min={0}
                      max={10}
                      step={1}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label>How excited are you? (0-10)</Label>
                      <span className="font-medium">{goal.motivation_score}</span>
                    </div>
                    <Slider
                      value={[goal.motivation_score]}
                      onValueChange={([v]) => updateGoal(index, 'motivation_score', v)}
                      min={0}
                      max={10}
                      step={1}
                    />
                  </div>
                </div>

                {/* Approach Phrase */}
                <div className="space-y-2">
                  <Label>Positive reframe (optional)</Label>
                  <p className="text-xs text-muted-foreground">
                    If goal is &quot;stop/avoid&quot;, rephrase as &quot;build/achieve&quot;
                  </p>
                  <Input
                    value={goal.approach_phrase}
                    onChange={(e) => updateGoal(index, 'approach_phrase', e.target.value)}
                    placeholder="e.g., Build energy through sleep → instead of Stop staying up late"
                  />
                </div>
              </CardContent>
            )}
          </Card>
        ))}

        {goals.length < 5 && (
          <Button onClick={addGoal} variant="outline" className="w-full">
            + Add another goal
          </Button>
        )}
      </div>
    </WizardShell>
  );
}

