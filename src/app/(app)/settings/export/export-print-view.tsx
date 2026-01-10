'use client';

import { useEffect } from 'react';
import type { ExportData } from '@/app/actions/export';

interface ExportPrintViewProps {
  data: ExportData;
}

export function ExportPrintView({ data }: ExportPrintViewProps) {
  useEffect(() => {
    // Auto-trigger print dialog after a short delay
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const exportDate = new Date(data.exportedAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="print-container bg-white text-black min-h-screen p-8 max-w-4xl mx-auto">
      {/* Header */}
      <header className="mb-8 border-b-2 border-black pb-4">
        <h1 className="text-4xl font-bold mb-2">My Northstar Report</h1>
        <p className="text-gray-600">Generated on: {exportDate}</p>
      </header>

      {/* Year Theme & Vision */}
      {data.yearCompass && (
        <section className="mb-8 print-section">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">
            Year Theme ({data.yearCompass.year})
          </h2>
          {data.yearCompass.theme && (
            <p className="mb-2">
              <strong>Theme:</strong> {data.yearCompass.theme}
            </p>
          )}
          {data.yearCompass.mission_statement && (
            <p className="mb-2">
              <strong>Mission:</strong> {data.yearCompass.mission_statement}
            </p>
          )}
          {data.yearCompass.future_self_letter && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Letter to My Future Self</h3>
              <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded border">
                {data.yearCompass.future_self_letter}
              </p>
            </div>
          )}
          {data.yearCompass.feeling_goals && data.yearCompass.feeling_goals.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">How I Want to Feel</h3>
              <div className="flex flex-wrap gap-2">
                {data.yearCompass.feeling_goals.map((feeling, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                    {feeling}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.yearCompass.vision_scenes && data.yearCompass.vision_scenes.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Vision Scenes</h3>
              <ol className="list-decimal list-inside space-y-2">
                {data.yearCompass.vision_scenes.map((scene, i) => (
                  <li key={i}>{scene}</li>
                ))}
              </ol>
            </div>
          )}
        </section>
      )}

      {/* Identity Statements */}
      {data.identityStatements.length > 0 && (
        <section className="mb-8 print-section">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">My Identity</h2>
          <ul className="space-y-2">
            {data.identityStatements.map((statement) => (
              <li key={statement.id} className="italic text-lg">
                "{statement.content}"
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Core Values */}
      {data.values.length > 0 && (
        <section className="mb-8 print-section">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">Core Values</h2>
          <div className="space-y-2">
            {data.values
              .filter((v) => v.rank_order !== null)
              .map((value) => (
                <div key={value.id} className="flex gap-2">
                  <span className="font-bold w-6">{value.rank_order}.</span>
                  <div>
                    <span className="font-semibold">{value.name}</span>
                    {value.definition && (
                      <span className="text-gray-600"> — {value.definition}</span>
                    )}
                  </div>
                </div>
              ))}
            {data.values.filter((v) => v.rank_order === null).length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Other values:</p>
                <div className="flex flex-wrap gap-2">
                  {data.values
                    .filter((v) => v.rank_order === null)
                    .map((value) => (
                      <span key={value.id} className="px-3 py-1 bg-gray-100 rounded text-sm">
                        {value.name}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Life Domains */}
      {data.lifeDomains.length > 0 && (
        <section className="mb-8 print-section">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">Life Domains</h2>
          <div className="grid grid-cols-2 gap-4">
            {data.lifeDomains.map((domain) => (
              <div key={domain.id} className="border rounded p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold">{domain.name}</span>
                  <span className="text-lg font-bold">{domain.satisfaction_score}/10</span>
                </div>
                {domain.plus_two_definition && (
                  <p className="text-sm text-gray-600">+2 looks like: {domain.plus_two_definition}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Goals */}
      {data.goals.length > 0 && (
        <section className="mb-8 print-section">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">Goals</h2>
          <div className="space-y-6">
            {data.goals.map((goal) => (
              <div key={goal.id} className="border-l-4 border-gray-400 pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      goal.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : goal.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {goal.status}
                  </span>
                  <h3 className="text-xl font-semibold">{goal.title}</h3>
                </div>
                {goal.why && (
                  <p className="mb-1">
                    <strong>Why:</strong> {goal.why}
                  </p>
                )}
                {goal.success_definition && (
                  <p className="mb-1">
                    <strong>Success looks like:</strong> {goal.success_definition}
                  </p>
                )}
                {goal.metric_name && (
                  <p className="mb-1">
                    <strong>Metric:</strong> {goal.metric_name} ({goal.metric_baseline ?? '?'} →{' '}
                    {goal.metric_target ?? '?'}, current: {goal.metric_current ?? '?'})
                  </p>
                )}
                {goal.approach_phrase && (
                  <p className="mb-1">
                    <strong>Approach:</strong> {goal.approach_phrase}
                  </p>
                )}
                {goal.linkedValues && goal.linkedValues.length > 0 && (
                  <p className="text-sm text-gray-600">
                    Linked values: {goal.linkedValues.map((v) => v.name).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <section className="mb-8 print-section">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">Projects</h2>
          <div className="space-y-4">
            {data.projects.map((project) => (
              <div key={project.id} className="border rounded p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      project.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : project.status === 'paused'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {project.status}
                  </span>
                  <h3 className="text-lg font-semibold">{project.title}</h3>
                </div>
                {project.definition_of_done && (
                  <p className="text-sm mb-1">
                    <strong>Done when:</strong> {project.definition_of_done}
                  </p>
                )}
                {project.due_date && (
                  <p className="text-sm mb-2">
                    <strong>Due:</strong> {project.due_date}
                  </p>
                )}
                {project.tasks && project.tasks.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-sm font-medium mb-1">Tasks:</p>
                    <ul className="text-sm space-y-1">
                      {project.tasks.map((task) => (
                        <li key={task.id} className="flex items-center gap-2">
                          <span className={task.status === 'done' ? 'line-through text-gray-400' : ''}>
                            {task.status === 'done' ? '☑' : '☐'} {task.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Habits */}
      {data.habits.length > 0 && (
        <section className="mb-8 print-section">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">Habits</h2>
          <div className="space-y-3">
            {data.habits.map((habit) => (
              <div key={habit.id} className="border rounded p-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold">{habit.name}</h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      habit.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {habit.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  {habit.cue && <p>Cue: {habit.cue}</p>}
                  {habit.location && <p>Location: {habit.location}</p>}
                  <p>
                    Tracking: {habit.tracking_type} ({habit.weekly_target}x/week)
                  </p>
                  {habit.minimum_version && <p>Minimum version: {habit.minimum_version}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lead Indicators */}
      {data.leadIndicators.length > 0 && (
        <section className="mb-8 print-section">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">Lead Indicators</h2>
          <ul className="space-y-2">
            {data.leadIndicators.map((indicator) => (
              <li key={indicator.id} className="flex items-center gap-2">
                <span className="font-medium">{indicator.name}</span>
                <span className="text-sm text-gray-600">
                  — {indicator.measure_type}, {indicator.weekly_target}x/week
                </span>
                {indicator.minimum_version && (
                  <span className="text-sm text-gray-500">(min: {indicator.minimum_version})</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* WOOP Strategies */}
      {data.woops.length > 0 && (
        <section className="mb-8 print-section">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">WOOP Strategies</h2>
          <div className="space-y-4">
            {data.woops.map((woop, index) => (
              <div key={woop.id} className="border rounded p-4 bg-gray-50">
                <h3 className="font-semibold mb-2">Strategy {index + 1}</h3>
                {woop.wish && (
                  <p>
                    <strong>Wish:</strong> {woop.wish}
                  </p>
                )}
                {woop.outcome && (
                  <p>
                    <strong>Outcome:</strong> {woop.outcome}
                  </p>
                )}
                {woop.obstacle && (
                  <p>
                    <strong>Obstacle:</strong> {woop.obstacle}
                  </p>
                )}
                {woop.plan && (
                  <p>
                    <strong>Plan:</strong> {woop.plan}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* If-Then Plans */}
      {data.ifThenPlans.length > 0 && (
        <section className="mb-8 print-section">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">If-Then Plans</h2>
          <div className="space-y-2">
            {data.ifThenPlans.map((plan) => (
              <div key={plan.id} className="p-3 bg-gray-50 rounded">
                <p>
                  <strong>If</strong> {plan.trigger}, <strong>then</strong> {plan.response}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Settings */}
      {data.settings && (
        <section className="mb-8 print-section">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">Personal Settings</h2>
          {data.settings.mantra && (
            <p className="mb-2 text-lg italic">
              <strong>Mantra:</strong> "{data.settings.mantra}"
            </p>
          )}
          {data.settings.visualization_script && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Visualization Script</h3>
              <p className="whitespace-pre-wrap bg-gray-50 p-4 rounded border text-sm">
                {data.settings.visualization_script}
              </p>
            </div>
          )}
          {data.settings.definition_of_win && (
            <p className="mt-2">
              <strong>Definition of Win:</strong> {data.settings.definition_of_win}
            </p>
          )}
          {data.settings.non_negotiables && (
            <p className="mt-2">
              <strong>Non-negotiables:</strong> {data.settings.non_negotiables}
            </p>
          )}
          {data.settings.anti_values && (
            <p className="mt-2">
              <strong>Anti-values:</strong> {data.settings.anti_values}
            </p>
          )}
          {data.settings.common_derailers && data.settings.common_derailers.length > 0 && (
            <p className="mt-2">
              <strong>Common derailers:</strong> {data.settings.common_derailers.join(', ')}
            </p>
          )}
        </section>
      )}

      {/* Baseline */}
      {data.baseline && (
        <section className="mb-8 print-section">
          <h2 className="text-2xl font-bold mb-4 border-b border-gray-300 pb-2">Current Baseline</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded p-4 text-center">
              <p className="text-sm text-gray-600">Overwhelm Level</p>
              <p className="text-3xl font-bold">{data.baseline.overwhelm_level}/10</p>
            </div>
            <div className="border rounded p-4 text-center">
              <p className="text-sm text-gray-600">Motivation Level</p>
              <p className="text-3xl font-bold">{data.baseline.motivation_level}/10</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Captured: {new Date(data.baseline.captured_at).toLocaleDateString()}
          </p>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-4 border-t text-center text-gray-500 text-sm">
        <p>Generated by Northstar</p>
      </footer>

      {/* Print button (hidden when printing) */}
      <div className="fixed bottom-4 right-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="bg-black text-white px-6 py-3 rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
        >
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
}
