import { isDeepStrictEqual } from 'node:util';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { catalog } from '../src/content/catalog';
import type { Visualizer, Lang } from '../src/engine/types';
const files: Record<Lang, string> = {
  javascript: 'js.ts',
  python: 'py.py',
  java: 'java.java',
  cpp: 'cpp.cpp',
};
async function validateVisualizer(v: Visualizer<unknown>, base: string) {
  const lines = {} as Record<Lang, number>;
  for (const lang of Object.keys(files) as Lang[]) {
    const code = await readFile(path.join(base, files[lang]), 'utf8');
    if (!code.trim()) throw Error(`Empty ${lang} code`);
    lines[lang] = code.trimEnd().split('\n').length;
  }
  for (const raw of [
    v.presets.best,
    v.presets.average,
    v.presets.worst,
    v.presets.random(8, 42),
  ]) {
    const input = v.validateInput(raw),
      before = structuredClone(input),
      frames = [...v.generate(input)];
    if (frames.length < 2 || frames.length > 10000)
      throw Error('Trace must contain 2–10000 useful frames');
    if (!isDeepStrictEqual(input, before))
      throw Error('Generator mutated its input');
    let previous: Record<string, number> = {};
    for (const f of frames) {
      if (!f.narration || !f.state || !f.counters)
        throw Error('Incomplete frame');
      for (const lang of Object.keys(lines) as Lang[])
        if (
          !Number.isInteger(f.codeLine[lang]) ||
          f.codeLine[lang] < 1 ||
          f.codeLine[lang] > lines[lang]
        )
          throw Error(
            `${lang} code line ${f.codeLine[lang]} is outside snippet`,
          );
      if (!isDeepStrictEqual(JSON.parse(JSON.stringify(f)), f))
        throw Error('Nonserializable frame');
      for (const [key, value] of Object.entries(f.counters))
        if (
          !Number.isFinite(value) ||
          value < 0 ||
          value < (previous[key] ?? 0)
        )
          throw Error(`Invalid or decreasing ${key} counter`);
      previous = f.counters;
      if (
        f.action &&
        (f.action.choices.length < 2 ||
          new Set(f.action.choices).size !== f.action.choices.length ||
          !f.action.choices.includes(f.action.answer) ||
          !f.action.hint)
      )
        throw Error('Challenge has invalid choices, answer or hint');
    }
  }
}
async function main() {
  const { compile } = await import('@mdx-js/mdx');
  const track = process.argv.find((v) => v.startsWith('--track='))?.slice(8);
  if (track && !catalog.some((l) => l.track === track))
    throw Error('Unknown track scope');
  const selected = track ? catalog.filter((l) => l.track === track) : catalog;
  let errors = 0,
    planned = 0;
  const allowPlanned = process.argv.includes('--allow-planned'),
    slugs = new Set<string>();
  for (const meta of selected) {
    try {
      if (slugs.has(meta.slug)) throw Error('Duplicate lesson slug');
      slugs.add(meta.slug);
      if (
        !meta.title ||
        !meta.description ||
        !meta.track ||
        !meta.module ||
        meta.estimatedMinutes < 1
      )
        throw Error('Incomplete lesson metadata');
      if (meta.status === 'planned') {
        if (!allowPlanned) throw Error('Lesson content is still planned.');
        planned++;
        continue;
      }
      const base = path.join(
          process.cwd(),
          'content',
          meta.track,
          meta.module,
          meta.slug,
        ),
        mdx = await readFile(path.join(base, 'lesson.mdx'), 'utf8');
      await compile(mdx, { outputFormat: 'function-body' });
      for (const section of [
        'Hook',
        'Watch',
        'How it works',
        'Try it',
        'Complexity',
        'Code',
        'When to use',
        'Interview pitfalls',
        'Quiz',
      ])
        if (!mdx.includes(`## ${section}`))
          throw Error(`Missing section: ${section}`);
      const v = (
        await import(pathToFileURL(path.join(base, 'visualizer.ts')).href)
      ).default as Visualizer<unknown>;
      await validateVisualizer(v, path.join(base, 'code'));
      for (const [variant, alternate] of Object.entries(v.variants ?? {})) {
        if (!/^[a-z0-9-]{1,80}$/.test(variant))
          throw Error('Invalid variant ID');
        try {
          await validateVisualizer(
            alternate.visualizer,
            path.join(base, 'code', variant),
          );
        } catch (e) {
          throw Error(
            `Variant ${variant}: ${e instanceof Error ? e.message : 'invalid'}`,
          );
        }
      }
      const quiz = (
        await import(pathToFileURL(path.join(base, 'quiz.ts')).href)
      ).default as { choices: string[]; answer: number; explanation: string }[];
      if (
        quiz.length < 3 ||
        quiz.length > 6 ||
        quiz.some(
          (q) =>
            !Number.isInteger(q.answer) ||
            !q.choices[q.answer] ||
            !q.explanation,
        )
      )
        throw Error(
          'Quiz needs 3–6 questions with valid answers and explanations',
        );
      console.log(`✓ ${meta.track}/${meta.module}/${meta.slug}`);
    } catch (error) {
      errors++;
      console.error(
        `✗ ${meta.slug}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }
  if (errors) process.exitCode = 1;
  else
    console.log(
      `Validated ${selected.length - planned} complete lessons; ${planned} planned lessons remain.`,
    );
}
void main();
