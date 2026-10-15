import { catalog } from '../src/content/catalog';
for (const track of [...new Set(catalog.map((l) => l.track))]) {
  const lessons = catalog.filter((l) => l.track === track);
  console.log(
    `${track}: ${lessons.filter((l) => l.isFree).length}/${lessons.length} free (${((lessons.filter((l) => l.isFree).length / lessons.length) * 100).toFixed(2)}%)`,
  );
}
const ratio = (catalog.filter((l) => l.isFree).length / catalog.length) * 100;
console.log(`Overall: ${ratio.toFixed(2)}% free`);
for (const key of new Set(catalog.map((l) => `${l.track}/${l.module}`)))
  if (!catalog.some((l) => `${l.track}/${l.module}` === key && l.isFree)) {
    console.error(`No free lesson in ${key}`);
    process.exitCode = 1;
  }
if (ratio < 18 || ratio > 22) process.exitCode = 1;
