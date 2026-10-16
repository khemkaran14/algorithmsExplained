'use client';
import { useState } from 'react';
import type { CaseStudySpec } from '@/engine/types';
export function CaseStudyOverview({ spec }: { spec: CaseStudySpec }) {
  const [assumptions, setAssumptions] = useState(spec.assumptions),
    daily = assumptions.dailyActors * assumptions.requestsPerActor,
    average = daily / 86400,
    peak = average * assumptions.peakMultiplier,
    storage =
      (daily * assumptions.payloadBytes * assumptions.retentionDays) /
      1024 ** 3;
  const fields = [
    ['dailyActors', 'Daily actors', 1, 1000000000],
    ['requestsPerActor', 'Requests per actor/day', 1, 10000],
    ['peakMultiplier', 'Peak multiplier', 1, 100],
    ['payloadBytes', 'Bytes per stored request', 0, 10000000],
    ['retentionDays', 'Retention days', 1, 3650],
  ] as const;
  return (
    <section
      aria-label="System design exercise"
      className="mb-8 space-y-5 rounded-2xl border border-[var(--border)] p-5"
    >
      <h2 className="text-2xl font-semibold">Design the system</h2>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 font-semibold">Requirements and scope</h3>
          <ul className="list-disc space-y-2 pl-5 text-sm">
            {spec.requirements.map((text) => (
              <li key={text}>{text}</li>
            ))}
          </ul>
        </div>
        <form onSubmit={(e) => e.preventDefault()}>
          <fieldset>
            <legend className="mb-3 font-semibold">Estimate demand</legend>
            <div className="grid grid-cols-2 gap-3">
              {fields.map(([key, label, min, max]) => (
                <label key={key} className="min-w-0 text-xs">
                  {label}
                  <input
                    type="number"
                    min={min}
                    max={max}
                    value={assumptions[key]}
                    onChange={(e) =>
                      setAssumptions((old) => ({
                        ...old,
                        [key]: Math.min(
                          max,
                          Math.max(min, Number(e.target.value) || min),
                        ),
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] p-2"
                  />
                </label>
              ))}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt>Average requests/s</dt>
                <dd className="font-mono">{average.toFixed(2)}</dd>
              </div>
              <div>
                <dt>Peak requests/s</dt>
                <dd className="font-mono">{peak.toFixed(2)}</dd>
              </div>
              <div>
                <dt>Requests/day</dt>
                <dd className="font-mono">{daily.toLocaleString('en-US')}</dd>
              </div>
              <div>
                <dt>Raw retained GiB</dt>
                <dd className="font-mono">{storage.toFixed(2)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs text-[var(--muted)]">
              RPS = daily actors × requests per actor ÷ 86,400. Storage excludes
              indexes, replicas, compression and protocol overhead. These
              estimates and the small teaching trace use different scales.
            </p>
          </fieldset>
        </form>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 font-semibold">Exercise API contract</h3>
          <ul className="space-y-3 text-sm">
            {spec.apis.map((api) => (
              <li key={`${api.method}:${api.path}`}>
                <code className="break-all font-mono text-xs">
                  {api.method} {api.path}
                </code>
                <p className="text-[var(--muted)]">{api.purpose}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 font-semibold">Core data model</h3>
          <dl className="space-y-3 text-sm">
            {spec.entities.map((entity) => (
              <div key={entity.name}>
                <dt className="font-medium">{entity.name}</dt>
                <dd className="break-words font-mono text-xs text-[var(--muted)]">
                  {entity.fields}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
      <details>
        <summary className="cursor-pointer font-semibold">
          Progressive design decisions
        </summary>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
          {spec.decisions.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ol>
      </details>
      <p className="rounded-xl bg-[var(--surface)] p-4 text-sm">
        <strong>Break the design: </strong>
        {spec.breakInstructions}
      </p>
      <p className="text-xs text-[var(--muted)]">
        These API paths describe the exercise system; they are not AlgoVerse
        endpoints.
      </p>
    </section>
  );
}
