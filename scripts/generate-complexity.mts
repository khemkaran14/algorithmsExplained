import { writeFile } from 'node:fs/promises';
import { catalog } from '../src/content/catalog';
import { visualizerLoaders } from '../src/content/visualizer-index';
const rows = [];
for (const meta of catalog.filter(
  (l) => l.track === 'dsa' && l.status !== 'planned',
)) {
  const { complexity } = (await visualizerLoaders[meta.slug]()).default;
  rows.push({
    slug: meta.slug,
    best: complexity.best,
    average: complexity.average,
    worst: complexity.worst,
    space: complexity.space,
    ...(complexity.stable === undefined ? {} : { stable: complexity.stable }),
    ...(complexity.inPlace === undefined
      ? {}
      : { inPlace: complexity.inPlace }),
  });
}
await writeFile(
  'src/content/complexity.json',
  JSON.stringify(rows, null, 2) + '\n',
);
console.log(
  `Generated public complexity metadata for ${rows.length} algorithms; no frames, code, quizzes or lesson prose.`,
);
