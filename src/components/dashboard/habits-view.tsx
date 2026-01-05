'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createHabit, updateHabit, deleteHabit } from '@/app/actions/habits';
import { Habit, Goal } from '@/lib/types/database';

interface HabitWithGoal extends Habit {
  goal: { id: string; title: string } | null;
}

interface HabitsViewProps {
  habits: HabitWithGoal[];
  goals: Pick<Goal, 'id' | 'title'>[];
}

export function HabitsView({ habits, goals }: HabitsViewProps) {
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [goalId, setGoalId] = useState('');
  const [cue, setCue] = useState('');
  const [trackingType, setTrackingType] = useState<'binary' | 'count' | 'time'>('binary');
  const [weeklyTarget, setWeeklyTarget] = useState('3');
  const [minimumVersion, setMinimumVersion] = useState('');

  const activeHabits = habits.filter(h => h.status === 'active');
  const otherHabits = habits.filter(h => h.status !== 'active');

  const resetForm = () => {
    setName('');
    setGoalId('');
    setCue('');
    setTrackingType('binary');
    setWeeklyTarget('3');
    setMinimumVersion('');
  };

  const handleCreateHabit = () => {
    startTransition(async () => {
      await createHabit({
        name,
        goal_id: goalId || undefined,
        cue: cue || undefined,
        tracking_type: trackingType,
        weekly_target: parseInt(weeklyTarget) || 0,
        minimum_version: minimumVersion || undefined,
      });
      setIsDialogOpen(false);
      resetForm();
    });
  };

  const handlePauseHabit = (habitId: string) => {
    startTransition(async () => {
      await updateHabit(habitId, { status: 'paused' });
    });
  };

  const handleActivateHabit = (habitId: string) => {
    startTransition(async () => {
      await updateHabit(habitId, { status: 'active' });
    });
  };

  const handleDeleteHabit = (habitId: string) => {
    if (!confirm('Delete this habit?')) return;
    startTransition(async () => {
      await deleteHabit(habitId);
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Habits</h1>
          <p className="text-muted-foreground">{activeHabits.length} active habits</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Habit</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Habit</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Habit name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Link to Goal (optional)</label>
                <Select value={goalId} onValueChange={setGoalId}>
                  <SelectTrigger>
                    <SelectValue placeholder="No goal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No goal</SelectItem>
                    {goals.map(g => (
                      <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cue / Trigger</label>
                <Input value={cue} onChange={(e) => setCue(e.target.value)} placeholder="e.g., After coffee" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tracking Type</label>
                  <Select value={trackingType} onValueChange={(v) => setTrackingType(v as 'binary' | 'count' | 'time')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="binary">Did/Didn&apos;t</SelectItem>
                      <SelectItem value="count">Count</SelectItem>
                      <SelectItem value="time">Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weekly Target</label>
                  <Input type="number" value={weeklyTarget} onChange={(e) => setWeeklyTarget(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Version</label>
                <Input value={minimumVersion} onChange={(e) => setMinimumVersion(e.target.value)} placeholder="e.g., 5 minutes" />
              </div>
              <Button onClick={handleCreateHabit} disabled={isPending || !name.trim()}>
                Create Habit
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Habits */}
      <div className="grid gap-4 md:grid-cols-2">
        {activeHabits.length === 0 ? (
          <Card className="border-dashed md:col-span-2">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No active habits. Create your first habit!</p>
            </CardContent>
          </Card>
        ) : (
          activeHabits.map((habit) => (
            <Card key={habit.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{habit.name}</CardTitle>
                    {habit.goal && (
                      <p className="text-sm text-muted-foreground">{habit.goal.title}</p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handlePauseHabit(habit.id)}>
                      Pause
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteHabit(habit.id)}>
                      ×
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant="outline">{habit.tracking_type}</Badge>
                  <Badge variant="secondary">{habit.weekly_target}x/week</Badge>
                  {habit.cue && <Badge variant="outline">{habit.cue}</Badge>}
                </div>
                {habit.minimum_version && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Min: {habit.minimum_version}
                  </p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Paused Habits */}
      {otherHabits.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-muted-foreground">Paused</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {otherHabits.map((habit) => (
              <Card key={habit.id} className="opacity-60">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{habit.name}</CardTitle>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleActivateHabit(habit.id)}>
                        Activate
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteHabit(habit.id)}>
                        ×
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

