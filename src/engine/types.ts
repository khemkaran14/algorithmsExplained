export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
export const LANGUAGES = ['javascript', 'python', 'java', 'cpp'] as const;
export type Lang = (typeof LANGUAGES)[number];
export type Mark =
  'default' | 'comparing' | 'moving' | 'visited' | 'queued' | 'done' | 'error';
export type Highlight = { id: string; kind: Mark };
export type VisualState = {
  kind:
    | 'array'
    | 'boxes'
    | 'stack'
    | 'graph'
    | 'growth'
    | 'tree'
    | 'grid'
    | 'architecture'
    | 'bits'
    | 'string'
    | 'linked-list'
    | 'queue'
    | 'heap'
    | 'hash-table'
    | 'matrix'
    | 'recursion-tree'
    | 'hanoi'
    | 'ring';
  values: number[];
  labels?: string[];
  nodes?: { id: string; label: string; x: number; y: number }[];
  edges?: { from: string; to: string; label?: string }[];
  rows?: number[][];
  cellLabels?: string[][];
  directed?: boolean;
  result?: JsonValue;
  provider?: 'aws' | 'gcp';
};
export type Counters = {
  comparisons: number;
  swaps: number;
  reads: number;
  writes: number;
  [key: string]: number;
};
export type Frame<S = VisualState> = {
  state: S;
  highlights: Highlight[];
  codeLine: Record<Lang, number>;
  narration: string;
  counters: Counters;
  variables: Record<string, string | number | boolean | null>;
  callStack?: string[];
  action?: { prompt: string; choices: string[]; answer: string; hint: string };
};
export type ComplexityInfo = {
  metric?: { label: string; keys: string[] };
  best: string;
  average: string;
  worst: string;
  space: string;
  why: string;
  stable?: boolean;
  inPlace?: boolean;
};
export type CaseStudySpec = {
  requirements: string[];
  assumptions: {
    dailyActors: number;
    requestsPerActor: number;
    peakMultiplier: number;
    payloadBytes: number;
    retentionDays: number;
  };
  apis: { method: string; path: string; purpose: string }[];
  entities: { name: string; fields: string }[];
  decisions: string[];
  breakInstructions: string;
};
export type LessonControl = {
  key: string;
  label: string;
  type: 'number' | 'select' | 'boolean';
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
};
export interface Visualizer<Input = number[], S = VisualState> {
  id: string;
  presetLabels?: { best: string; average: string; worst: string };
  inputHint?: string;
  controls?: LessonControl[];
  caseStudy?: CaseStudySpec;
  maxSize?: number;
  measureSize?(input: Input): number;
  variantTitle?: string;
  variants?: Record<string, { title: string; visualizer: Visualizer<unknown> }>;
  generate(input: Input): Generator<Frame<S>>;
  presets: {
    best: Input;
    average: Input;
    worst: Input;
    random: (n: number, seed?: number) => Input;
  };
  validateInput(raw: unknown): Input;
  complexity: ComplexityInfo;
}
