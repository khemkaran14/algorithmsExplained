import 'server-only';
import type { Visualizer, CaseStudySpec } from '@/engine/types';
/** Case content remains in server-only modules and is serialized only after entitlement checks. */
export function withCaseStudy<I>(
  visualizer: Visualizer<I>,
  spec: CaseStudySpec,
): Visualizer<I> {
  if (!spec.decisions.length)
    throw new Error('A case study needs design decisions.');
  return {
    ...visualizer,
    caseStudy: spec,
    *generate(input) {
      const generator = visualizer.generate(input),
        first = generator.next();
      if (first.done) return;
      const nodes = first.value.state.nodes ?? [],
        edges = first.value.state.edges ?? [];
      if (first.value.state.kind === 'architecture')
        for (let count = 1; count <= nodes.length; count++) {
          const visible = nodes.slice(0, count),
            ids = new Set(visible.map((n) => n.id));
          yield {
            ...structuredClone(first.value),
            state: {
              ...structuredClone(first.value.state),
              nodes: visible,
              edges: edges.filter((e) => ids.has(e.from) && ids.has(e.to)),
            },
            narration: `Introduce ${visible.at(-1)!.label}: ${spec.decisions[Math.min(count - 1, spec.decisions.length - 1)]}`,
            highlights: [{ id: visible.at(-1)!.id, kind: 'comparing' }],
          };
        }
      yield first.value;
      yield* generator;
    },
  };
}
