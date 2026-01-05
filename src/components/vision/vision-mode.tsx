'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { YearCompass, VisionTile, IdentityStatement, Goal } from '@/lib/types/database';

interface VisionModeProps {
  yearCompass: YearCompass | null;
  settings: { mantra: string | null; visualization_script: string | null } | null;
  visionTiles: VisionTile[];
  identityStatements?: IdentityStatement[];
  activeGoals?: Pick<Goal, 'id' | 'title' | 'approach_phrase'>[];
}

export function VisionMode({ yearCompass, settings, visionTiles, identityStatements = [], activeGoals = [] }: VisionModeProps) {
  const [activeTab, setActiveTab] = useState('board');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vision Mode</h1>
          <p className="text-muted-foreground">Visualize your future self</p>
        </div>
        <Button variant="outline" onClick={toggleFullscreen}>
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="board">Vision Board</TabsTrigger>
          <TabsTrigger value="letter">Future Self Letter</TabsTrigger>
          <TabsTrigger value="script">Visualization Script</TabsTrigger>
        </TabsList>

        {/* Vision Board */}
        <TabsContent value="board" className="mt-6">
          {/* Theme & Mantra */}
          {(yearCompass?.theme || settings?.mantra) && (
            <div className="text-center py-8 mb-6 bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 rounded-xl">
              {yearCompass?.theme && (
                <h2 className="text-4xl font-bold text-primary mb-3">
                  {yearCompass.theme}
                </h2>
              )}
              {settings?.mantra && (
                <p className="text-xl italic text-muted-foreground">
                  &ldquo;{settings.mantra}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Feeling Goals */}
          {yearCompass?.feeling_goals && yearCompass.feeling_goals.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {yearCompass.feeling_goals.map((feeling, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-accent/30 rounded-full text-accent-foreground font-medium"
                >
                  {feeling}
                </span>
              ))}
            </div>
          )}

          {/* Tiles Grid */}
          {visionTiles.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No vision tiles yet. Add images or text to your vision board.
                </p>
                <Button variant="outline">Add Vision Tile</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visionTiles.map((tile) => (
                <Card
                  key={tile.id}
                  className={`overflow-hidden transition-all hover:scale-105 ${
                    tile.pinned ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <CardContent className="p-0">
                    {tile.tile_type === 'text' ? (
                      <div className="aspect-square flex items-center justify-center p-4 bg-gradient-to-br from-accent/20 to-primary/10">
                        <p className="text-center text-sm font-medium">
                          {tile.text_content}
                        </p>
                      </div>
                    ) : (
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        <p className="text-xs text-muted-foreground">
                          [Image: {tile.image_path}]
                        </p>
                      </div>
                    )}
                    {tile.pinned && (
                      <div className="absolute top-2 right-2">
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                          Pinned
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Vision Scenes */}
          {yearCompass?.vision_scenes && yearCompass.vision_scenes.length > 0 && (
            <div className="mt-8 space-y-4">
              <h3 className="text-xl font-semibold">Vision Scenes</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {yearCompass.vision_scenes.map((scene, i) => (
                  <Card key={i}>
                    <CardContent className="pt-6">
                      <p className="text-sm italic text-muted-foreground">{scene}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Future Self Letter */}
        <TabsContent value="letter" className="mt-6">
          <Card className="max-w-3xl mx-auto">
            <CardContent className="pt-8 pb-12 px-8">
              {yearCompass?.future_self_letter ? (
                <ScrollArea className="h-[60vh]">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {yearCompass.future_self_letter}
                    </p>
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No future self letter written yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Write a letter from your future self, as if you&apos;ve already achieved your goals.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visualization Script */}
        <TabsContent value="script" className="mt-6">
          <Card className="max-w-3xl mx-auto">
            <CardContent className="pt-8 pb-12 px-8">
              {settings?.visualization_script ? (
                <ScrollArea className="h-[60vh]">
                  <div className="prose prose-lg dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap leading-relaxed">
                      {settings.visualization_script}
                    </p>
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No visualization script written yet.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Write a 60-120 second script you can read or listen to daily.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

