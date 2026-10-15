'use client';
import { motion, useReducedMotion } from 'framer-motion';
import type { Frame, Mark } from '@/engine/types';
const colors: Record<Mark, string> = {
  default: '#bef264',
  comparing: '#c4b5fd',
  moving: '#fdba74',
  visited: '#7dd3fc',
  queued: '#fde047',
  done: '#86efac',
  error: '#fca5a5',
};
const symbols: Record<Mark, string> = {
  default: '',
  comparing: '?',
  moving: '↔',
  visited: '✓',
  queued: 'Q',
  done: '✓',
  error: '!',
};
export function VisualCanvas({ frame }: { frame: Frame }) {
  const reduced = useReducedMotion();
  const { state, highlights } = frame;
  const mark = (id: string) =>
    highlights.find((h) => h.id === id)?.kind ?? 'default';
  if (
    state.kind === 'graph' ||
    state.kind === 'tree' ||
    state.kind === 'architecture'
  ) {
    return (
      <svg
        viewBox="0 0 360 340"
        role="img"
        aria-label="Graph showing the current traversal"
        className="mx-auto h-72 w-full"
      >
        {state.edges?.map((e, i) => {
          const a = state.nodes?.find((n) => n.id === e.from),
            b = state.nodes?.find((n) => n.id === e.to);
          return a && b ? (
            <g key={i}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="var(--muted)"
                strokeWidth="2"
              />
              {e.label && (
                <text
                  x={(a.x + b.x) / 2}
                  y={(a.y + b.y) / 2}
                  fill="var(--foreground)"
                  fontSize="10"
                >
                  {e.label}
                </text>
              )}
            </g>
          ) : null;
        })}
        {state.nodes?.map((n) => (
          <g key={n.id}>
            <circle
              cx={n.x}
              cy={n.y}
              r="23"
              fill={colors[mark(n.id)]}
              stroke="#33412d"
              strokeWidth="2"
            />
            <text
              x={n.x}
              y={n.y + 5}
              textAnchor="middle"
              fontFamily="monospace"
              fill="#15200d"
              fontSize="13"
            >
              {n.label}
            </text>
            <text
              x={n.x + 19}
              y={n.y - 19}
              fill="var(--foreground)"
              fontSize="12"
            >
              {symbols[mark(n.id)]}
            </text>
          </g>
        ))}
      </svg>
    );
  }
  const max = Math.max(...state.values.map(Math.abs), 1);
  return (
    <div
      className="relative flex min-h-64 flex-col justify-end overflow-hidden"
      role="img"
      aria-label={`Current values: ${state.values.join(', ') || 'empty'}`}
    >
      <svg
        viewBox={`0 0 ${Math.max(320, state.values.length * 38)} 245`}
        className="h-64 w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {state.values.map((value, i) => {
          const stacked = state.kind === 'stack';
          const height =
            state.kind === 'array' || state.kind === 'growth'
              ? Math.max(12, (Math.abs(value) / max) * 160)
              : 38;
          const x = stacked ? 120 : i * 38 + 5,
            y = stacked ? 205 - i * 25 : 205 - height;
          const kind = mark(String(i));
          return (
            <motion.g
              key={`${value}-${state.values.slice(0, i).filter((v) => v === value).length}`}
              animate={{ x, y }}
              transition={{ duration: reduced ? 0 : 0.18 }}
            >
              <rect
                width={stacked ? 80 : 32}
                height={height}
                rx="5"
                fill={colors[kind]}
                stroke="#33412d"
                strokeWidth={kind === 'comparing' ? 3 : 1}
                strokeDasharray={kind === 'queued' ? '3 2' : undefined}
              />
              <text
                x={stacked ? 40 : 16}
                y={Math.min(height - 4, 22)}
                textAnchor="middle"
                fill="#15200d"
                fontFamily="monospace"
                fontSize="12"
              >
                {value}
              </text>
              <text
                x="16"
                y={height + 16}
                textAnchor="middle"
                fill="var(--foreground)"
                fontSize="10"
              >
                {symbols[kind] || i}
              </text>
            </motion.g>
          );
        })}
      </svg>
      {state.values.length === 0 && (
        <p className="absolute inset-0 grid place-items-center text-[var(--muted)]">
          Empty
        </p>
      )}
    </div>
  );
}
export function VisualLegend() {
  return (
    <ul
      aria-label="Visualization legend"
      className="flex flex-wrap gap-3 text-xs text-[var(--muted)]"
    >
      {Object.entries(colors)
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
