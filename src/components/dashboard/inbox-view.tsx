'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { createInboxItem, processInboxItem } from '@/app/actions/inbox';
import { InboxItem, Goal, Project } from '@/lib/types/database';

interface InboxItemWithRelations extends InboxItem {
  goal: { id: string; title: string } | null;
  project: { id: string; title: string } | null;
}

interface InboxViewProps {
  inboxItems: InboxItemWithRelations[];
  goals: Pick<Goal, 'id' | 'title'>[];
  projects: Pick<Project, 'id' | 'title'>[];
}

export function InboxView({ inboxItems, goals, projects }: InboxViewProps) {
  const [isPending, startTransition] = useTransition();
  const [newItem, setNewItem] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processAction, setProcessAction] = useState<'task' | 'project'>('task');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedGoal, setSelectedGoal] = useState<string>('');

  const handleAddItem = () => {
    if (!newItem.trim()) return;
    startTransition(async () => {
      await createInboxItem({ content: newItem });
      setNewItem('');
    });
  };

  const handleArchive = (itemId: string) => {
    startTransition(async () => {
      await processInboxItem(itemId, 'archive');
    });
  };

  const handleProcess = (itemId: string) => {
    startTransition(async () => {
      await processInboxItem(itemId, processAction, {
        projectId: processAction === 'task' ? selectedProject || undefined : undefined,
        goalId: processAction === 'project' ? selectedGoal || undefined : undefined,
      });
      setProcessingId(null);
      setProcessAction('task');
      setSelectedProject('');
      setSelectedGoal('');
    });
  };

  const handleDelete = (itemId: string) => {
    startTransition(async () => {
      await processInboxItem(itemId, 'delete');
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Inbox</h1>
        <p className="text-muted-foreground">Capture thoughts and process them into actions</p>
      </div>

      {/* Quick Add */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="Capture a thought, task, or idea..."
              onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              className="flex-1"
            />
            <Button onClick={handleAddItem} disabled={isPending || !newItem.trim()}>
              Add to Inbox
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inbox Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Unprocessed Items
            <Badge variant="secondary">{inboxItems.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inboxItems.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              Inbox zero! Nothing to process.
            </p>
          ) : (
            <div className="space-y-3">
              {inboxItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/30 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{item.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog open={processingId === item.id} onOpenChange={(open) => !open && setProcessingId(null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setProcessingId(item.id)}
                        >
                          Process
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Process Item</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <p className="text-sm text-muted-foreground">
                            &ldquo;{item.content}&rdquo;
                          </p>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Convert to:</label>
                            <Select 
                              value={processAction} 
                              onValueChange={(v) => setProcessAction(v as 'task' | 'project')}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="task">Task</SelectItem>
                                <SelectItem value="project">Project</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {processAction === 'task' && projects.length > 0 && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Add to project (optional):</label>
                              <Select value={selectedProject} onValueChange={setSelectedProject}>
                                <SelectTrigger>
                                  <SelectValue placeholder="No project" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">No project</SelectItem>
                                  {projects.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          {processAction === 'project' && goals.length > 0 && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Link to goal (optional):</label>
                              <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                                <SelectTrigger>
                                  <SelectValue placeholder="No goal" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="">No goal</SelectItem>
                                  {goals.map((g) => (
                                    <SelectItem key={g.id} value={g.id}>{g.title}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                          
                          <div className="flex gap-2 pt-4">
                            <Button 
                              onClick={() => handleProcess(item.id)}
                              disabled={isPending}
                            >
                              Create {processAction === 'task' ? 'Task' : 'Project'}
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => setProcessingId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleArchive(item.id)}
                      disabled={isPending}
                    >
                      Archive
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      disabled={isPending}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

