import 'server-only';
import { z } from 'zod';
import type { Visualizer } from '@/engine/types';
type Provider = 'aws' | 'gcp';
export type CloudInput<I> = I & { provider: Provider };
export type CloudMapping = {
  aws: string;
  gcp: string;
  notes: string;
  nodes?: Partial<Record<Provider, Record<string, string>>>;
};
/** Provider annotations do not pretend that equivalent concepts imply identical service semantics. */
export function withProvider<I extends object>(
  base: Visualizer<I>,
  slug: string,
  mapping: CloudMapping,
): Visualizer<CloudInput<I>> {
  const decorate = (input: I, provider: Provider = 'aws') => ({
    ...input,
    provider,
  });
  const core = (input: CloudInput<I>) => {
    const { provider, ...values } = input;
    z.enum(['aws', 'gcp']).parse(provider);
    return base.validateInput(values);
  };
  return {
    ...base,
    id: slug,
    inputHint: `${base.inputHint ?? ''} AWS: ${mapping.aws}. GCP: ${mapping.gcp}. ${mapping.notes} No cloud resources are created.`,
    controls: [
      {
        key: 'provider',
        label: 'Cloud mapping',
        type: 'select',
        options: [
          { value: 'aws', label: 'AWS' },
          { value: 'gcp', label: 'GCP' },
        ],
      },
      ...(base.controls ?? []).filter((c) => c.key !== 'provider'),
    ],
    presets: {
      best: decorate(base.presets.best),
      average: decorate(base.presets.average),
      worst: decorate(base.presets.worst),
      random: (n, seed) => decorate(base.presets.random(n, seed)),
    },
    validateInput(raw) {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw))
        throw new Error('Use a JSON scenario object.');
      const { provider = 'aws', ...values } = raw as Record<string, unknown>;
      return decorate(
        base.validateInput(values),
        z.enum(['aws', 'gcp']).parse(provider),
      );
    },
    measureSize: base.measureSize
      ? (input) => base.measureSize!(core(input))
      : undefined,
    *generate(input) {
      const service = mapping[input.provider];
      let first = true;
      for (const f of base.generate(core(input))) {
        if (first) {
          f.narration = `${service}: ${f.narration}`;
          first = false;
        }
        if (f.state.nodes)
          f.state.nodes = f.state.nodes.map((node) => ({
            ...node,
            label: mapping.nodes?.[input.provider]?.[node.id]
              ? `${mapping.nodes[input.provider]![node.id]} · ${node.label}`
              : node.label,
          }));
        if (f.state.result !== undefined) {
          const existing = f.state.result;
          f.state.result = {
            model: existing,
            cloud: { provider: input.provider, service, scope: mapping.notes },
          };
        }
        yield f;
      }
    },
  };
}
