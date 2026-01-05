'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createInboxItem, processInboxItem } from '@/app/actions/inbox';
import { toast } from 'sonner';
import type { InboxItem, Goal, Project } from '@/lib/types/database';

interface InboxItemWithLinks extends InboxItem {
  linked_goal: { id: string; title: string } | null;
  linked_project: { id: string; title: string } | null;
}

interface InboxListProps {
  items: InboxItemWithLinks[];
  goals: Pick<Goal, 'id' | 'title'>[];
  projects: Pick<Project, 'id' | 'title'>[];
}

export function InboxList({ items, goals, projects }: InboxListProps) {
  const [isPending, startTransition] = useTransition();
  const [newItem, setNewItem] = useState('');
  const [processingItem, setProcessingItem] = useState<InboxItemWithLinks | null>(null);
  
  const inboxItems = items.filter(i => i.status === 'inbox');
  const processedItems = items.filter(i => i.status === 'processed');
  const archivedItems = items.filter(i => i.status === 'archived');
  
  const handleCapture = () => {
    if (!newItem.trim()) return;
    
    startTransition(async () => {
      const result = await createInboxItem({ content: newItem.trim() });
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Captured!');
        setNewItem('');
      }
    });
  };
  
  const handleProcess = (action: 'task' | 'project' | 'archive' | 'delete', options?: {
    projectId?: string;
    goalId?: string;
    title?: string;
  }) => {
    if (!processingItem) return;
    
    startTransition(async () => {
      const result = await processInboxItem(processingItem.id, action, options);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          action === 'task' ? 'Added to project as task' :
          action === 'project' ? 'Created as project' :
          action === 'archive' ? 'Archived' : 'Deleted'
        );
        setProcessingItem(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Quick Capture */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Quick Capture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="What's on your mind?"
              onKeyDown={(e) => e.key === 'Enter' && handleCapture()}
              className="flex-1"
            />
            <Button onClick={handleCapture} disabled={isPending || !newItem.trim()}>
              {isPending ? 'Saving...' : 'Capture'}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">To Process</p>
          <p className="text-2xl font-bold text-primary">{inboxItems.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Processed</p>
          <p className="text-2xl font-bold text-success">{processedItems.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Archived</p>
          <p className="text-2xl font-bold text-muted-foreground">{archivedItems.length}</p>
        </Card>
      </div>
      
      {/* Inbox Tabs */}
      <Tabs defaultValue="inbox" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="inbox">Inbox ({inboxItems.length})</TabsTrigger>
          <TabsTrigger value="processed">Processed ({processedItems.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archivedItems.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="inbox" className="mt-4">
          {inboxItems.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground text-lg mb-2">📥 Inbox Zero!</p>
              <p className="text-muted-foreground text-sm">Your mind is clear. Nice work!</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {inboxItems.map((item) => (
                <Card key={item.id} className="hover:bg-muted/30 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <p>{item.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button 
                      size="sm"
                      onClick={() => setProcessingItem(item)}
                    >
                      Process
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="processed" className="mt-4">
          {processedItems.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No processed items yet.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {processedItems.map((item) => (
                <Card key={item.id} className="bg-muted/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground">{item.content}</p>
                      <div className="flex gap-2 items-center">
                        {item.linked_project && (
                          <Badge variant="secondary" className="text-xs">
                            → {item.linked_project.title}
                          </Badge>
                        )}
                        {item.linked_goal && (
                          <Badge variant="outline" className="text-xs">
                            {item.linked_goal.title}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="archived" className="mt-4">
          {archivedItems.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No archived items.</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {archivedItems.map((item) => (
                <Card key={item.id} className="bg-muted/10 opacity-60">
                  <CardContent className="p-4">
                    <p className="text-muted-foreground">{item.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Process Dialog */}
      <Dialog open={!!processingItem} onOpenChange={(open) => !open && setProcessingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Inbox Item</DialogTitle>
          </DialogHeader>
          {processingItem && (
            <ProcessForm
              item={processingItem}
              goals={goals}
              projects={projects}
              onProcess={handleProcess}
              isPending={isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ProcessFormProps {
  item: InboxItemWithLinks;
  goals: Pick<Goal, 'id' | 'title'>[];
  projects: Pick<Project, 'id' | 'title'>[];
  onProcess: (action: 'task' | 'project' | 'archive' | 'delete', options?: {
    projectId?: string;
    goalId?: string;
    title?: string;
  }) => void;
  isPending: boolean;
}

function ProcessForm({ item, goals, projects, onProcess, isPending }: ProcessFormProps) {
  const [action, setAction] = useState<'task' | 'project' | 'archive' | 'delete'>('task');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [title, setTitle] = useState(item.content);
  
  return (
    <div className="space-y-4">
      <div className="p-3 bg-muted/30 rounded-lg">
        <p className="font-medium">{item.content}</p>
      </div>
      
      <div className="space-y-2">
        <Label>What do you want to do?</Label>
        <Select value={action} onValueChange={(v) => setAction(v as typeof action)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="task">Add as Task to a Project</SelectItem>
            <SelectItem value="project">Create as New Project</SelectItem>
            <SelectItem value="archive">Archive (not actionable)</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {action === 'task' && (
        <>
          <div className="space-y-2">
            <Label>Task Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Add to Project *</Label>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      
      {action === 'project' && (
        <>
          <div className="space-y-2">
            <Label>Project Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Link to Goal (optional)</Label>
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
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
        </>
      )}
      
      <div className="flex gap-2 pt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onProcess('archive')}
          disabled={isPending}
        >
          Archive
        </Button>
        <Button
          className="flex-1"
          onClick={() => onProcess(action, {
            projectId: selectedProject || undefined,
            goalId: selectedGoal || undefined,
            title: title || undefined,
          })}
          disabled={isPending || (action === 'task' && !selectedProject)}
        >
          {isPending ? 'Processing...' : 
           action === 'task' ? 'Add Task' :
           action === 'project' ? 'Create Project' :
           action === 'archive' ? 'Archive' : 'Delete'}
        </Button>
      </div>
    </div>
  );
}

