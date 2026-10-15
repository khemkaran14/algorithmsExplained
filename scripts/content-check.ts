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
async function main() {
  let errors = 0;
  const slugs = new Set<string>();
  for (const meta of catalog) {
    try {
      if (slugs.has(meta.slug)) throw new Error('Duplicate lesson slug');
      slugs.add(meta.slug);
      if (
        !meta.title ||
        !meta.description ||
        !meta.track ||
        !meta.module ||
        meta.estimatedMinutes < 1
      )
        throw new Error('Incomplete lesson metadata');
      const base = path.join(
        process.cwd(),
        'content',
        meta.track,
        meta.module,
        meta.slug,
      );
      const mdx = await readFile(path.join(base, 'lesson.mdx'), 'utf8');
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
          throw new Error(`Missing section: ${section}`);
      const lines = {} as Record<Lang, number>;
      for (const lang of Object.keys(files) as Lang[]) {
        const code = await readFile(
          path.join(base, 'code', files[lang]),
          'utf8',
        );
        if (!code.trim()) throw new Error(`Empty ${lang} code`);
        lines[lang] = code.trimEnd().split('\n').length;
      }
      const v = (
        await import(pathToFileURL(path.join(base, 'visualizer.ts')).href)
      ).default as Visualizer;
      for (const preset of [
        v.presets.best,
        v.presets.average,
        v.presets.worst,
        v.presets.random(8, 42),
      ]) {
        const frames = [...v.generate(v.validateInput(preset))];
        if (frames.length < 2)
          throw new Error('Visualizer has no useful trace');
        for (const f of frames) {
          if (!f.narration || !f.state || !f.counters)
            throw new Error('Incomplete frame');
          for (const lang of Object.keys(lines) as Lang[])
            if (f.codeLine[lang] < 1 || f.codeLine[lang] > lines[lang])
              throw new Error(
                `${lang} code line ${f.codeLine[lang]} is outside snippet`,
              );
          if (
            JSON.stringify(JSON.parse(JSON.stringify(f))) !== JSON.stringify(f)
          )
            throw new Error('Nonserializable frame');
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
        throw new Error(
          'Quiz needs 3–6 questions with a valid answer and explanation',
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
  else console.log(`Validated ${catalog.length} complete lessons.`);
}
void main();
