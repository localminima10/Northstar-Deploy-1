'use client';

import { useState } from 'react';
import { WizardShell } from '../wizard-shell';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_DERAILERS, IF_THEN_CATEGORIES } from '@/lib/wizard-config';
import { Goal, Json } from '@/lib/types/database';

interface WoopItem {
  goal_id: string;
  wish: string;
  outcome: string;
  obstacle: string;
  plan: string;
}

interface IfThenItem {
  goal_id: string;
  trigger: string;
  response: string;
  category: string;
}

interface WoopStepProps {
  stepId: string;
  initialData: Json;
  goals: Goal[];
}

export function WoopStep({ stepId, initialData, goals }: WoopStepProps) {
  const data = initialData as Record<string, unknown>;
  
  const [commonDerailers, setCommonDerailers] = useState<string[]>(
    (data.common_derailers as string[]) || []
  );
  const [customDerailer, setCustomDerailer] = useState('');
  const [woops, setWoops] = useState<WoopItem[]>(
    (data.woops as WoopItem[]) || goals.map(g => ({
      goal_id: g.id,
      wish: g.title,
      outcome: '',
      obstacle: '',
      plan: '',
    }))
  );
  const [ifThenPlans, setIfThenPlans] = useState<IfThenItem[]>(
    (data.if_then_plans as IfThenItem[]) || []
  );

  const toggleDerailer = (derailer: string) => {
    if (commonDerailers.includes(derailer)) {
      setCommonDerailers(commonDerailers.filter(d => d !== derailer));
    } else if (commonDerailers.length < 7) {
      setCommonDerailers([...commonDerailers, derailer]);
    }
  };

  const addCustomDerailer = () => {
    if (customDerailer.trim() && commonDerailers.length < 7) {
      setCommonDerailers([...commonDerailers, customDerailer.trim()]);
      setCustomDerailer('');
    }
  };

  const updateWoop = (goalId: string, field: keyof WoopItem, value: string) => {
    setWoops(woops.map(w => w.goal_id === goalId ? { ...w, [field]: value } : w));
  };

  const addIfThen = (goalId: string) => {
    const goalPlans = ifThenPlans.filter(p => p.goal_id === goalId);
    if (goalPlans.length < 3) {
      setIfThenPlans([...ifThenPlans, {
        goal_id: goalId,
        trigger: '',
        response: '',
        category: 'focus',
      }]);
    }
  };

  const removeIfThen = (index: number) => {
    setIfThenPlans(ifThenPlans.filter((_, i) => i !== index));
  };

  const updateIfThen = (index: number, field: keyof IfThenItem, value: string) => {
    setIfThenPlans(ifThenPlans.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    ));
  };

  const formData = {
    common_derailers: commonDerailers,
    woops: woops.filter(w => w.obstacle.trim() || w.plan.trim()),
    if_then_plans: ifThenPlans.filter(p => p.trigger.trim() && p.response.trim()),
  };

  return (
    <WizardShell
      stepId={stepId}
      initialData={initialData}
      formData={formData}
      canProceed={true}
    >
      <div className="space-y-8">
        {/* Common Derailers */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              What usually derails you? (choose up to 7)
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              These will be available for &quot;Defend the Day&quot; on your dashboard.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {DEFAULT_DERAILERS.map((derailer) => (
              <Badge
                key={derailer}
                variant={commonDerailers.includes(derailer) ? 'default' : 'outline'}
                className="cursor-pointer text-sm py-1.5 px-3 hover:bg-accent"
                onClick={() => toggleDerailer(derailer)}
              >
                {derailer}
              </Badge>
            ))}
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Add a custom derailer..."
              value={customDerailer}
              onChange={(e) => setCustomDerailer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomDerailer()}
              className="max-w-xs"
            />
            <Button onClick={addCustomDerailer} variant="outline" disabled={commonDerailers.length >= 7}>
              Add
            </Button>
          </div>
        </div>

        {/* WOOP per Goal */}
        <div className="space-y-4">
          <Label className="text-base font-medium">
            WOOP for each goal
          </Label>
          <p className="text-sm text-muted-foreground">
            WOOP = Wish, Outcome, Obstacle, Plan. Focus on the internal obstacle and your if-then response.
          </p>

          {goals.map((goal) => {
            const woop = woops.find(w => w.goal_id === goal.id) || {
              goal_id: goal.id,
              wish: goal.title,
              outcome: '',
              obstacle: '',
              plan: '',
            };
            const goalIfThens = ifThenPlans
              .map((p, index) => ({ ...p, index }))
              .filter(p => p.goal_id === goal.id);

            return (
              <Card key={goal.id} className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Outcome — Best result + how it feels</Label>
                      <Textarea
                        value={woop.outcome}
                        onChange={(e) => updateWoop(goal.id, 'outcome', e.target.value)}
                        placeholder="When I achieve this, I will feel..."
                        className="min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Obstacle — Main internal obstacle</Label>
                      <Textarea
                        value={woop.obstacle}
                        onChange={(e) => updateWoop(goal.id, 'obstacle', e.target.value)}
                        placeholder="e.g., I avoid discomfort and start scrolling"
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Plan — If-Then response</Label>
                    <Textarea
                      value={woop.plan}
                      onChange={(e) => updateWoop(goal.id, 'plan', e.target.value)}
                      placeholder="If [obstacle shows up], then I will [specific action]"
                      className="min-h-[60px]"
                    />
                  </div>

                  {/* Additional If-Then Plans */}
                  <div className="border-t border-border pt-4 mt-4">
                    <Label className="text-sm text-muted-foreground">
                      Additional If-Then plans (optional, up to 3)
                    </Label>
                    
                    {goalIfThens.map((plan) => (
                      <div key={plan.index} className="flex gap-2 mt-3 items-start">
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <Input
                              value={plan.trigger}
                              onChange={(e) => updateIfThen(plan.index, 'trigger', e.target.value)}
                              placeholder="If..."
                            />
                            <Input
                              value={plan.response}
                              onChange={(e) => updateIfThen(plan.index, 'response', e.target.value)}
                              placeholder="Then I will..."
                            />
                          </div>
                          <Select
                            value={plan.category}
                            onValueChange={(v) => updateIfThen(plan.index, 'category', v)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {IF_THEN_CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat.toLowerCase()}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIfThen(plan.index)}
                          className="text-destructive"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    
                    {goalIfThens.length < 3 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => addIfThen(goal.id)}
                        className="mt-2"
                      >
                        + Add If-Then plan
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </WizardShell>
  );
}

