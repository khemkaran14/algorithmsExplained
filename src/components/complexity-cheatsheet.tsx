'use client';
import { useState } from 'react';
import Link from 'next/link';
import { catalog, lessonUrl } from '@/content/catalog';
import rows from '@/content/complexity.json';
export function ComplexityCheatsheet() {
  const [query, setQuery] = useState(''),
    [module, setModule] = useState('all');
  const modules = [
      ...new Set(catalog.filter((l) => l.track === 'dsa').map((l) => l.module)),
    ],
    entries = rows
      .map((row) => ({ row, meta: catalog.find((l) => l.slug === row.slug)! }))
      .filter(
        ({ meta }) =>
          (module === 'all' || meta.module === module) &&
          `${meta.title} ${meta.module} ${meta.tags.join(' ')}`
            .toLowerCase()
            .includes(query.toLowerCase()),
      );
  return (
    <>
      <div className="my-6 flex flex-wrap gap-4">
        <label className="min-w-48 flex-1">
          Search algorithms
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3"
          />
        </label>
        <label>
          Category
          <select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="mt-2 block w-full rounded-xl border border-[var(--border)] bg-[var(--background)] p-3"
          >
            <option value="all">All categories</option>
            {modules.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
      </div>
      <p role="status" className="mb-3 text-sm text-[var(--muted)]">
        {entries.length} algorithms
      </p>
      <div
        tabIndex={0}
        aria-label="Scrollable algorithm complexity table"
        className="overflow-auto rounded-xl border border-[var(--border)]"
      >
        <table className="w-full min-w-[850px] text-left text-sm">
          <caption className="sr-only">
            Time and space complexity by algorithm
          </caption>
          <thead className="bg-[var(--surface)]">
            <tr>
              {[
                'Algorithm',
                'Best time',
                'Average time',
                'Worst time',
                'Space',
                'Properties',
              ].map((h) => (
                <th key={h} scope="col" className="p-4">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.map(({ row, meta }) => (
              <tr
                key={meta.slug}
                className="border-t border-[var(--border)] align-top"
              >
                <th scope="row" className="p-4 font-medium">
                  <Link className="underline" href={lessonUrl(meta)}>
                    {meta.title}
                  </Link>
                  <span className="mt-1 block text-xs font-normal text-[var(--muted)]">
                    {meta.module} ·{' '}
                    {meta.isFree ? 'Free lesson' : 'All Access lesson'}
                  </span>
                </th>
                {[row.best, row.average, row.worst, row.space].map(
                  (text, i) => (
                    <td key={i} className="p-4 font-mono text-xs">
                      {text}
                    </td>
                  ),
                )}
                <td className="p-4 text-xs">
                  {'stable' in row
                    ? row.stable
                      ? 'Stable'
                      : 'Not stable'
                    : '—'}
                  {'inPlace' in row
                    ? row.inPlace
                      ? ' · In place'
                      : ' · Extra storage'
                    : ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!entries.length && (
        <p className="my-6">No algorithms match these filters.</p>
      )}
      <p className="mt-5 text-sm text-[var(--muted)]">
        These are operation-count bounds under each lesson’s stated model, not
        CPU benchmarks. Output storage, arithmetic bit costs and distribution
        assumptions can change the relevant bound; open the lesson for its
        assumptions.
      </p>
    </>
  );
}
