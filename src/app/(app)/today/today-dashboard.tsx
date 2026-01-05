'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { saveDailyCheckin } from '@/app/actions/checkins';
import { logHabit } from '@/app/actions/habits';
import { completeTask } from '@/app/actions/tasks';
import { createInboxItem } from '@/app/actions/inbox';
import { toast } from 'sonner';
import type { 
  UserSettings, 
  YearCompass, 
  DailyCheckin, 
  Habit, 
  Task, 
  VisionTile,
  IdentityStatement,
  Goal,
  IfThenPlan,
  HabitLog
} from '@/lib/types/database';

interface HabitWithLog extends Habit {
  todayLog: HabitLog | null;
}

interface TaskWithProject extends Task {
  project: { id: string; title: string; goal_id: string | null } | null;
}

interface TodayDashboardProps {
  settings: UserSettings | null;
  yearCompass: YearCompass | null;
  todayCheckin: DailyCheckin | null;
  habits: HabitWithLog[];
  nextActions: TaskWithProject[];
  visionTiles: VisionTile[];
  identityStatements: IdentityStatement[];
  activeGoals: { id: string; title: string }[];
  ifThenPlans: IfThenPlan[];
  inboxCount: number;
  todayStr: string;
  timezone: string;
}

export function TodayDashboard({
  settings,
  yearCompass,
  todayCheckin,
  habits,
  nextActions,
  visionTiles,
  identityStatements,
  activeGoals,
  ifThenPlans,
  inboxCount,
  todayStr,
}: TodayDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [outcomes, setOutcomes] = useState<string[]>(
    todayCheckin?.focus_outcomes || ['', '', '']
  );
  const [selectedObstacle, setSelectedObstacle] = useState<string>(
    todayCheckin?.main_obstacle || ''
  );
  const [quickCapture, setQuickCapture] = useState('');
  const [eveningWin, setEveningWin] = useState(todayCheckin?.win || '');
  const [eveningLesson, setEveningLesson] = useState(todayCheckin?.lesson || '');
  const [showEveningReflection, setShowEveningReflection] = useState(false);
  
  const maxOutcomes = settings?.max_daily_outcomes || 3;
  const derailers = settings?.common_derailers || [];
  
  // Get random vision tile for manifestation header
  const pinnedTile = visionTiles.find(t => t.pinned) || visionTiles[0];
  
  // Calculate habits completed today
  const habitsCompleted = habits.filter(h => h.todayLog && (h.todayLog.value || 0) > 0).length;
  const habitsProgress = habits.length > 0 ? (habitsCompleted / habits.length) * 100 : 0;
  
  // Calculate tasks completed
  const tasksCompleted = nextActions.filter(t => t.status === 'done').length;
  const tasksProgress = nextActions.length > 0 ? (tasksCompleted / nextActions.length) * 100 : 0;
  
  const handleSaveOutcomes = () => {
    startTransition(async () => {
      const result = await saveDailyCheckin({
        focus_outcomes: outcomes.filter(o => o.trim() !== ''),
        main_obstacle: selectedObstacle,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Outcomes saved');
      }
    });
  };
  
  const handleHabitToggle = (habitId: string, currentValue: number | null) => {
    startTransition(async () => {
      const newValue = currentValue && currentValue > 0 ? 0 : 1;
      const result = await logHabit(habitId, newValue);
      if (result.error) {
        toast.error(result.error);
      }
    });
  };
  
  const handleTaskComplete = (taskId: string) => {
    startTransition(async () => {
      const result = await completeTask(taskId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Task completed! 🎉');
      }
    });
  };
  
  const handleQuickCapture = () => {
    if (!quickCapture.trim()) return;
    
    startTransition(async () => {
      const result = await createInboxItem({ content: quickCapture.trim() });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Captured to inbox');
        setQuickCapture('');
      }
    });
  };
  
  const handleSaveEveningReflection = () => {
    startTransition(async () => {
      const result = await saveDailyCheckin({
        focus_outcomes: outcomes.filter(o => o.trim() !== ''),
        main_obstacle: selectedObstacle,
        win: eveningWin,
        lesson: eveningLesson,
      });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Reflection saved');
        setShowEveningReflection(false);
      }
    });
  };
  
  // Get matching if-then plans for selected obstacle
  const matchingPlans = ifThenPlans.filter(p => 
    selectedObstacle && p.trigger.toLowerCase().includes(selectedObstacle.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Manifestation Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,200,100,0.1),transparent_50%)]" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start">
          {/* Vision Tile */}
          {pinnedTile && (
            <div className="w-32 h-32 rounded-xl overflow-hidden bg-card/50 border border-border/50 flex-shrink-0">
              {pinnedTile.tile_type === 'text' ? (
                <div className="h-full flex items-center justify-center p-3 text-center text-sm font-medium">
                  {pinnedTile.text_content}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                  Vision Image
                </div>
              )}
            </div>
          )}
          
          <div className="flex-1 space-y-4">
            {/* Year Theme */}
            {yearCompass?.theme && (
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  2026 Theme
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {yearCompass.theme}
                </h1>
              </div>
            )}
            
            {/* Mission */}
            {yearCompass?.mission_statement && (
              <p className="text-muted-foreground max-w-2xl">
                {yearCompass.mission_statement}
              </p>
            )}
            
            {/* Identity Statement */}
            {identityStatements[0] && (
              <p className="text-primary font-medium italic">
                "{identityStatements[0].content}"
              </p>
            )}
            
            {/* Mantra */}
            {settings?.mantra && (
              <p className="text-sm text-accent-foreground bg-accent/30 inline-block px-3 py-1 rounded-full">
                {settings.mantra}
              </p>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="flex gap-4 md:flex-col">
            <Link href="/goals" className="text-center p-3 rounded-lg bg-card/50 hover:bg-card transition-colors">
              <p className="text-2xl font-bold text-primary">{activeGoals.length}</p>
              <p className="text-xs text-muted-foreground">Active Goals</p>
            </Link>
            <Link href="/inbox" className="text-center p-3 rounded-lg bg-card/50 hover:bg-card transition-colors">
              <p className="text-2xl font-bold text-warning">{inboxCount}</p>
              <p className="text-xs text-muted-foreground">Inbox Items</p>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Focus & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Focus Outcomes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-xl">◎</span>
                Today's Focus
              </CardTitle>
              <span className="text-sm text-muted-foreground">{todayStr}</span>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                What {maxOutcomes} outcomes would make today a win?
              </p>
              
              {outcomes.slice(0, maxOutcomes).map((outcome, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="text-lg font-bold text-primary w-6">{index + 1}.</span>
                  <Input
                    value={outcome}
                    onChange={(e) => {
                      const newOutcomes = [...outcomes];
                      newOutcomes[index] = e.target.value;
                      setOutcomes(newOutcomes);
                    }}
                    placeholder={`Outcome ${index + 1}`}
                    className="flex-1"
                  />
                </div>
              ))}
              
              <Button 
                onClick={handleSaveOutcomes} 
                disabled={isPending}
                size="sm"
                className="mt-2"
              >
                {isPending ? 'Saving...' : 'Save Outcomes'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Next Actions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-xl">→</span>
                Next Actions
              </CardTitle>
              <Link href="/projects" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {nextActions.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  No next actions set. Go to Projects to set your next actions.
                </p>
              ) : (
                <div className="space-y-2">
                  {nextActions.map((task) => (
                    <div 
                      key={task.id} 
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={task.status === 'done'}
                        onCheckedChange={() => handleTaskComplete(task.id)}
                        disabled={isPending}
                      />
                      <div className="flex-1">
                        <p className={task.status === 'done' ? 'line-through text-muted-foreground' : ''}>
                          {task.title}
                        </p>
                        {task.project && (
                          <p className="text-xs text-muted-foreground">
                            {task.project.title}
                          </p>
                        )}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Next Action
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Progress */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{tasksCompleted}/{nextActions.length}</span>
                </div>
                <Progress value={tasksProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          {/* Defend the Day */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-xl">🛡</span>
                Defend the Day
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  What's most likely to derail you today?
                </p>
                <Select value={selectedObstacle} onValueChange={setSelectedObstacle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a potential obstacle" />
                  </SelectTrigger>
                  <SelectContent>
                    {derailers.map((derailer) => (
                      <SelectItem key={derailer} value={derailer}>
                        {derailer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {matchingPlans.length > 0 && (
                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-success mb-2">Your If-Then Plans:</p>
                  {matchingPlans.map((plan) => (
                    <div key={plan.id} className="text-sm">
                      <span className="text-muted-foreground">If</span>{' '}
                      <span className="font-medium">{plan.trigger}</span>,{' '}
                      <span className="text-muted-foreground">then</span>{' '}
                      <span className="font-medium text-success">{plan.response}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedObstacle && matchingPlans.length === 0 && (
                <p className="text-sm text-muted-foreground italic">
                  No if-then plan for this obstacle. Consider creating one in Settings.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column: Habits & Quick Capture */}
        <div className="space-y-6">
          {/* Habits */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-xl">↻</span>
                Today's Habits
              </CardTitle>
              <Link href="/habits" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {habits.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4 text-center">
                  No habits set up yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {habits.map((habit) => {
                    const isCompleted = !!(habit.todayLog && (habit.todayLog.value || 0) > 0);
                    return (
                      <div 
                        key={habit.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                      >
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={() => handleHabitToggle(habit.id, habit.todayLog?.value || null)}
                          disabled={isPending}
                        />
                        <div className="flex-1 min-w-0">
                          <p className={`truncate ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                            {habit.name}
                          </p>
                          {habit.minimum_version && (
                            <p className="text-xs text-muted-foreground truncate">
                              Min: {habit.minimum_version}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {/* Progress */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Today</span>
                  <span className="font-medium">{habitsCompleted}/{habits.length}</span>
                </div>
                <Progress value={habitsProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Capture */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-xl">↳</span>
                Quick Capture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input
                  value={quickCapture}
                  onChange={(e) => setQuickCapture(e.target.value)}
                  placeholder="What's on your mind?"
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickCapture()}
                />
                <Button 
                  onClick={handleQuickCapture} 
                  disabled={isPending || !quickCapture.trim()}
                  size="sm"
                  className="w-full"
                >
                  {isPending ? 'Capturing...' : 'Capture to Inbox'}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Evening Reflection */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="text-xl">🌙</span>
                Evening Reflection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog open={showEveningReflection} onOpenChange={setShowEveningReflection}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    {todayCheckin?.win ? 'Edit Reflection' : 'Start Reflection'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Evening Reflection</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        What was your biggest win today?
                      </label>
                      <Textarea
                        value={eveningWin}
                        onChange={(e) => setEveningWin(e.target.value)}
                        placeholder="I successfully..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        What did you learn?
                      </label>
                      <Textarea
                        value={eveningLesson}
                        onChange={(e) => setEveningLesson(e.target.value)}
                        placeholder="I learned that..."
                        rows={3}
                      />
                    </div>
                    <Button 
                      onClick={handleSaveEveningReflection}
                      disabled={isPending}
                      className="w-full"
                    >
                      {isPending ? 'Saving...' : 'Save Reflection'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              {todayCheckin?.win && (
                <div className="mt-3 p-3 bg-success/10 rounded-lg">
                  <p className="text-sm font-medium text-success">Today's Win:</p>
                  <p className="text-sm text-muted-foreground">{todayCheckin.win}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

