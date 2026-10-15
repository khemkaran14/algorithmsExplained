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
};
import lesson0 from '../../content/dsa/foundations/big-o/meta';
import lesson1 from '../../content/dsa/sorting/bubble-sort/meta';
import lesson2 from '../../content/dsa/searching/binary-search/meta';
import lesson3 from '../../content/dsa/linear/stack/meta';
import lesson4 from '../../content/dsa/graphs/bfs/meta';
export const catalog: readonly LessonMeta[] = [
  lesson0,
  lesson1,
  lesson2,
  lesson3,
  lesson4,
];
export function lessonUrl(l: LessonMeta) {
  return `/learn/${l.track}/${l.module}/${l.slug}`;
}
