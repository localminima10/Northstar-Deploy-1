'use client';

import { useState } from 'react';
import { WizardShell } from '../wizard-shell';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { DEFAULT_LIFE_DOMAINS } from '@/lib/wizard-config';
import { Json } from '@/lib/types/database';

interface DomainItem {
  key: string;
  name: string;
  score: number;
  plus_two: string;
}

interface LifeDomainsStepProps {
  stepId: string;
  initialData: Json;
}

export function LifeDomainsStep({ stepId, initialData }: LifeDomainsStepProps) {
  const data = initialData as Record<string, unknown>;
  
  const [domains, setDomains] = useState<DomainItem[]>(
    (data.domains as DomainItem[]) || []
  );
  const [customDomain, setCustomDomain] = useState('');
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);

  const toggleDomain = (domain: { key: string; name: string }) => {
    const exists = domains.find(d => d.key === domain.key);
    if (exists) {
      setDomains(domains.filter(d => d.key !== domain.key));
    } else if (domains.length < 10) {
      setDomains([...domains, { ...domain, score: 5, plus_two: '' }]);
    }
  };

  const addCustomDomain = () => {
    if (customDomain.trim() && domains.length < 10) {
      const key = customDomain.toLowerCase().replace(/[^a-z0-9]/g, '_');
      setDomains([...domains, { key, name: customDomain.trim(), score: 5, plus_two: '' }]);
      setCustomDomain('');
    }
  };

  const updateScore = (key: string, score: number) => {
    setDomains(domains.map(d => d.key === key ? { ...d, score } : d));
  };

  const updatePlusTwo = (key: string, plus_two: string) => {
    setDomains(domains.map(d => d.key === key ? { ...d, plus_two } : d));
  };

  const formData = {
    domains,
  };

  const canProceed = domains.length >= 3;

  return (
    <WizardShell
      stepId={stepId}
      initialData={initialData}
      formData={formData}
      canProceed={canProceed}
    >
      <div className="space-y-8">
        {/* Domain Selection */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-medium">
              Choose the life areas you want to manage (3-10)
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              These are the domains you&apos;ll rate and review periodically.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {DEFAULT_LIFE_DOMAINS.map((domain) => {
              const isSelected = domains.some(d => d.key === domain.key);
              return (
                <Badge
                  key={domain.key}
                  variant={isSelected ? 'default' : 'outline'}
                  className="cursor-pointer text-sm py-1.5 px-3 hover:bg-accent"
                  onClick={() => toggleDomain(domain)}
                >
                  {domain.name}
                </Badge>
              );
            })}
          </div>
          
          {/* Add custom domain */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a custom life area..."
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustomDomain()}
              className="max-w-xs"
            />
            <Button onClick={addCustomDomain} variant="outline" disabled={domains.length >= 10}>
              Add
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            {domains.length}/10 areas selected
            {domains.length < 3 && ' (minimum 3)'}
          </p>
        </div>

        {/* Rate Selected Domains */}
        {domains.length > 0 && (
          <div className="space-y-4">
            <Label className="text-base font-medium">
              Rate your current satisfaction in each area
            </Label>
            
            <div className="space-y-4">
              {domains.map((domain) => (
                <div
                  key={domain.key}
                  className="border border-border rounded-lg p-4 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{domain.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleDomain({ key: domain.key, name: domain.name })}
                      className="text-destructive"
                    >
                      ×
                    </Button>
                  </div>
                  
                  {/* Satisfaction Score */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Satisfaction</span>
                      <span className="font-medium">{domain.score}/10</span>
                    </div>
                    <Slider
                      value={[domain.score]}
                      onValueChange={([value]) => updateScore(domain.key, value)}
                      min={0}
                      max={10}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  {/* Plus Two Definition */}
                  <div>
                    <button
                      onClick={() => setExpandedDomain(
                        expandedDomain === domain.key ? null : domain.key
                      )}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {expandedDomain === domain.key ? '▼' : '▶'} What would +2 improvement look like?
                    </button>
                    
                    {expandedDomain === domain.key && (
                      <Textarea
                        value={domain.plus_two}
                        onChange={(e) => updatePlusTwo(domain.key, e.target.value)}
                        placeholder={`If ${domain.name} improved by +2 points, what would be different?`}
                        className="mt-2 min-h-[80px] text-sm"
                        maxLength={400}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </WizardShell>
  );
}

