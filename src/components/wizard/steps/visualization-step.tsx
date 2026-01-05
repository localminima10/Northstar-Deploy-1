'use client';

import { useState } from 'react';
import { WizardShell } from '../wizard-shell';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DEFAULT_FEELINGS } from '@/lib/wizard-config';
import { Json } from '@/lib/types/database';

interface VisualizationStepProps {
  stepId: string;
  initialData: Json;
}

export function VisualizationStep({ stepId, initialData }: VisualizationStepProps) {
  const data = initialData as Record<string, unknown>;
  const currentYear = new Date().getFullYear();
  
  const [futureSelfLetter, setFutureSelfLetter] = useState<string>(
    (data.future_self_letter as string) || ''
  );
  const [feelingGoals, setFeelingGoals] = useState<string[]>(
    (data.feeling_goals as string[]) || []
  );
  const [customFeeling, setCustomFeeling] = useState('');
  const [visionScenes, setVisionScenes] = useState<string>(
    (data.vision_scenes as string[])?.join('\n\n') || ''
  );
  const [mantra, setMantra] = useState<string>((data.mantra as string) || '');
  const [visualizationScript, setVisualizationScript] = useState<string>(
    (data.visualization_script as string) || ''
  );

  const toggleFeeling = (feeling: string) => {
    if (feelingGoals.includes(feeling)) {
      setFeelingGoals(feelingGoals.filter(f => f !== feeling));
    } else if (feelingGoals.length < 7) {
      setFeelingGoals([...feelingGoals, feeling]);
    }
  };

  const addCustomFeeling = () => {
    if (customFeeling.trim() && feelingGoals.length < 7) {
      setFeelingGoals([...feelingGoals, customFeeling.trim()]);
      setCustomFeeling('');
    }
  };

  const formData = {
    future_self_letter: futureSelfLetter,
    feeling_goals: feelingGoals,
    vision_scenes: visionScenes.split('\n\n').filter(s => s.trim()),
    mantra,
    visualization_script: visualizationScript,
  };

  return (
    <WizardShell
      stepId={stepId}
      initialData={initialData}
      formData={formData}
      canProceed={true}
    >
      <div className="space-y-10">
        {/* Future Self Letter */}
        <div className="space-y-3">
          <Label htmlFor="futureSelfLetter" className="text-base font-medium">
            Write a letter from Dec 31, {currentYear} — as if you achieved your goals
          </Label>
          <p className="text-sm text-muted-foreground">
            Describe outcomes, habits, and how you feel. Write in present tense.
          </p>
          <Textarea
            id="futureSelfLetter"
            value={futureSelfLetter}
            onChange={(e) => setFutureSelfLetter(e.target.value)}
            placeholder={`Dear ${currentYear} me,

As I write this on December 31st, I can't believe how much has changed. I finally [achieved goal]. I wake up every day feeling [emotion]. My morning routine includes [habit]. 

The biggest surprise was [unexpected win]. I've become the kind of person who [identity statement].

Looking back, the key to this year was [insight].

With pride and gratitude,
Future Me`}
            className="min-h-[250px]"
            maxLength={2000}
          />
        </div>

        {/* Feeling Goals */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              Choose 3-7 feelings you want to experience regularly in {currentYear}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              These become anchors for your visualization practice.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {DEFAULT_FEELINGS.map((feeling) => {
              const isSelected = feelingGoals.includes(feeling);
              return (
                <Badge
                  key={feeling}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer text-sm py-1.5 px-3 hover:bg-accent"
                  onClick={() => toggleFeeling(feeling)}
                >
                  {feeling}
                </Badge>
              );
            })}
          </div>
          
          {/* Custom feeling */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a custom feeling..."
              value={customFeeling}
              onChange={(e) => setCustomFeeling(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomFeeling()}
              className="max-w-xs"
            />
          </div>
          
          <p className="text-sm text-muted-foreground">
            {feelingGoals.length}/7 feelings selected
          </p>
        </div>

        {/* Vision Scenes */}
        <div className="space-y-3">
          <Label htmlFor="visionScenes" className="text-base font-medium">
            Describe 3 vivid scenes of your ideal {currentYear} (1-4 sentences each)
          </Label>
          <p className="text-sm text-muted-foreground">
            Separate scenes with a blank line. Be specific and sensory.
          </p>
          <Textarea
            id="visionScenes"
            value={visionScenes}
            onChange={(e) => setVisionScenes(e.target.value)}
            placeholder={`Morning: I wake at 6am without an alarm. Sunlight fills my room. I stretch, drink water, and sit down for 20 minutes of focused writing before my coffee. I feel clear and purposeful.

Midday: I'm deep in flow on a project I love. My workspace is organized. I take a break to walk outside and feel the sun on my face. My body feels strong from consistent exercise.

Evening: I close my laptop at 6pm. I cook a healthy meal while music plays. I have energy for my hobbies and relationships. I fall asleep easily, knowing I made progress today.`}
            className="min-h-[200px]"
            maxLength={1200}
          />
        </div>

        {/* Mantra */}
        <div className="space-y-3">
          <Label htmlFor="mantra" className="text-base font-medium">
            Write a short mantra for {currentYear} (one line)
          </Label>
          <p className="text-sm text-muted-foreground">
            Something you can repeat to yourself daily.
          </p>
          <Input
            id="mantra"
            value={mantra}
            onChange={(e) => setMantra(e.target.value)}
            placeholder="I am building a life I don't need a vacation from."
            maxLength={120}
          />
        </div>

        {/* Visualization Script */}
        <div className="space-y-3">
          <Label htmlFor="visualizationScript" className="text-base font-medium">
            Optional: Write a 60-120 second visualization script
          </Label>
          <p className="text-sm text-muted-foreground">
            A guided visualization you can read or listen to daily.
          </p>
          <Textarea
            id="visualizationScript"
            value={visualizationScript}
            onChange={(e) => setVisualizationScript(e.target.value)}
            placeholder={`Close your eyes and take three deep breaths.

Imagine it's December 31st, ${currentYear}. You're looking back at an incredible year.

See yourself waking up in your ideal morning. Feel the energy in your body. Notice how calm and focused your mind is.

Walk through your perfect day. See yourself doing the work you love. Feel the satisfaction of progress. Notice how you handle challenges with grace.

Feel the emotions: pride, gratitude, peace, confidence.

This is who you're becoming. This is what you're building.

Take a deep breath and carry this feeling into your day.`}
            className="min-h-[200px]"
            maxLength={1500}
          />
        </div>
      </div>
    </WizardShell>
  );
}

