// @vitest-environment node
import { createRequire } from 'node:module';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { expect, it } from 'vitest';
const require = createRequire(import.meta.url);
it('the ESLint glob replacement preserves the directory API used by the Next plugin', () => {
  const fromConfig = createRequire(require.resolve('eslint-config-next'));
  const fromPlugin = createRequire(
    fromConfig.resolve('@next/eslint-plugin-next'),
  );
  const glob = fromPlugin('fast-glob');
  expect(
    glob
      .globSync('src/*', { cwd: process.cwd(), onlyDirectories: true })
      .map((directory: string) => resolve(directory)),
  ).toContain(resolve('src/app'));
});
it('the patched Lighthouse YAML loader accepts ordinary config and rejects executable YAML tags', () => {
  const fromCli = createRequire(require.resolve('@lhci/cli/package.json'));
  const { loadRcFile } = fromCli('@lhci/utils/src/lighthouserc.js');
  const directory = mkdtempSync(join(tmpdir(), 'algoverse-lhci-config-'));
  try {
    const file = join(directory, 'lighthouserc.yaml');
    writeFileSync(file, 'ci:\n  collect:\n    numberOfRuns: 1\n');
    expect(loadRcFile(file).ci.collect.numberOfRuns).toBe(1);
    writeFileSync(file, 'value: !!js/function "function () { return 42; }"\n');
    expect(() => loadRcFile(file)).toThrow();
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
it('the patched locale build plugin loads with the supported compiler setup', () => {
  expect(typeof require('next-intl/plugin')).toBe('function');
});
