'use client';
import { useId } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import type { Frame, Mark, VisualState } from '@/engine/types';
const ArchitectureView = dynamic(() => import('./architecture-view'), {
  ssr: false,
  loading: () => (
    <p role="status" className="grid h-80 place-items-center">
      Loading architecture diagram…
    </p>
  ),
});
import { VISUAL_COLORS } from '@/engine/visual-theme';
export { VISUAL_COLORS } from '@/engine/visual-theme';
const symbols: Record<Mark, string> = {
  default: '',
  comparing: '?',
  moving: '↔',
  visited: '✓',
  queued: 'Q',
  done: '✓',
  error: '!',
};
function mark(frame: Frame, id: string) {
  return frame.highlights.find((h) => h.id === id)?.kind ?? 'default';
}
type Props = { frame: Frame };
function SvgArray({
  frame,
  bars = false,
  stack = false,
  bits = false,
}: {
  frame: Frame;
  bars?: boolean;
  stack?: boolean;
  bits?: boolean;
}) {
  const reduced = useReducedMotion(),
    a = frame.state.values,
    max = Math.max(...a.map(Math.abs), 1),
    width = stack ? 320 : Math.max(320, a.length * 42 + 8),
    height = stack ? Math.max(250, a.length * 38 + 30) : 250;
  return (
    <div
      tabIndex={0}
      className="relative h-72 max-w-full overflow-auto"
      role="img"
      aria-label={`Current values: ${a.join(', ') || 'empty'}`}
    >
      <svg
        width={width}
        height={height}
        className="min-w-full"
        viewBox={`0 0 ${width} ${height}`}
      >
        <title>{frame.narration}</title>
        {a.map((value, i) => {
          const h = bars ? Math.max(14, (Math.abs(value) / max) * 165) : 34,
            x = stack ? 110 : i * 42 + 5,
            y = stack ? 20 + (a.length - 1 - i) * 38 : 205 - h,
            kind = mark(frame, String(i));
          return (
            <motion.g
              key={`${value}-${a.slice(0, i).filter((v) => v === value).length}`}
              animate={{ x, y }}
              transition={{ duration: reduced ? 0 : 0.18 }}
            >
              <rect
                width={stack ? 100 : 36}
                height={h}
                rx={bits ? 2 : 5}
                fill={VISUAL_COLORS[kind]}
                stroke="#33412d"
                strokeWidth={kind === 'comparing' ? 3 : 1}
                strokeDasharray={kind === 'queued' ? '3 2' : undefined}
              />
              <text
                x={stack ? 50 : 18}
                y={Math.min(h - 3, 22)}
                textAnchor="middle"
                fill="#15200d"
                fontFamily="monospace"
                fontSize="11"
              >
                {frame.state.labels?.[i] ?? value}
              </text>
              <text
                x={stack ? 105 : 18}
                y={stack ? 22 : h + 17}
                textAnchor={stack ? 'start' : 'middle'}
                fill="var(--foreground)"
                fontSize="10"
              >
                {stack && i === a.length - 1 ? '← TOP' : symbols[kind] || i}
              </text>
            </motion.g>
          );
        })}
      </svg>
      {!a.length && (
        <p className="absolute inset-0 grid place-items-center text-[var(--muted)]">
          Empty
        </p>
      )}
    </div>
  );
}
export function ArrayBars({ frame }: Props) {
  return <SvgArray frame={frame} bars />;
}
export function ArrayBoxes({ frame }: Props) {
  return <SvgArray frame={frame} />;
}
export function StackView({ frame }: Props) {
  return <SvgArray frame={frame} stack />;
}
export function QueueView({ frame }: Props) {
  return (
    <div>
      <p className="mb-2 font-mono text-xs text-[var(--muted)]">
        FRONT ← dequeue · enqueue → BACK
      </p>
      <ArrayBoxes frame={frame} />
    </div>
  );
}
export function StringView({ frame }: Props) {
  return <SvgArray frame={frame} />;
}
export function BitView({ frame }: Props) {
  return <SvgArray frame={frame} bits />;
}
function NodeDiagram({ frame }: Props) {
  const id = useId().replaceAll(':', '');
  const nodes = frame.state.nodes ?? [],
    edges = frame.state.edges ?? [];
  const width = Math.max(360, ...nodes.map((n) => n.x + 45)),
    height = Math.max(280, ...nodes.map((n) => n.y + 45));
  return (
    <div tabIndex={0} className="h-72 max-w-full overflow-auto">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="min-w-full"
        role="img"
        aria-label={`${frame.state.kind} visualization: ${frame.narration}`}
      >
        <defs>
          <marker
            id={id}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)" />
          </marker>
        </defs>
        {edges.map((e, i) => {
          const a = nodes.find((n) => n.id === e.from),
            b = nodes.find((n) => n.id === e.to);
          if (!a || !b) return null;
          const dx = b.x - a.x,
            dy = b.y - a.y,
            len = Math.hypot(dx, dy) || 1,
            x1 = a.x + (dx / len) * 22,
            y1 = a.y + (dy / len) * 22,
            x2 = b.x - (dx / len) * 24,
            y2 = b.y - (dy / len) * 24;
          const reverse = edges.some(
              (other) => other.from === e.to && other.to === e.from,
            ),
            curve = reverse ? 18 : 0;
          const cx = (x1 + x2) / 2 - (dy / len) * curve,
            cy = (y1 + y2) / 2 + (dx / len) * curve;
          return (
            <g key={`${e.from}-${e.to}-${i}`}>
              <path
                d={
                  a.id === b.id
                    ? `M ${a.x - 15} ${a.y - 15} C ${a.x - 60} ${a.y - 70}, ${a.x + 60} ${a.y - 70}, ${a.x + 15} ${a.y - 15}`
                    : `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`
                }
                fill="none"
                stroke="var(--muted)"
                strokeWidth="2"
                markerEnd={
                  frame.state.directed === false ? undefined : `url(#${id})`
                }
              />
              {e.label && (
                <text x={cx} y={cy - 5} fill="var(--foreground)" fontSize="10">
                  {e.label}
                </text>
              )}
            </g>
          );
        })}
        {nodes.map((n) => {
          const kind = mark(frame, n.id);
          return (
            <g key={n.id}>
              <circle
                cx={n.x}
                cy={n.y}
                r="22"
                fill={VISUAL_COLORS[kind]}
                stroke="#33412d"
                strokeWidth={kind === 'comparing' ? 3 : 1}
                strokeDasharray={kind === 'queued' ? '3 2' : undefined}
              />
              <text
                x={n.x}
                y={n.y + 4}
                textAnchor="middle"
                fontFamily="monospace"
                fill="#15200d"
                fontSize={n.label.length > 6 ? 8 : 11}
              >
                {n.label}
              </text>
              <text
                x={n.x + 19}
                y={n.y - 20}
                fill="var(--foreground)"
                fontSize="12"
              >
                {symbols[kind]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
export const GraphView = NodeDiagram;
export const TreeView = NodeDiagram;
export const RecursionTreeView = NodeDiagram;
export function LinkedListView({ frame }: Props) {
  const nodes =
    frame.state.nodes ??
    frame.state.values.map((value, i) => ({
      id: String(i),
      label: String(value),
      x: 40 + (i % 4) * 85,
      y: 40 + Math.floor(i / 4) * 75,
    }));
  const edges =
    frame.state.edges ??
    nodes.slice(1).map((n, i) => ({ from: nodes[i].id, to: n.id }));
  return (
    <NodeDiagram
      frame={{ ...frame, state: { ...frame.state, nodes, edges } }}
    />
  );
}
export function HeapView({ frame }: Props) {
  return (
    <>
      <NodeDiagram frame={frame} />
      <p className="my-2 text-xs text-[var(--muted)]">
        Backing array · children at 2i+1 and 2i+2
      </p>
      <div className="overflow-auto">
        <ArrayBoxes frame={frame} />
      </div>
    </>
  );
}
export function MatrixView({ frame }: Props) {
  const rows = frame.state.rows ?? [frame.state.values],
    cols = Math.max(1, ...rows.map((r) => r.length)),
    width = Math.max(320, (cols + 1) * 44),
    height = Math.max(180, (rows.length + 1) * 36);
  return (
    <div tabIndex={0} className="h-72 max-w-full overflow-auto">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Matrix visualization: ${frame.narration}`}
      >
        {rows.map((row, r) => (
          <g key={r}>
            <text
              x="3"
              y={(r + 1) * 36 + 21}
              fill="var(--foreground)"
              fontSize="10"
            >
              {frame.state.labels?.[r]?.slice(0, 6) ?? r}
            </text>
            {row.map((value, c) => {
              const kind = mark(frame, `${r},${c}`);
              return (
                <g
                  key={c}
                  transform={`translate(${(c + 1) * 44},${(r + 1) * 36})`}
                >
                  <rect
                    width="40"
                    height="32"
                    rx="4"
                    fill={VISUAL_COLORS[kind]}
                    stroke="#33412d"
                    strokeWidth={kind === 'comparing' ? 3 : 1}
                  />
                  <text
                    x="20"
                    y="21"
                    textAnchor="middle"
                    fill="#15200d"
                    fontFamily="monospace"
                    fontSize="11"
                  >
                    {frame.state.cellLabels?.[r]?.[c] ?? value}
                  </text>
                  {kind !== 'default' && (
                    <text x="34" y="10" fill="#15200d" fontSize="9">
                      {symbols[kind]}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        ))}
      </svg>
    </div>
  );
}
export const GridView = MatrixView;
export function HashTableView({ frame }: Props) {
  return (
    <div tabIndex={0} className="h-72 overflow-auto">
      <table className="w-full text-left font-mono text-sm">
        <caption className="mb-3 text-xs text-[var(--muted)]">
          Bucket → stored keys
        </caption>
        <tbody>
          {(frame.state.rows ?? []).map((row, i) => (
            <tr key={i} className="border-b border-[var(--border)]">
              <th className="p-3">{i}</th>
              <td
                className="p-3"
                style={{
                  color:
                    mark(frame, String(i)) === 'default'
                      ? 'var(--foreground)'
                      : '#15200d',
                  backgroundColor:
                    mark(frame, String(i)) === 'default'
                      ? undefined
                      : VISUAL_COLORS[mark(frame, String(i))],
                }}
              >
                {row.length ? row.join(' → ') : '∅'}{' '}
                {symbols[mark(frame, String(i))]}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function HanoiView({ frame }: Props) {
  const reduced = useReducedMotion(),
    pegs = frame.state.rows ?? [[], [], []];
  return (
    <svg
      viewBox="0 0 360 270"
      role="img"
      aria-label={`Hanoi board: ${frame.narration}`}
      className="h-72 w-full"
    >
      {[60, 180, 300].map((x, i) => (
        <g key={i}>
          <line
            x1={x}
            x2={x}
            y1="40"
            y2="220"
            stroke="var(--muted)"
            strokeWidth="5"
          />
          <line
            x1={x - 55}
            x2={x + 55}
            y1="222"
            y2="222"
            stroke="var(--muted)"
            strokeWidth="3"
          />
          <text
            x={x}
            y="250"
            textAnchor="middle"
            fill="var(--foreground)"
            fontFamily="monospace"
          >
            {'ABC'[i]}
          </text>
        </g>
      ))}
      {pegs.flatMap((peg, i) =>
        peg.map((disk, j) => {
          const width = 12 + disk * 12;
          return (
            <motion.g
              key={disk}
              initial={false}
              animate={{
                x: [60, 180, 300][i] - width / 2,
                y: 220 - (j + 1) * 20,
              }}
              transition={{ duration: reduced ? 0 : 0.15 }}
            >
              <rect
                width={width}
                height="18"
                rx="4"
                fill={frame.variables.disk === disk ? '#fdba74' : '#bef264'}
                stroke="#33412d"
              />
              <text
                x={width / 2}
                y="13"
                textAnchor="middle"
                fill="#15200d"
                fontSize="11"
              >
                {disk}
              </text>
            </motion.g>
          );
        }),
      )}
    </svg>
  );
}
export function VisualCanvas({ frame }: Props) {
  const renderers: Partial<
    Record<VisualState['kind'], React.ComponentType<Props>>
  > = {
    array: ArrayBars,
    growth: ArrayBars,
    boxes: ArrayBoxes,
    stack: StackView,
    graph: GraphView,
    tree: TreeView,
    grid: GridView,
    matrix: MatrixView,
    string: StringView,
    bits: BitView,
    'linked-list': LinkedListView,
    queue: QueueView,
    heap: HeapView,
    'hash-table': HashTableView,
    'recursion-tree': RecursionTreeView,
    hanoi: HanoiView,
    ring: GraphView,
  };
  if (frame.state.kind === 'architecture')
    return <ArchitectureView frame={frame} />;
  const Renderer = renderers[frame.state.kind] ?? ArrayBoxes;
  return <Renderer frame={frame} />;
}
export function VisualLegend() {
  return (
    <ul
      aria-label="Visualization legend"
      className="flex flex-wrap gap-3 text-xs text-[var(--muted)]"
    >
      {Object.entries(VISUAL_COLORS)
        .filter(([k]) => k !== 'error')
        .map(([k, v]) => (
          <li key={k} className="flex items-center gap-1">
            <span
              className="inline-block size-3 rounded-sm border border-zinc-600"
              style={{ background: v }}
            />
            {symbols[k as Mark]} {k}
          </li>
        ))}
    </ul>
  );
}
