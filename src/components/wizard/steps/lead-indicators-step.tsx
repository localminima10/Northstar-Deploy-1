'use client';

import { useState } from 'react';
import { WizardShell } from '../wizard-shell';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Goal, Json } from '@/lib/types/database';

interface IndicatorItem {
  goal_id: string;
  name: string;
  measure_type: 'binary' | 'count' | 'time';
  weekly_target: number;
  minimum_version: string;
  anchor: string;
}

interface LeadIndicatorsStepProps {
  stepId: string;
  initialData: Json;
  goals: Goal[];
}

export function LeadIndicatorsStep({ stepId, initialData, goals }: LeadIndicatorsStepProps) {
  const data = initialData as Record<string, unknown>;
  
  const [indicators, setIndicators] = useState<IndicatorItem[]>(
    (data.indicators as IndicatorItem[]) || []
  );

  const addIndicator = (goalId: string) => {
    const goalIndicators = indicators.filter(i => i.goal_id === goalId);
    if (goalIndicators.length < 3) {
      setIndicators([...indicators, {
        goal_id: goalId,
        name: '',
        measure_type: 'binary',
        weekly_target: 3,
        minimum_version: '',
        anchor: 'flexible',
      }]);
    }
  };

  const removeIndicator = (index: number) => {
    setIndicators(indicators.filter((_, i) => i !== index));
  };

  const updateIndicator = (index: number, field: keyof IndicatorItem, value: unknown) => {
    setIndicators(indicators.map((ind, i) => 
      i === index ? { ...ind, [field]: value } : ind
    ));
  };

  const formData = {
    indicators: indicators.filter(i => i.name.trim()),
  };

  const canProceed = goals.every(goal => 
    indicators.filter(i => i.goal_id === goal.id && i.name.trim()).length >= 1
  );

  return (
    <WizardShell
      stepId={stepId}
      initialData={initialData}
      formData={formData}
      canProceed={canProceed}
    >
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          For each goal, define 1-3 weekly lead indicators — the actions you control that drive progress.
        </p>

        {goals.length === 0 ? (
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="pt-6">
              <p className="text-warning-foreground">
                No goals found. Go back to the Goals step to add at least one goal.
              </p>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => {
            const goalIndicators = indicators
              .map((ind, index) => ({ ...ind, index }))
              .filter(i => i.goal_id === goal.id);

            return (
              <Card key={goal.id} className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goalIndicators.map((indicator) => (
                    <div 
                      key={indicator.index} 
                      className="border border-border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          {/* Name */}
                          <div className="space-y-2">
                            <Label>What will you do weekly?</Label>
                            <Input
                              value={indicator.name}
                              onChange={(e) => updateIndicator(indicator.index, 'name', e.target.value)}
                              placeholder="e.g., Lift weights, Write blog posts, Code for 10 hours"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Measure Type */}
                            <div className="space-y-2">
                              <Label>How is it measured?</Label>
                              <Select
                                value={indicator.measure_type}
                                onValueChange={(v) => updateIndicator(indicator.index, 'measure_type', v)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="binary">Did/Didn&apos;t</SelectItem>
                                  <SelectItem value="count">Count</SelectItem>
                                  <SelectItem value="time">Time (hours)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Weekly Target */}
                            <div className="space-y-2">
                              <Label>Weekly target</Label>
                              <Input
                                type="number"
                                value={indicator.weekly_target}
                                onChange={(e) => updateIndicator(indicator.index, 'weekly_target', parseInt(e.target.value) || 0)}
                                min={0}
                                max={100}
                              />
                            </div>

                            {/* Anchor */}
                            <div className="space-y-2">
                              <Label>When?</Label>
                              <Select
                                value={indicator.anchor}
                                onValueChange={(v) => updateIndicator(indicator.index, 'anchor', v)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="morning">Morning</SelectItem>
                                  <SelectItem value="midday">Midday</SelectItem>
                                  <SelectItem value="evening">Evening</SelectItem>
                                  <SelectItem value="specific">Specific time</SelectItem>
                                  <SelectItem value="flexible">Flexible</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Minimum Version */}
                          <div className="space-y-2">
                            <Label>Minimum version (for low-energy days)</Label>
                            <Input
                              value={indicator.minimum_version}
                              onChange={(e) => updateIndicator(indicator.index, 'minimum_version', e.target.value)}
                              placeholder="e.g., Do 1 set, Write 50 words, 5 minutes"
                            />
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIndicator(indicator.index)}
                          className="text-destructive ml-2"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}

                  {goalIndicators.length < 3 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addIndicator(goal.id)}
                    >
                      + Add lead indicator
                    </Button>
                  )}

                  {goalIndicators.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Add at least 1 lead indicator for this goal.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </WizardShell>
  );
}

