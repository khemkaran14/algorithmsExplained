export type ReviewState = {
  interval: number;
  repetitions: number;
  ease: number;
  due: string;
};
export function scheduleReview(
  previous: ReviewState | undefined,
  quality: 0 | 3 | 4 | 5,
  now = new Date(),
): ReviewState {
  let repetitions = previous?.repetitions ?? 0;
  let interval = previous?.interval ?? 0;
  const ease = Math.max(
    1.3,
    (previous?.ease ?? 2.5) +
      (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)),
  );
  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    interval =
      repetitions === 0
        ? 1
        : repetitions === 1
          ? 6
          : Math.round(interval * ease);
    repetitions++;
  }
  const due = new Date(now);
  due.setUTCDate(due.getUTCDate() + interval);
  return { interval, repetitions, ease, due: due.toISOString() };
}
