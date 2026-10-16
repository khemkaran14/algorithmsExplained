'use client';
import { useTranslations } from 'next-intl';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
const initial = [3, 7, 4, 9, 2, 6];
export function MiniSort() {
  const uiText = useTranslations('ui');

  const [values, setValues] = useState(initial);
  const [cursor, setCursor] = useState(0);
  const sorted = values.every(
    (value, index) => index === 0 || values[index - 1] <= value,
  );
  function step() {
    const next = [...values];
    const index = cursor % (values.length - 1);
    if (next[index] > next[index + 1])
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setValues(next);
    setCursor(cursor + 1);
  }
  return (
    <div>
      <div
        role="img"
        aria-label={`Bubble sort values: ${values.join(', ')}`}
        className="flex h-52 items-end justify-center gap-2 sm:gap-4"
      >
        {values.map((n, i) => (
          <div
            key={i}
            className={`flex w-10 items-end justify-center rounded-t-lg pb-3 font-mono text-sm font-bold text-zinc-950 sm:w-12 ${i === cursor % 5 ? 'bg-violet-300' : 'bg-lime-300'}`}
            style={{ height: `${n * 10}%` }}
          >
            {n}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="outline" onClick={step} disabled={sorted}>
          {uiText('mf79072756e76')}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setValues(initial);
            setCursor(0);
          }}
        >
          {uiText('mdaee7606b339')}
        </Button>
        <Link
          className="self-center underline"
          href="/learn/dsa/sorting/bubble-sort"
        >
          {uiText('m4baf4e030ced')}
        </Link>
      </div>
      <p className="mt-2 text-xs" role="status">
        {sorted ? uiText('m911d30b1fe97') : uiText('ma330bd25c8ed')}
      </p>
    </div>
  );
}
