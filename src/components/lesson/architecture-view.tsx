'use client';
import { ReactFlow, Background, Controls, MarkerType } from '@xyflow/react';
import { useReducedMotion } from 'framer-motion';
import { VISUAL_COLORS } from '@/engine/visual-theme';
import type { Frame } from '@/engine/types';
import '@xyflow/react/dist/style.css';
export default function ArchitectureView({ frame }: { frame: Frame }) {
  const reduced = useReducedMotion();
  const nodes = (frame.state.nodes ?? []).map((n) => ({
    id: n.id,
    position: { x: n.x, y: n.y },
    data: {
      label:
        n.label +
        (frame.highlights.some((h) => h.id === n.id && h.kind === 'error')
          ? ' ⚠'
          : ''),
    },
    style: {
      background: frame.highlights.some((h) => h.id === n.id)
        ? VISUAL_COLORS[frame.highlights.find((h) => h.id === n.id)!.kind]
        : 'var(--background)',
      color: frame.highlights.some((h) => h.id === n.id)
        ? '#18230d'
        : 'var(--foreground)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: 8,
      width: 140,
      fontSize: 12,
    },
  }));
  const edges = (frame.state.edges ?? []).map((e, i) => ({
    id: `${e.from}-${e.to}-${i}`,
    source: e.from,
    target: e.to,
    label: e.label,
    animated:
      !reduced &&
      frame.highlights.some(
        (h) => h.id === `${e.from}->${e.to}` && h.kind === 'moving',
      ),
    markerEnd: { type: MarkerType.ArrowClosed },
    style: {
      stroke: frame.highlights.some(
        (h) => h.id === `${e.from}->${e.to}` && h.kind === 'error',
      )
        ? '#dc2626'
        : 'var(--muted)',
    },
    labelStyle: { fill: 'var(--foreground)', fontSize: 10 },
    labelBgStyle: { fill: 'var(--background)' },
  }));
  return (
    <div className="h-80 w-full rounded-xl" aria-label={frame.narration}>
      <ReactFlow
        key={nodes.map((node) => node.id).join('|')}
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        panOnScroll
        zoomOnScroll={false}
        minZoom={0.2}
        maxZoom={2}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
