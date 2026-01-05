'use client';

import { useState } from 'react';
import { WizardShell } from '../wizard-shell';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Goal, Json } from '@/lib/types/database';

interface ProjectItem {
  goal_id: string;
  title: string;
  definition_of_done: string;
  due_date: string;
  next_action: string;
}

interface ProjectsStepProps {
  stepId: string;
  initialData: Json;
  goals: Goal[];
}

export function ProjectsStep({ stepId, initialData, goals }: ProjectsStepProps) {
  const data = initialData as Record<string, unknown>;
  
  const [projects, setProjects] = useState<ProjectItem[]>(
    (data.projects as ProjectItem[]) || []
  );

  const addProject = (goalId: string) => {
    const goalProjects = projects.filter(p => p.goal_id === goalId);
    if (goalProjects.length < 10) {
      setProjects([...projects, {
        goal_id: goalId,
        title: '',
        definition_of_done: '',
        due_date: '',
        next_action: '',
      }]);
    }
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof ProjectItem, value: string) => {
    setProjects(projects.map((p, i) => 
      i === index ? { ...p, [field]: value } : p
    ));
  };

  const formData = {
    projects: projects.filter(p => p.title.trim() && p.next_action.trim()),
  };

  // Each goal needs at least one project with a next action
  const canProceed = goals.every(goal => 
    projects.some(p => p.goal_id === goal.id && p.title.trim() && p.next_action.trim())
  );

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
            Projects are finite outcomes that move your goals forward. Each project needs a clear next action.
          </p>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Each active project must have exactly one next action — the smallest visible step.
          </p>
        </div>

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
            const goalProjects = projects
              .map((p, index) => ({ ...p, index }))
              .filter(p => p.goal_id === goal.id);

            return (
              <Card key={goal.id} className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {goalProjects.map((project) => (
                    <div 
                      key={project.index} 
                      className="border border-border rounded-lg p-4 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-4">
                          {/* Title */}
                          <div className="space-y-2">
                            <Label>Project name</Label>
                            <Input
                              value={project.title}
                              onChange={(e) => updateProject(project.index, 'title', e.target.value)}
                              placeholder="e.g., Build landing page, Write first 3 chapters"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Definition of Done */}
                            <div className="space-y-2">
                              <Label>Definition of done</Label>
                              <Textarea
                                value={project.definition_of_done}
                                onChange={(e) => updateProject(project.index, 'definition_of_done', e.target.value)}
                                placeholder="This project is done when..."
                                className="min-h-[80px]"
                              />
                            </div>

                            {/* Due Date */}
                            <div className="space-y-2">
                              <Label>Due date (optional)</Label>
                              <Input
                                type="date"
                                value={project.due_date}
                                onChange={(e) => updateProject(project.index, 'due_date', e.target.value)}
                              />
                            </div>
                          </div>

                          {/* Next Action - REQUIRED */}
                          <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                              Next action
                              <span className="text-xs text-primary font-normal">(required)</span>
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              The smallest visible step you can do in one sitting.
                            </p>
                            <Input
                              value={project.next_action}
                              onChange={(e) => updateProject(project.index, 'next_action', e.target.value)}
                              placeholder="e.g., Draft hero section copy, Outline chapter 1"
                              className={!project.next_action.trim() && project.title.trim() ? 'border-warning' : ''}
                            />
                            {!project.next_action.trim() && project.title.trim() && (
                              <p className="text-xs text-warning">
                                Every project needs a next action
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProject(project.index)}
                          className="text-destructive ml-2"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  ))}

                  {goalProjects.length < 10 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => addProject(goal.id)}
                    >
                      + Add project
                    </Button>
                  )}

                  {goalProjects.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Add at least 1 project for this goal.
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

