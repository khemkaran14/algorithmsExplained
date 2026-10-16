// Fixed-majority admission and declared uncertainty wait; not full Spanner.
function commit(clock, previousTimestamp, epsilon, reachable, replicas, wait = true) {
  if (reachable < Math.floor(replicas / 2) + 1) return {acknowledged: false};
  const timestamp = Math.max(previousTimestamp + 1, clock + epsilon);
  const delay = wait ? Math.max(0, timestamp + epsilon + 1 - clock) : 0;
  clock += delay;
  return {acknowledged: true, clock, timestamp, delay, timingCondition: clock - epsilon > timestamp};
}
