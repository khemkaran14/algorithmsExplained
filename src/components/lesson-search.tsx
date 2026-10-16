'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import type { LessonMeta } from '@/content/catalog';
import { Button } from './ui/button';
export function LessonSearch() {
  const dialog = useRef<HTMLDialogElement>(null),
    input = useRef<HTMLInputElement>(null),
    [query, setQuery] = useState(''),
    [open, setOpen] = useState(false),
    [catalogData, setCatalogData] = useState<readonly LessonMeta[] | null>(
      null,
    ),
    [searchError, setSearchError] = useState('');
  const loadCatalog = useCallback(() => {
    setSearchError('');
    void import('@/content/catalog')
      .then((module) => setCatalogData(module.catalog))
      .catch(() => setSearchError('Search could not load. Please retry.'));
  }, []);
  useEffect(() => {
    if (open && !catalogData) loadCatalog();
  }, [open, catalogData, loadCatalog]);
  useEffect(() => {
    function key(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, []);
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      input.current?.focus();
    } else dialog.current?.close();
  }, [open]);
  const found = useMemo(() => {
    if (!open || !catalogData) return [];
    const tokens = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return catalogData
      .filter((l) =>
        tokens.every((word) =>
          word.startsWith('track:')
            ? l.track === word.slice(6)
            : word.startsWith('level:')
              ? l.level === word.slice(6)
              : `${l.title} ${l.description} ${l.tags.join(' ')} ${l.module}`
                  .toLowerCase()
                  .includes(word),
        ),
      )
      .slice(0, 40);
  }, [query, open, catalogData]);
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label="Search lessons (Ctrl or Command K)"
      >
        <Search size={16} />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden text-xs md:inline">⌘K</kbd>
      </Button>
      <dialog
        ref={dialog}
        onClose={() => setOpen(false)}
        aria-labelledby="lesson-search-title"
        className="m-auto max-h-[85dvh] w-[min(42rem,92vw)] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] p-0 text-[var(--foreground)] shadow-2xl backdrop:bg-black/60"
      >
        {open && (
          <>
            <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
              <h2 id="lesson-search-title" className="text-lg font-semibold">
                Find a lesson
              </h2>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
            <div className="p-4">
              <label htmlFor="lesson-search-query" className="sr-only">
                Search title, concept or tag
              </label>
              <input
                ref={input}
                id="lesson-search-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search algorithms, databases, cloud…"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"
              />
              <p className="mt-2 text-xs text-[var(--muted)]">
                Filters: track:dsa, track:system-design, track:databases,
                track:cloud, level:beginner
              </p>
            </div>
            <p role="status" className="px-4 text-xs text-[var(--muted)]">
              {catalogData
                ? found.length === 40
                  ? 'First 40 matches'
                  : `${found.length} matches`
                : searchError || 'Loading lesson catalog…'}
              {searchError && (
                <Button variant="outline" onClick={loadCatalog}>
                  Retry search
                </Button>
              )}
            </p>
            <ul className="max-h-[50dvh] overflow-auto p-3">
              {found.map((l) => (
                <li key={l.slug}>
                  <Link
                    href={`/learn/${l.track}/${l.module}/${l.slug}`}
                    onClick={() => setOpen(false)}
                    className="mb-1 block rounded-xl p-3 hover:bg-[var(--surface)] focus-visible:outline focus-visible:outline-2"
                  >
                    <span className="font-medium">{l.title}</span>
                    <span className="mt-1 block text-xs text-[var(--muted)]">
                      {l.track} · {l.level} ·{' '}
                      {l.status === 'planned'
                        ? 'Being authored'
                        : l.isFree
                          ? 'Free'
                          : 'All Access'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {catalogData && !found.length && (
              <p className="p-6 text-sm">
                No lessons match. Try a shorter phrase or remove a filter.
              </p>
            )}
          </>
        )}
      </dialog>
    </>
  );
}
