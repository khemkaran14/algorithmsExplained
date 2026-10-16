// One request-weighted rolling-window evaluation; null means no observation.
function evaluate(samples, sloPercent, burnThreshold, missingPolicy) {
  const valid = samples.filter(x => x !== null);
  const missing = valid.length !== samples.length;
  const requests = valid.reduce((n, x) => n + x.requests, 0);
  const errors = valid.reduce((n, x) => n + x.errors, 0);
  const burn = requests ? errors / requests / (1 - sloPercent / 100) : null;
  const evaluation = missing && missingPolicy === 'breaching' ? 'breaching' : missing && missingPolicy === 'unknown' ? 'unknown' : burn === null ? 'unknown' : burn >= burnThreshold ? 'breaching' : 'healthy';
  return {requests, errors, burn, evaluation};
}
