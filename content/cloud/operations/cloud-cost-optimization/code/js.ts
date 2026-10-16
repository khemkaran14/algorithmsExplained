// Assumed USD rates, decimal KB/GB; excludes unlisted billing dimensions.
function estimate(p) {
  const originRequests = p.requests * (1 - p.cacheHitPercent / 100);
  const compute = p.mode === 'instances' ? p.replicas * p.hours * p.instanceHourly : originRequests / 1e6 * p.perMillionOriginRequests;
  const storage = p.storageGB * p.storageGBMonth * p.hours / 730;
  const egress = p.requests * p.responseKB / 1e6 * p.publicEgressPercent / 100 * p.egressGB;
  const cache = p.cacheHitPercent > 0 ? p.cacheMonthly * p.hours / 730 : 0;
  return {originRequests,compute,storage,egress,cache,total:compute+storage+egress+cache};
}
