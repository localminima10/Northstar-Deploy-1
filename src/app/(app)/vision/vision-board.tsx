'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { createVisionTile, updateVisionTile, deleteVisionTile, togglePinTile } from '@/app/actions/vision';
import { toast } from 'sonner';
import type { YearCompass, VisionTile, IdentityStatement, Goal } from '@/lib/types/database';

interface VisionBoardProps {
  yearCompass: YearCompass | null;
  visionTiles: VisionTile[];
  identityStatements: IdentityStatement[];
  settings: { mantra: string | null; visualization_script: string | null } | null;
  activeGoals: Pick<Goal, 'id' | 'title' | 'approach_phrase'>[];
}

export function VisionBoard({
  yearCompass,
  visionTiles,
  identityStatements,
  settings,
  activeGoals,
}: VisionBoardProps) {
  const [isPending, startTransition] = useTransition();
  const [showNewTile, setShowNewTile] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const pinnedTiles = visionTiles.filter(t => t.pinned);
  const unpinnedTiles = visionTiles.filter(t => !t.pinned);
  
  const handleTogglePin = (tileId: string) => {
    startTransition(async () => {
      const result = await togglePinTile(tileId);
      if (result.error) {
        toast.error(result.error);
      }
    });
  };
  
  const handleDeleteTile = (tileId: string) => {
    startTransition(async () => {
      const result = await deleteVisionTile(tileId);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Tile deleted');
      }
    });
  };
  
  // Create slides for fullscreen mode
  const slides = [
    { type: 'theme', content: yearCompass },
    ...visionTiles.map(tile => ({ type: 'tile', content: tile })),
    { type: 'letter', content: yearCompass?.future_self_letter },
    { type: 'identity', content: identityStatements },
    { type: 'script', content: settings?.visualization_script },
  ].filter(slide => {
    if (slide.type === 'theme') return yearCompass?.theme;
    if (slide.type === 'letter') return yearCompass?.future_self_letter;
    if (slide.type === 'identity') return identityStatements.length > 0;
    if (slide.type === 'script') return settings?.visualization_script;
    return true;
  });

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center p-8">
        <button 
          onClick={() => setIsFullscreen(false)}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
        >
          ✕ Exit
        </button>
        
        <div className="max-w-4xl w-full text-center">
          {slides[currentSlide]?.type === 'theme' && (
            <div className="space-y-6">
              {yearCompass?.theme && (
                <h1 className="text-5xl font-bold text-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {yearCompass.theme}
                </h1>
              )}
              {yearCompass?.mission_statement && (
                <p className="text-xl text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                  {yearCompass.mission_statement}
                </p>
              )}
              {settings?.mantra && (
                <p className="text-2xl text-accent-foreground bg-accent/20 inline-block px-6 py-3 rounded-full animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
                  {settings.mantra}
                </p>
              )}
            </div>
          )}
          
          {slides[currentSlide]?.type === 'tile' && (
            <div className="animate-in fade-in zoom-in duration-500">
              {(slides[currentSlide].content as VisionTile).tile_type === 'text' ? (
                <div className="bg-card/50 backdrop-blur rounded-2xl p-12 max-w-2xl mx-auto">
                  <p className="text-3xl font-medium">
                    {(slides[currentSlide].content as VisionTile).text_content}
                  </p>
                </div>
              ) : (
                <div className="bg-card/50 backdrop-blur rounded-2xl p-8 max-w-lg mx-auto">
                  <p className="text-muted-foreground">Vision Image</p>
                </div>
              )}
            </div>
          )}
          
          {slides[currentSlide]?.type === 'letter' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold mb-6 text-primary">Letter to My Future Self</h2>
              <ScrollArea className="h-[60vh] bg-card/30 backdrop-blur rounded-xl p-8 text-left">
                <p className="text-lg whitespace-pre-wrap">
                  {yearCompass?.future_self_letter}
                </p>
              </ScrollArea>
            </div>
          )}
          
          {slides[currentSlide]?.type === 'identity' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-primary">I Am...</h2>
              {identityStatements.map((statement, index) => (
                <p 
                  key={statement.id}
                  className="text-2xl italic animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  "{statement.content}"
                </p>
              ))}
            </div>
          )}
          
          {slides[currentSlide]?.type === 'script' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold mb-6 text-primary">Visualization</h2>
              <ScrollArea className="h-[60vh] bg-card/30 backdrop-blur rounded-xl p-8 text-left">
                <p className="text-lg whitespace-pre-wrap leading-relaxed">
                  {settings?.visualization_script}
                </p>
              </ScrollArea>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
            disabled={currentSlide === 0}
          >
            ← Previous
          </Button>
          <span className="text-muted-foreground">
            {currentSlide + 1} / {slides.length}
          </span>
          <Button
            variant="ghost"
            onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
            disabled={currentSlide === slides.length - 1}
          >
            Next →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Theme */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,200,100,0.1),transparent_50%)]" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="space-y-4">
            {yearCompass?.theme && (
              <div>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  2026 Theme
                </p>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {yearCompass.theme}
                </h1>
              </div>
            )}
            
            {yearCompass?.mission_statement && (
              <p className="text-lg text-muted-foreground max-w-2xl">
                {yearCompass.mission_statement}
              </p>
            )}
            
            {settings?.mantra && (
              <p className="text-accent-foreground bg-accent/30 inline-block px-4 py-2 rounded-full">
                {settings.mantra}
              </p>
            )}
          </div>
          
          <Button 
            size="lg"
            onClick={() => {
              setCurrentSlide(0);
              setIsFullscreen(true);
            }}
            className="flex-shrink-0"
          >
            ✦ Enter Vision Mode
          </Button>
        </div>
        
        {/* Feeling Goals */}
        {yearCompass?.feeling_goals && yearCompass.feeling_goals.length > 0 && (
          <div className="relative z-10 mt-6 pt-6 border-t border-border/30">
            <p className="text-sm text-muted-foreground mb-2">How I want to feel:</p>
            <div className="flex flex-wrap gap-2">
              {yearCompass.feeling_goals.map((feeling, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {feeling}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Tabs */}
      <Tabs defaultValue="tiles" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tiles">Vision Board</TabsTrigger>
          <TabsTrigger value="letter">Future Self Letter</TabsTrigger>
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>
        
        {/* Vision Tiles */}
        <TabsContent value="tiles" className="mt-6">
          <div className="space-y-6">
            {/* Add Tile Button */}
            <Dialog open={showNewTile} onOpenChange={setShowNewTile}>
              <DialogTrigger asChild>
                <Button className="w-full">+ Add Vision Tile</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Vision Tile</DialogTitle>
                </DialogHeader>
                <TileForm
                  onSubmit={async (data) => {
                    startTransition(async () => {
                      const result = await createVisionTile(data);
                      if (result.error) {
                        toast.error(result.error);
                      } else {
                        toast.success('Tile added!');
                        setShowNewTile(false);
                      }
                    });
                  }}
                  isPending={isPending}
                />
              </DialogContent>
            </Dialog>
            
            {/* Pinned Tiles */}
            {pinnedTiles.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <span className="text-primary">📌</span> Pinned
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pinnedTiles.map((tile) => (
                    <TileCard
                      key={tile.id}
                      tile={tile}
                      onTogglePin={() => handleTogglePin(tile.id)}
                      onDelete={() => handleDeleteTile(tile.id)}
                      isPending={isPending}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* All Tiles */}
            <div>
              {pinnedTiles.length > 0 && (
                <h3 className="text-lg font-medium mb-3">All Tiles</h3>
              )}
              {unpinnedTiles.length === 0 && pinnedTiles.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No vision tiles yet. Add your first tile to start building your vision board!
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {unpinnedTiles.map((tile) => (
                    <TileCard
                      key={tile.id}
                      tile={tile}
                      onTogglePin={() => handleTogglePin(tile.id)}
                      onDelete={() => handleDeleteTile(tile.id)}
                      isPending={isPending}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Future Self Letter */}
        <TabsContent value="letter" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Letter to My Future Self</CardTitle>
            </CardHeader>
            <CardContent>
              {yearCompass?.future_self_letter ? (
                <div className="bg-muted/30 rounded-lg p-6">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {yearCompass.future_self_letter}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  No future self letter written yet. Complete the visualization step in onboarding to add one.
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Vision Scenes */}
          {yearCompass?.vision_scenes && yearCompass.vision_scenes.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Vision Scenes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {yearCompass.vision_scenes.map((scene, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Scene {index + 1}</p>
                    <p>{scene}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        {/* Identity */}
        <TabsContent value="identity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Identity Statements</CardTitle>
            </CardHeader>
            <CardContent>
              {identityStatements.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No identity statements yet. Complete the identity step in onboarding to add them.
                </p>
              ) : (
                <div className="space-y-4">
                  {identityStatements.map((statement) => (
                    <div 
                      key={statement.id}
                      className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg"
                    >
                      <p className="text-lg italic">
                        "I am {statement.content}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Goals */}
        <TabsContent value="goals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Goals</CardTitle>
            </CardHeader>
            <CardContent>
              {activeGoals.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No active goals yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {activeGoals.map((goal) => (
                    <div 
                      key={goal.id}
                      className="p-4 border rounded-lg"
                    >
                      <h4 className="font-medium">{goal.title}</h4>
                      {goal.approach_phrase && (
                        <p className="text-sm text-muted-foreground mt-1 italic">
                          {goal.approach_phrase}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface TileCardProps {
  tile: VisionTile;
  onTogglePin: () => void;
  onDelete: () => void;
  isPending: boolean;
}

function TileCard({ tile, onTogglePin, onDelete, isPending }: TileCardProps) {
  return (
    <Card className={`relative overflow-hidden group ${tile.pinned ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4 h-40 flex items-center justify-center">
        {tile.tile_type === 'text' ? (
          <p className="text-center font-medium">{tile.text_content}</p>
        ) : (
          <div className="text-muted-foreground text-sm">Image Tile</div>
        )}
      </CardContent>
      
      {/* Overlay Controls */}
      <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={onTogglePin}
          disabled={isPending}
        >
          {tile.pinned ? 'Unpin' : 'Pin'}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={isPending}
        >
          Delete
        </Button>
      </div>
      
      {/* Pin indicator */}
      {tile.pinned && (
        <div className="absolute top-2 right-2 text-primary">📌</div>
      )}
      
      {/* Tags */}
      {tile.tags && tile.tags.length > 0 && (
        <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1">
          {tile.tags.slice(0, 2).map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
}

interface TileFormProps {
  onSubmit: (data: {
    tile_type: 'image' | 'text';
    text_content?: string;
    tags?: string[];
    pinned?: boolean;
  }) => void;
  isPending: boolean;
}

function TileForm({ onSubmit, isPending }: TileFormProps) {
  const [tileType, setTileType] = useState<'text' | 'image'>('text');
  const [textContent, setTextContent] = useState('');
  const [tags, setTags] = useState('');
  const [pinned, setPinned] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      tile_type: tileType,
      text_content: tileType === 'text' ? textContent : undefined,
      tags: tags.split(',').map(t => t.trim()).filter(t => t),
      pinned,
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Tile Type</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={tileType === 'text' ? 'default' : 'outline'}
            onClick={() => setTileType('text')}
            className="flex-1"
          >
            Text
          </Button>
          <Button
            type="button"
            variant={tileType === 'image' ? 'default' : 'outline'}
            onClick={() => setTileType('image')}
            className="flex-1"
            disabled
          >
            Image (coming soon)
          </Button>
        </div>
      </div>
      
      {tileType === 'text' && (
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="A powerful affirmation, quote, or vision..."
            rows={4}
            required
          />
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma-separated)</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="health, career, mindset"
        />
      </div>
      
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={pinned}
          onChange={(e) => setPinned(e.target.checked)}
          className="rounded"
        />
        <span className="text-sm">Pin this tile</span>
      </label>
      
      <Button type="submit" disabled={isPending || (tileType === 'text' && !textContent.trim())} className="w-full">
        {isPending ? 'Adding...' : 'Add Tile'}
      </Button>
    </form>
  );
}

