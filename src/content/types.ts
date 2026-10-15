export type LessonMeta = {
  slug: string;
  title: string;
  description: string;
  track: string;
  module: string;
  order: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  isFree: boolean;
  prerequisites: readonly string[];
  tags: readonly string[];
  interviewFrequency?: string;
  status?: 'ready' | 'planned';
};
