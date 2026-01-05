'use client';

import { useState } from 'react';
import { WizardShell } from '../wizard-shell';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DEFAULT_VALUES } from '@/lib/wizard-config';
import { Json } from '@/lib/types/database';

interface ValueItem {
  name: string;
  definition: string;
  rank_order: number | null;
}

interface ValuesStepProps {
  stepId: string;
  initialData: Json;
}

export function ValuesStep({ stepId, initialData }: ValuesStepProps) {
  const data = initialData as Record<string, unknown>;
  
  const [selectedValues, setSelectedValues] = useState<ValueItem[]>(
    (data.values as ValueItem[]) || []
  );
  const [customValue, setCustomValue] = useState('');
  const [antiValues, setAntiValues] = useState<string>((data.anti_values as string) || '');
  const [editingDefinition, setEditingDefinition] = useState<string | null>(null);

  const toggleValue = (valueName: string) => {
    const exists = selectedValues.find(v => v.name === valueName);
    if (exists) {
      setSelectedValues(selectedValues.filter(v => v.name !== valueName));
    } else if (selectedValues.length < 7) {
      setSelectedValues([...selectedValues, { name: valueName, definition: '', rank_order: null }]);
    }
  };

  const addCustomValue = () => {
    if (customValue.trim() && selectedValues.length < 7) {
      setSelectedValues([...selectedValues, { name: customValue.trim(), definition: '', rank_order: null }]);
      setCustomValue('');
    }
  };

  const updateDefinition = (valueName: string, definition: string) => {
    setSelectedValues(selectedValues.map(v => 
      v.name === valueName ? { ...v, definition } : v
    ));
  };

  const moveValue = (index: number, direction: 'up' | 'down') => {
    const newValues = [...selectedValues];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newValues.length) {
      [newValues[index], newValues[newIndex]] = [newValues[newIndex], newValues[index]];
      // Update rank orders for top 5
      newValues.forEach((v, i) => {
        v.rank_order = i < 5 ? i + 1 : null;
      });
      setSelectedValues(newValues);
    }
  };

  const formData = {
    values: selectedValues.map((v, i) => ({
      ...v,
      rank_order: i < 5 ? i + 1 : null,
    })),
    anti_values: antiValues,
  };

  const canProceed = selectedValues.length >= 3;

  return (
    <WizardShell
      stepId={stepId}
      initialData={initialData}
      formData={formData}
      canProceed={canProceed}
    >
      <div className="space-y-8">
        {/* Value Selection */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              Select your core values for 2026 (choose 3-7)
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Click to select, then drag to rank your top 5
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {DEFAULT_VALUES.map((value) => {
              const isSelected = selectedValues.some(v => v.name === value);
              return (
                <Badge
                  key={value}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer text-sm py-1.5 px-3 hover:bg-accent"
                  onClick={() => toggleValue(value)}
                >
                  {value}
                </Badge>
              );
            })}
          </div>
          
          {/* Add custom value */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a custom value..."
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomValue()}
              className="max-w-xs"
            />
            <Button onClick={addCustomValue} variant="outline" disabled={selectedValues.length >= 7}>
              Add
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {selectedValues.length}/7 values selected
            {selectedValues.length < 3 && ' (minimum 3)'}
          </p>
        </div>

        {/* Selected Values with Ranking and Definitions */}
        {selectedValues.length > 0 && (
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Define and rank your values (top 5 will be ranked)
            </Label>
            
            <div className="space-y-3">
              {selectedValues.map((value, index) => (
                <div
                  key={value.name}
                  className="border border-border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {index < 5 && (
                        <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center font-medium">
                          {index + 1}
                        </span>
                      )}
                      <span className="font-medium">{value.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveValue(index, 'up')}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveValue(index, 'down')}
                        disabled={index === selectedValues.length - 1}
                      >
                        ↓
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleValue(value.name)}
                        className="text-destructive"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                  
                  {editingDefinition === value.name ? (
                    <div className="space-y-2">
                      <Textarea
                        value={value.definition}
                        onChange={(e) => updateDefinition(value.name, e.target.value)}
                        placeholder={`What does ${value.name} mean in daily behavior? (e.g., "Integrity = I do what I said I would do.")`}
                        className="text-sm"
                        maxLength={400}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingDefinition(null)}
                      >
                        Done
                      </Button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingDefinition(value.name)}
                      className="text-sm text-muted-foreground hover:text-foreground text-left w-full"
                    >
                      {value.definition || `Click to define what ${value.name} means to you...`}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Anti-values */}
        <div className="space-y-3">
          <Label htmlFor="antiValues" className="text-base font-medium">
            What do you refuse to sacrifice in 2026? (Optional)
          </Label>
          <p className="text-sm text-muted-foreground">
            Examples: sleep, health, family time, honesty, mental peace.
          </p>
          <Textarea
            id="antiValues"
            value={antiValues}
            onChange={(e) => setAntiValues(e.target.value)}
            placeholder="I refuse to sacrifice..."
            className="min-h-[100px]"
            maxLength={500}
          />
        </div>
      </div>
    </WizardShell>
  );
}

