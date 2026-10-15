import { writeFile } from 'node:fs/promises';
import { catalog } from '../src/content/catalog';
async function main() {
  const ready = catalog.filter((l) => l.status !== 'planned');
  await writeFile(
    'src/content/quiz-index.ts',
    "import 'server-only';\nimport type {QuizQuestion} from './load';\nexport const quizLoaders:Record<string,()=>Promise<{default:QuizQuestion[]}>>={\n" +
      ready
        .map(
          (l) =>
            JSON.stringify(l.slug) +
            `:()=>import('../../content/${l.track}/${l.module}/${l.slug}/quiz'),`,
        )
        .join('\n') +
      '\n};\n',
  );
  await writeFile(
    'src/content/visualizer-index.ts',
    "import 'server-only';\nimport type {Visualizer} from '@/engine/types';\nexport const visualizerLoaders:Record<string,()=>Promise<{default:Visualizer<unknown>}>>={\n" +
      ready
        .map(
          (l) =>
            JSON.stringify(l.slug) +
            `:()=>import('../../content/${l.track}/${l.module}/${l.slug}/visualizer'),`,
        )
        .join('\n') +
      '\n};\n',
  );
  console.log(`Indexed ${ready.length} implemented lessons.`);
}
void main();
