'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { createHabit, updateHabit, deleteHabit, logHabit } from '@/app/actions/habits';
import { toast } from 'sonner';
import type { Habit, HabitLog, Goal } from '@/lib/types/database';

interface HabitWithLogs extends Habit {
  goal: { id: string; title: string } | null;
  logs: HabitLog[];
}

interface HabitsListProps {
  habits: HabitWithLogs[];
  goals: Pick<Goal, 'id' | 'title'>[];
  todayStr: string;
  weekStart: string;
}

export function HabitsList({ habits, goals, todayStr, weekStart }: HabitsListProps) {
  const [isPending, startTransition] = useTransition();
  const [showNewHabit, setShowNewHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitWithLogs | null>(null);
  
  const activeHabits = habits.filter(h => h.status === 'active');
  const pausedHabits = habits.filter(h => h.status === 'paused');
  const archivedHabits = habits.filter(h => h.status === 'archived');
  
  // Calculate weekly days
  const weekDays: string[] = [];
  const startDate = new Date(weekStart);
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(day.getDate() + i);
    weekDays.push(day.toISOString().split('T')[0]);
  }
  
  const handleLogHabit = (habitId: string, date: string, currentValue: number | null) => {
    startTransition(async () => {
      const newValue = currentValue && currentValue > 0 ? 0 : 1;
      const result = await logHabit(habitId, newValue, date);
      if (result.error) {
        toast.error(result.error);
      }
    });
  };
  
  // Calculate weekly stats
  const totalWeeklyTarget = activeHabits.reduce((sum, h) => sum + (h.weekly_target || 0), 0);
  const totalWeeklyCompleted = activeHabits.reduce((sum, h) => {
    return sum + h.logs.filter(l => l.value && l.value > 0).length;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Weekly Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">
                {totalWeeklyCompleted} / {totalWeeklyTarget} completions
              </p>
            </div>
            <div className="w-32">
              <Progress 
                value={totalWeeklyTarget > 0 ? (totalWeeklyCompleted / totalWeeklyTarget) * 100 : 0} 
                className="h-3"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Add New Habit */}
      <Dialog open={showNewHabit} onOpenChange={setShowNewHabit}>
        <DialogTrigger asChild>
          <Button className="w-full">+ Add New Habit</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Habit</DialogTitle>
          </DialogHeader>
          <HabitForm
            goals={goals}
            onSubmit={async (data) => {
              startTransition(async () => {
                const result = await createHabit(data);
                if (result.error) {
                  toast.error(result.error);
                } else {
                  toast.success('Habit created!');
                  setShowNewHabit(false);
                }
              });
            }}
            isPending={isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Habits Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active ({activeHabits.length})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({pausedHabits.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archivedHabits.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="mt-4">
          {activeHabits.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No active habits. Create your first habit!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Week Header */}
              <Card className="overflow-x-auto">
                <CardContent className="p-4">
                  <div className="flex gap-2 min-w-max">
                    <div className="w-48 flex-shrink-0" />
                    {weekDays.map((day) => {
                      const date = new Date(day);
                      const isToday = day === todayStr;
                      return (
                        <div 
                          key={day}
                          className={`w-12 text-center text-sm ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}
                        >
                          <p>{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                          <p className={isToday ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center mx-auto' : ''}>
                            {date.getDate()}
                          </p>
                        </div>
                      );
                    })}
                    <div className="w-16 text-center text-sm text-muted-foreground">
                      <p>Week</p>
                      <p>Total</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Habits Grid */}
              {activeHabits.map((habit) => {
                const weeklyCompleted = habit.logs.filter(l => l.value && l.value > 0).length;
                const weeklyProgress = habit.weekly_target 
                  ? (weeklyCompleted / habit.weekly_target) * 100 
                  : 0;
                
                return (
                  <Card key={habit.id} className="overflow-x-auto">
                    <CardContent className="p-4">
                      <div className="flex gap-2 min-w-max items-center">
                        {/* Habit Info */}
                        <div className="w-48 flex-shrink-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium truncate">{habit.name}</p>
                              {habit.goal && (
                                <Badge variant="outline" className="text-xs mt-1">
                                  {habit.goal.title}
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingHabit(habit)}
                            >
                              ⋯
                            </Button>
                          </div>
                          {habit.minimum_version && (
                            <p className="text-xs text-muted-foreground mt-1 truncate">
                              Min: {habit.minimum_version}
                            </p>
                          )}
                        </div>
                        
                        {/* Day Checkboxes */}
                        {weekDays.map((day) => {
                          const log = habit.logs.find(l => l.log_date === day);
                          const isCompleted = !!(log && log.value && log.value > 0);
                          const isToday = day === todayStr;
                          const isFuture = day > todayStr;
                          
                          return (
                            <div 
                              key={day}
                              className={`w-12 flex items-center justify-center ${isToday ? 'bg-primary/10 rounded' : ''}`}
                            >
                              <Checkbox
                                checked={isCompleted}
                                onCheckedChange={() => handleLogHabit(habit.id, day, log?.value || null)}
                                disabled={isPending || isFuture}
                                className={isFuture ? 'opacity-30' : ''}
                              />
                            </div>
                          );
                        })}
                        
                        {/* Weekly Total */}
                        <div className="w-16 text-center">
                          <p className={`font-bold ${weeklyCompleted >= (habit.weekly_target || 0) ? 'text-success' : ''}`}>
                            {weeklyCompleted}/{habit.weekly_target || 7}
                          </p>
                          <Progress value={weeklyProgress} className="h-1 mt-1" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="paused" className="mt-4">
          {pausedHabits.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No paused habits.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {pausedHabits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  onEdit={() => setEditingHabit(habit)}
                  onStatusChange={(status) => {
                    startTransition(async () => {
                      await updateHabit(habit.id, { status });
                    });
                  }}
                  isPending={isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="archived" className="mt-4">
          {archivedHabits.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No archived habits.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {archivedHabits.map((habit) => (
                <HabitRow
                  key={habit.id}
                  habit={habit}
                  onEdit={() => setEditingHabit(habit)}
                  onStatusChange={(status) => {
                    startTransition(async () => {
                      await updateHabit(habit.id, { status });
                    });
                  }}
                  isPending={isPending}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Edit Habit Dialog */}
      <Dialog open={!!editingHabit} onOpenChange={(open) => !open && setEditingHabit(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Habit</DialogTitle>
          </DialogHeader>
          {editingHabit && (
            <div className="space-y-4">
              <HabitForm
                habit={editingHabit}
                goals={goals}
                onSubmit={async (data) => {
                  startTransition(async () => {
                    const result = await updateHabit(editingHabit.id, data);
                    if (result.error) {
                      toast.error(result.error);
                    } else {
                      toast.success('Habit updated');
                      setEditingHabit(null);
                    }
                  });
                }}
                isPending={isPending}
              />
              <div className="pt-4 border-t">
                <Button
                  variant="ghost"
                  className="text-destructive w-full"
                  onClick={() => {
                    startTransition(async () => {
                      const result = await deleteHabit(editingHabit.id);
                      if (result.error) {
                        toast.error(result.error);
                      } else {
                        toast.success('Habit deleted');
                        setEditingHabit(null);
                      }
                    });
                  }}
                  disabled={isPending}
                >
                  Delete Habit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface HabitRowProps {
  habit: HabitWithLogs;
  onEdit: () => void;
  onStatusChange: (status: 'active' | 'paused' | 'archived') => void;
  isPending: boolean;
}

function HabitRow({ habit, onEdit, onStatusChange, isPending }: HabitRowProps) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="font-medium">{habit.name}</p>
          {habit.goal && (
            <Badge variant="outline" className="text-xs mt-1">
              {habit.goal.title}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
          <Select
            value={habit.status}
            onValueChange={onStatusChange}
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
      </CardContent>
    </Card>
  );
}

interface HabitFormProps {
  habit?: HabitWithLogs;
  goals: Pick<Goal, 'id' | 'title'>[];
  onSubmit: (data: {
    goal_id?: string;
    name: string;
    cue?: string;
    location?: string;
    tracking_type: 'binary' | 'count' | 'time';
    weekly_target?: number;
    minimum_version?: string;
    status?: 'active' | 'paused' | 'archived';
  }) => void;
  isPending: boolean;
}

function HabitForm({ habit, goals, onSubmit, isPending }: HabitFormProps) {
  const [name, setName] = useState(habit?.name || '');
  const [goalId, setGoalId] = useState(habit?.goal_id || '');
  const [cue, setCue] = useState(habit?.cue || '');
  const [location, setLocation] = useState(habit?.location || '');
  const [trackingType, setTrackingType] = useState<'binary' | 'count' | 'time'>(habit?.tracking_type || 'binary');
  const [weeklyTarget, setWeeklyTarget] = useState(habit?.weekly_target?.toString() || '7');
  const [minimumVersion, setMinimumVersion] = useState(habit?.minimum_version || '');
  const [status, setStatus] = useState(habit?.status || 'active');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      goal_id: goalId || undefined,
      cue: cue || undefined,
      location: location || undefined,
      tracking_type: trackingType,
      weekly_target: parseInt(weeklyTarget) || 7,
      minimum_version: minimumVersion || undefined,
      status,
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Habit Name *</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Morning meditation"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="goal">Linked Goal</Label>
        <Select value={goalId} onValueChange={setGoalId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a goal (optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No goal</SelectItem>
            {goals.map((goal) => (
              <SelectItem key={goal.id} value={goal.id}>
                {goal.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cue">Cue/Trigger</Label>
          <Input
            id="cue"
            value={cue}
            onChange={(e) => setCue(e.target.value)}
            placeholder="After I wake up..."
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Bedroom"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tracking">Tracking Type</Label>
          <Select value={trackingType} onValueChange={(v) => setTrackingType(v as 'binary' | 'count' | 'time')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="binary">Yes/No</SelectItem>
              <SelectItem value="count">Count</SelectItem>
              <SelectItem value="time">Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="target">Weekly Target</Label>
          <Input
            id="target"
            type="number"
            min="1"
            max="7"
            value={weeklyTarget}
            onChange={(e) => setWeeklyTarget(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="minimum">Minimum Version</Label>
        <Textarea
          id="minimum"
          value={minimumVersion}
          onChange={(e) => setMinimumVersion(e.target.value)}
          placeholder="The smallest version of this habit I can do on hard days"
          rows={2}
        />
      </div>
      
      {habit && (
        <div className="space-y-2">
          <Label>Status</Label>
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
      
      <Button type="submit" disabled={isPending || !name.trim()} className="w-full">
        {isPending ? 'Saving...' : habit ? 'Update Habit' : 'Create Habit'}
      </Button>
    </form>
  );
}

