'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createProject, updateProject, deleteProject } from '@/app/actions/projects';
import { createTask, completeTask, setNextAction, deleteTask } from '@/app/actions/tasks';
import { Project, Goal, Task } from '@/lib/types/database';

interface ProjectWithRelations extends Project {
  goal: { id: string; title: string } | null;
  tasks: Task[] | null;
}

interface ProjectsViewProps {
  projects: ProjectWithRelations[];
  goals: Pick<Goal, 'id' | 'title'>[];
}

export function ProjectsView({ projects, goals }: ProjectsViewProps) {
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // Form state
  const [title, setTitle] = useState('');
  const [goalId, setGoalId] = useState('');
  const [defOfDone, setDefOfDone] = useState('');
  const [dueDate, setDueDate] = useState('');

  const activeProjects = projects.filter(p => p.status === 'active');
  const otherProjects = projects.filter(p => p.status !== 'active');

  const resetForm = () => {
    setTitle('');
    setGoalId('');
    setDefOfDone('');
    setDueDate('');
  };

  const handleCreateProject = () => {
    startTransition(async () => {
      await createProject({
        title,
        goal_id: goalId || undefined,
        definition_of_done: defOfDone || undefined,
        due_date: dueDate || undefined,
      });
      setIsDialogOpen(false);
      resetForm();
    });
  };

  const handleAddTask = (projectId: string) => {
    if (!newTaskTitle.trim()) return;
    startTransition(async () => {
      await createTask({
        project_id: projectId,
        title: newTaskTitle,
      });
      setNewTaskTitle('');
    });
  };

  const handleCompleteTask = (taskId: string) => {
    startTransition(async () => {
      await completeTask(taskId);
    });
  };

  const handleSetNextAction = (taskId: string) => {
    startTransition(async () => {
      await setNextAction(taskId);
    });
  };

  const handleDeleteTask = (taskId: string) => {
    startTransition(async () => {
      await deleteTask(taskId);
    });
  };

  const handleArchiveProject = (projectId: string) => {
    startTransition(async () => {
      await updateProject(projectId, { status: 'archived' });
    });
  };

  const handleDeleteProject = (projectId: string) => {
    if (!confirm('Delete this project and all its tasks?')) return;
    startTransition(async () => {
      await deleteProject(projectId);
    });
  };

  const getNextAction = (tasks: Task[] | null) => {
    return tasks?.find(t => t.is_next_action && t.status === 'open');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">{activeProjects.length} active projects</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" />
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
                <label className="text-sm font-medium">Definition of Done</label>
                <Textarea value={defOfDone} onChange={(e) => setDefOfDone(e.target.value)} placeholder="When is this project complete?" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <Button onClick={handleCreateProject} disabled={isPending || !title.trim()}>
                Create Project
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Projects */}
      <div className="space-y-4">
        {activeProjects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No active projects. Create your first project!</p>
            </CardContent>
          </Card>
        ) : (
          activeProjects.map((project) => {
            const nextAction = getNextAction(project.tasks);
            const openTasks = project.tasks?.filter(t => t.status === 'open') || [];
            const doneTasks = project.tasks?.filter(t => t.status === 'done') || [];
            const isExpanded = expandedProject === project.id;

            return (
              <Card key={project.id} className={!nextAction ? 'border-warning/50' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle 
                          className="text-lg cursor-pointer hover:text-primary"
                          onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                        >
                          {project.title}
                        </CardTitle>
                        {!nextAction && (
                          <Badge variant="outline" className="text-warning border-warning">
                            No next action
                          </Badge>
                        )}
                      </div>
                      {project.goal && (
                        <p className="text-sm text-muted-foreground">{project.goal.title}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleArchiveProject(project.id)}>
                        Archive
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteProject(project.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Next Action Preview */}
                  {nextAction && !isExpanded && (
                    <div className="flex items-center gap-2 p-2 bg-accent/30 rounded-lg">
                      <span className="text-xs font-medium text-muted-foreground">Next:</span>
                      <span className="text-sm">{nextAction.title}</span>
                    </div>
                  )}

                  {/* Expanded Tasks */}
                  {isExpanded && (
                    <div className="space-y-4 mt-4">
                      {/* Open Tasks */}
                      <div className="space-y-2">
                        {openTasks.map((task) => (
                          <div
                            key={task.id}
                            className={`flex items-center gap-3 p-2 rounded-lg ${task.is_next_action ? 'bg-primary/10 border border-primary/30' : 'hover:bg-accent/50'}`}
                          >
                            <Checkbox onCheckedChange={() => handleCompleteTask(task.id)} />
                            <span className="flex-1">{task.title}</span>
                            {task.is_next_action ? (
                              <Badge>Next Action</Badge>
                            ) : (
                              <Button variant="ghost" size="sm" onClick={() => handleSetNextAction(task.id)}>
                                Set as Next
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteTask(task.id)}>
                              ×
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Add Task */}
                      <div className="flex gap-2">
                        <Input
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Add a task..."
                          onKeyDown={(e) => e.key === 'Enter' && handleAddTask(project.id)}
                        />
                        <Button onClick={() => handleAddTask(project.id)} disabled={!newTaskTitle.trim()}>
                          Add
                        </Button>
                      </div>

                      {/* Done Tasks */}
                      {doneTasks.length > 0 && (
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-2">{doneTasks.length} completed</p>
                          {doneTasks.slice(0, 3).map((task) => (
                            <p key={task.id} className="text-sm text-muted-foreground line-through">{task.title}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {!isExpanded && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {openTasks.length} tasks • Click to expand
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Archived Projects */}
      {otherProjects.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-muted-foreground">Archived</h2>
          {otherProjects.map((project) => (
            <Card key={project.id} className="opacity-60">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{project.title}</CardTitle>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteProject(project.id)}>
                    Delete
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

