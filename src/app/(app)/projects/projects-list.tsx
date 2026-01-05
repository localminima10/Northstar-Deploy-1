'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { createProject, updateProject, deleteProject } from '@/app/actions/projects';
import { createTask, updateTask, setNextAction, completeTask, deleteTask } from '@/app/actions/tasks';
import { toast } from 'sonner';
import type { Project, Task, Goal } from '@/lib/types/database';

interface ProjectWithTasks extends Project {
  goal: { id: string; title: string } | null;
  tasks: Task[];
}

interface ProjectsListProps {
  projects: ProjectWithTasks[];
  goals: Pick<Goal, 'id' | 'title'>[];
}

export function ProjectsList({ projects, goals }: ProjectsListProps) {
  const [isPending, startTransition] = useTransition();
  const [showNewProject, setShowNewProject] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectWithTasks | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  
  const activeProjects = projects.filter(p => p.status === 'active');
  const pausedProjects = projects.filter(p => p.status === 'paused');
  const archivedProjects = projects.filter(p => p.status === 'archived');
  
  // Projects missing next actions
  const projectsMissingNextAction = activeProjects.filter(p => {
    const openTasks = p.tasks.filter(t => t.status === 'open');
    return openTasks.length === 0 || !openTasks.some(t => t.is_next_action);
  });

  return (
    <div className="space-y-6">
      {/* Warning for projects missing next actions */}
      {projectsMissingNextAction.length > 0 && (
        <Card className="border-warning/50 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-medium text-warning-foreground">
                  {projectsMissingNextAction.length} project{projectsMissingNextAction.length > 1 ? 's' : ''} need next actions
                </p>
                <p className="text-sm text-muted-foreground">
                  {projectsMissingNextAction.map(p => p.title).join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Active Projects</p>
          <p className="text-2xl font-bold text-primary">{activeProjects.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Paused</p>
          <p className="text-2xl font-bold text-warning">{pausedProjects.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Archived</p>
          <p className="text-2xl font-bold text-muted-foreground">{archivedProjects.length}</p>
        </Card>
      </div>
      
      {/* Add New Project */}
      <Dialog open={showNewProject} onOpenChange={setShowNewProject}>
        <DialogTrigger asChild>
          <Button className="w-full">+ Add New Project</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            goals={goals}
            onSubmit={async (data) => {
              startTransition(async () => {
                const result = await createProject(data);
                if (result.error) {
                  toast.error(result.error);
                } else {
                  toast.success('Project created!');
                  setShowNewProject(false);
                }
              });
            }}
            isPending={isPending}
          />
        </DialogContent>
      </Dialog>
      
      {/* Projects Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active ({activeProjects.length})</TabsTrigger>
          <TabsTrigger value="paused">Paused ({pausedProjects.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archivedProjects.length})</TabsTrigger>
        </TabsList>
        
        {(['active', 'paused', 'archived'] as const).map((status) => {
          const filteredProjects = status === 'active' ? activeProjects : 
                                   status === 'paused' ? pausedProjects : archivedProjects;
          return (
            <TabsContent key={status} value={status} className="space-y-4 mt-4">
              {filteredProjects.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No {status} projects.</p>
                </Card>
              ) : (
                filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isExpanded={expandedProject === project.id}
                    onToggleExpand={() => setExpandedProject(
                      expandedProject === project.id ? null : project.id
                    )}
                    onEdit={() => setEditingProject(project)}
                    onStatusChange={(newStatus) => {
                      startTransition(async () => {
                        const result = await updateProject(project.id, { status: newStatus });
                        if (result.error) {
                          toast.error(result.error);
                        }
                      });
                    }}
                    onDelete={() => {
                      startTransition(async () => {
                        const result = await deleteProject(project.id);
                        if (result.error) {
                          toast.error(result.error);
                        } else {
                          toast.success('Project deleted');
                        }
                      });
                    }}
                    onAddTask={async (title) => {
                      startTransition(async () => {
                        const result = await createTask({
                          project_id: project.id,
                          title,
                          is_next_action: project.tasks.filter(t => t.status === 'open').length === 0,
                        });
                        if (result.error) {
                          toast.error(result.error);
                        }
                      });
                    }}
                    onToggleTask={(taskId, done) => {
                      startTransition(async () => {
                        if (done) {
                          await completeTask(taskId);
                        } else {
                          await updateTask(taskId, { status: 'open' });
                        }
                      });
                    }}
                    onSetNextAction={(taskId) => {
                      startTransition(async () => {
                        const result = await setNextAction(taskId);
                        if (result.error) {
                          toast.error(result.error);
                        } else {
                          toast.success('Next action set');
                        }
                      });
                    }}
                    onDeleteTask={(taskId) => {
                      startTransition(async () => {
                        await deleteTask(taskId);
                      });
                    }}
                    isPending={isPending}
                  />
                ))
              )}
            </TabsContent>
          );
        })}
      </Tabs>
      
      {/* Edit Project Dialog */}
      <Dialog open={!!editingProject} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {editingProject && (
            <ProjectForm
              project={editingProject}
              goals={goals}
              onSubmit={async (data) => {
                startTransition(async () => {
                  const result = await updateProject(editingProject.id, data);
                  if (result.error) {
                    toast.error(result.error);
                  } else {
                    toast.success('Project updated');
                    setEditingProject(null);
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

interface ProjectCardProps {
  project: ProjectWithTasks;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onStatusChange: (status: 'active' | 'paused' | 'archived') => void;
  onDelete: () => void;
  onAddTask: (title: string) => void;
  onToggleTask: (taskId: string, done: boolean) => void;
  onSetNextAction: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  isPending: boolean;
}

function ProjectCard({
  project,
  isExpanded,
  onToggleExpand,
  onEdit,
  onStatusChange,
  onDelete,
  onAddTask,
  onToggleTask,
  onSetNextAction,
  onDeleteTask,
  isPending,
}: ProjectCardProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  const openTasks = project.tasks.filter(t => t.status === 'open');
  const doneTasks = project.tasks.filter(t => t.status === 'done');
  const nextAction = openTasks.find(t => t.is_next_action);
  const hasNextAction = !!nextAction;
  
  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    onAddTask(newTaskTitle.trim());
    setNewTaskTitle('');
  };
  
  return (
    <Card className={!hasNextAction && project.status === 'active' ? 'border-warning/50' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div 
            className="flex-1 cursor-pointer" 
            onClick={onToggleExpand}
          >
            <div className="flex items-center gap-2">
              <span className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`}>▶</span>
              <CardTitle className="text-lg">{project.title}</CardTitle>
            </div>
            {project.goal && (
              <Badge variant="outline" className="mt-1 text-xs">
                {project.goal.title}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit} disabled={isPending}>
              Edit
            </Button>
            <Select
              value={project.status}
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
        </div>
        
        {/* Next Action Summary */}
        {nextAction ? (
          <div className="flex items-center gap-2 mt-2 text-sm bg-primary/10 p-2 rounded">
            <Badge>Next</Badge>
            <span>{nextAction.title}</span>
          </div>
        ) : project.status === 'active' && (
          <div className="flex items-center gap-2 mt-2 text-sm bg-warning/10 p-2 rounded text-warning-foreground">
            <span>⚠️ No next action set</span>
          </div>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {project.definition_of_done && (
            <div className="text-sm">
              <span className="text-muted-foreground">Done when: </span>
              {project.definition_of_done}
            </div>
          )}
          
          {project.due_date && (
            <div className="text-sm">
              <span className="text-muted-foreground">Due: </span>
              {new Date(project.due_date).toLocaleDateString()}
            </div>
          )}
          
          {/* Tasks */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Tasks ({openTasks.length} open, {doneTasks.length} done)</p>
            
            {/* Add Task */}
            <div className="flex gap-2">
              <Input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Add a task..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              />
              <Button size="sm" onClick={handleAddTask} disabled={isPending || !newTaskTitle.trim()}>
                Add
              </Button>
            </div>
            
            {/* Open Tasks */}
            {openTasks.map((task) => (
              <div 
                key={task.id}
                className={`flex items-center gap-2 p-2 rounded ${task.is_next_action ? 'bg-primary/10' : 'bg-muted/30'}`}
              >
                <Checkbox
                  checked={false}
                  onCheckedChange={() => onToggleTask(task.id, true)}
                  disabled={isPending}
                />
                <span className="flex-1">{task.title}</span>
                {task.is_next_action ? (
                  <Badge>Next</Badge>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onSetNextAction(task.id)}
                    disabled={isPending}
                  >
                    Set Next
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive"
                  onClick={() => onDeleteTask(task.id)}
                  disabled={isPending}
                >
                  ×
                </Button>
              </div>
            ))}
            
            {/* Done Tasks (collapsed) */}
            {doneTasks.length > 0 && (
              <details className="text-sm text-muted-foreground">
                <summary className="cursor-pointer">
                  {doneTasks.length} completed task{doneTasks.length > 1 ? 's' : ''}
                </summary>
                <div className="mt-2 space-y-1">
                  {doneTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2 p-1 line-through">
                      <Checkbox checked disabled />
                      <span>{task.title}</span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
          
          {/* Delete */}
          <div className="pt-2 border-t">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-destructive"
              onClick={onDelete}
              disabled={isPending}
            >
              Delete Project
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface ProjectFormProps {
  project?: ProjectWithTasks;
  goals: Pick<Goal, 'id' | 'title'>[];
  onSubmit: (data: {
    goal_id?: string;
    title: string;
    definition_of_done?: string;
    due_date?: string;
  }) => void;
  isPending: boolean;
}

function ProjectForm({ project, goals, onSubmit, isPending }: ProjectFormProps) {
  const [title, setTitle] = useState(project?.title || '');
  const [goalId, setGoalId] = useState(project?.goal_id || '');
  const [definitionOfDone, setDefinitionOfDone] = useState(project?.definition_of_done || '');
  const [dueDate, setDueDate] = useState(project?.due_date || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      goal_id: goalId || undefined,
      definition_of_done: definitionOfDone || undefined,
      due_date: dueDate || undefined,
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Project Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Launch marketing website"
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
      
      <div className="space-y-2">
        <Label htmlFor="dod">Definition of Done</Label>
        <Textarea
          id="dod"
          value={definitionOfDone}
          onChange={(e) => setDefinitionOfDone(e.target.value)}
          placeholder="How will you know this project is complete?"
          rows={2}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="due">Due Date</Label>
        <Input
          id="due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
      
      <Button type="submit" disabled={isPending || !title.trim()} className="w-full">
        {isPending ? 'Saving...' : project ? 'Update Project' : 'Create Project'}
      </Button>
    </form>
  );
}

