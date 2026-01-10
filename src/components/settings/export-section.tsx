'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAllUserData, type ExportData } from '@/app/actions/export';
import { toast } from 'sonner';
import { Download, Printer } from 'lucide-react';

function generateMarkdown(data: ExportData): string {
  const lines: string[] = [];
  const exportDate = new Date(data.exportedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  lines.push('# My Northstar Report');
  lines.push(`Generated on: ${exportDate}`);
  lines.push('');

  // Year Theme & Vision
  if (data.yearCompass) {
    lines.push(`## Year Theme (${data.yearCompass.year})`);
    if (data.yearCompass.theme) {
      lines.push(`**Theme:** ${data.yearCompass.theme}`);
    }
    if (data.yearCompass.mission_statement) {
      lines.push(`**Mission:** ${data.yearCompass.mission_statement}`);
    }
    if (data.yearCompass.future_self_letter) {
      lines.push('');
      lines.push('### Letter to My Future Self');
      lines.push(data.yearCompass.future_self_letter);
    }
    if (data.yearCompass.feeling_goals && data.yearCompass.feeling_goals.length > 0) {
      lines.push('');
      lines.push('### How I Want to Feel');
      data.yearCompass.feeling_goals.forEach((feeling) => {
        lines.push(`- ${feeling}`);
      });
    }
    if (data.yearCompass.vision_scenes && data.yearCompass.vision_scenes.length > 0) {
      lines.push('');
      lines.push('### Vision Scenes');
      data.yearCompass.vision_scenes.forEach((scene, index) => {
        lines.push(`${index + 1}. ${scene}`);
      });
    }
    lines.push('');
  }

  // Identity Statements
  if (data.identityStatements.length > 0) {
    lines.push('## My Identity');
    data.identityStatements.forEach((statement) => {
      lines.push(`- "${statement.content}"`);
    });
    lines.push('');
  }

  // Core Values
  if (data.values.length > 0) {
    lines.push('## Core Values');
    const rankedValues = data.values.filter((v) => v.rank_order !== null);
    const otherValues = data.values.filter((v) => v.rank_order === null);

    rankedValues.forEach((value) => {
      const definition = value.definition ? ` - ${value.definition}` : '';
      lines.push(`${value.rank_order}. **${value.name}**${definition}`);
    });

    if (otherValues.length > 0) {
      lines.push('');
      lines.push('Other values:');
      otherValues.forEach((value) => {
        const definition = value.definition ? ` - ${value.definition}` : '';
        lines.push(`- ${value.name}${definition}`);
      });
    }
    lines.push('');
  }

  // Life Domains
  if (data.lifeDomains.length > 0) {
    lines.push('## Life Domains');
    data.lifeDomains.forEach((domain) => {
      lines.push(`### ${domain.name} (${domain.satisfaction_score}/10)`);
      if (domain.plus_two_definition) {
        lines.push(`*+2 looks like:* ${domain.plus_two_definition}`);
      }
    });
    lines.push('');
  }

  // Goals
  if (data.goals.length > 0) {
    lines.push('## Goals');
    data.goals.forEach((goal) => {
      const statusBadge = goal.status === 'active' ? '🎯' : goal.status === 'paused' ? '⏸️' : '📦';
      lines.push(`### ${statusBadge} ${goal.title}`);
      if (goal.why) {
        lines.push(`**Why:** ${goal.why}`);
      }
      if (goal.success_definition) {
        lines.push(`**Success looks like:** ${goal.success_definition}`);
      }
      if (goal.metric_name) {
        lines.push(
          `**Metric:** ${goal.metric_name} (${goal.metric_baseline ?? '?'} → ${goal.metric_target ?? '?'}, current: ${goal.metric_current ?? '?'})`
        );
      }
      if (goal.approach_phrase) {
        lines.push(`**Approach:** ${goal.approach_phrase}`);
      }
      if (goal.linkedValues && goal.linkedValues.length > 0) {
        lines.push(`**Linked values:** ${goal.linkedValues.map((v) => v.name).join(', ')}`);
      }
      lines.push('');
    });
  }

  // Projects
  if (data.projects.length > 0) {
    lines.push('## Projects');
    data.projects.forEach((project) => {
      const statusBadge = project.status === 'active' ? '📋' : project.status === 'paused' ? '⏸️' : '📦';
      lines.push(`### ${statusBadge} ${project.title}`);
      if (project.definition_of_done) {
        lines.push(`**Done when:** ${project.definition_of_done}`);
      }
      if (project.due_date) {
        lines.push(`**Due:** ${project.due_date}`);
      }
      if (project.tasks && project.tasks.length > 0) {
        lines.push('**Tasks:**');
        project.tasks.forEach((task) => {
          const checkbox = task.status === 'done' ? '[x]' : '[ ]';
          lines.push(`- ${checkbox} ${task.title}`);
        });
      }
      lines.push('');
    });
  }

  // Habits
  if (data.habits.length > 0) {
    lines.push('## Habits');
    data.habits.forEach((habit) => {
      const statusBadge = habit.status === 'active' ? '✅' : habit.status === 'paused' ? '⏸️' : '📦';
      lines.push(`### ${statusBadge} ${habit.name}`);
      if (habit.cue) {
        lines.push(`**Cue:** ${habit.cue}`);
      }
      if (habit.location) {
        lines.push(`**Location:** ${habit.location}`);
      }
      lines.push(`**Tracking:** ${habit.tracking_type} (${habit.weekly_target}x/week)`);
      if (habit.minimum_version) {
        lines.push(`**Minimum version:** ${habit.minimum_version}`);
      }
      lines.push('');
    });
  }

  // Lead Indicators
  if (data.leadIndicators.length > 0) {
    lines.push('## Lead Indicators');
    data.leadIndicators.forEach((indicator) => {
      lines.push(`- **${indicator.name}** - ${indicator.measure_type}, ${indicator.weekly_target}x/week`);
      if (indicator.minimum_version) {
        lines.push(`  - Minimum: ${indicator.minimum_version}`);
      }
    });
    lines.push('');
  }

  // WOOP Strategies
  if (data.woops.length > 0) {
    lines.push('## WOOP Strategies');
    data.woops.forEach((woop, index) => {
      lines.push(`### Strategy ${index + 1}`);
      if (woop.wish) lines.push(`**Wish:** ${woop.wish}`);
      if (woop.outcome) lines.push(`**Outcome:** ${woop.outcome}`);
      if (woop.obstacle) lines.push(`**Obstacle:** ${woop.obstacle}`);
      if (woop.plan) lines.push(`**Plan:** ${woop.plan}`);
      lines.push('');
    });
  }

  // If-Then Plans
  if (data.ifThenPlans.length > 0) {
    lines.push('## If-Then Plans');
    data.ifThenPlans.forEach((plan) => {
      lines.push(`- **If** ${plan.trigger}, **then** ${plan.response}`);
    });
    lines.push('');
  }

  // Settings & Visualization
  if (data.settings) {
    lines.push('## Personal Settings');
    if (data.settings.mantra) {
      lines.push(`**Mantra:** "${data.settings.mantra}"`);
    }
    if (data.settings.visualization_script) {
      lines.push('');
      lines.push('### Visualization Script');
      lines.push(data.settings.visualization_script);
    }
    if (data.settings.definition_of_win) {
      lines.push('');
      lines.push(`**Definition of Win:** ${data.settings.definition_of_win}`);
    }
    if (data.settings.non_negotiables) {
      lines.push(`**Non-negotiables:** ${data.settings.non_negotiables}`);
    }
    if (data.settings.anti_values) {
      lines.push(`**Anti-values:** ${data.settings.anti_values}`);
    }
    if (data.settings.common_derailers && data.settings.common_derailers.length > 0) {
      lines.push(`**Common derailers:** ${data.settings.common_derailers.join(', ')}`);
    }
    lines.push('');
  }

  // Baseline
  if (data.baseline) {
    lines.push('## Current Baseline');
    lines.push(`- Overwhelm level: ${data.baseline.overwhelm_level}/10`);
    lines.push(`- Motivation level: ${data.baseline.motivation_level}/10`);
    lines.push(`- Captured: ${new Date(data.baseline.captured_at).toLocaleDateString()}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('*Generated by Northstar*');

  return lines.join('\n');
}

function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ExportSection() {
  const [isPending, startTransition] = useTransition();
  const [isLoadingMd, setIsLoadingMd] = useState(false);

  const handleDownloadMarkdown = () => {
    setIsLoadingMd(true);
    startTransition(async () => {
      try {
        const result = await getAllUserData();
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.data) {
          const markdown = generateMarkdown(result.data);
          const date = new Date().toISOString().split('T')[0];
          downloadMarkdown(markdown, `northstar-report-${date}.md`);
          toast.success('Report downloaded successfully');
        }
      } catch {
        toast.error('Failed to generate report');
      } finally {
        setIsLoadingMd(false);
      }
    });
  };

  const handlePrintPDF = () => {
    // Open the export page in a new tab for printing
    window.open('/settings/export', '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Your Data</CardTitle>
        <CardDescription>
          Download a complete report of your goals, habits, values, and everything you've set up in Northstar.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Your report includes: Year theme, identity statements, core values, life domains, 
          goals, projects with tasks, habits, WOOP strategies, if-then plans, and personal settings.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleDownloadMarkdown}
            disabled={isPending || isLoadingMd}
            variant="outline"
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            {isLoadingMd ? 'Generating...' : 'Download Markdown'}
          </Button>
          
          <Button
            onClick={handlePrintPDF}
            disabled={isPending}
            className="flex-1"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print / Save as PDF
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          For PDF: A new page will open. Use your browser's print function (Ctrl/Cmd + P) and select "Save as PDF".
        </p>
      </CardContent>
    </Card>
  );
}
