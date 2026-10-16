// Primary acknowledgment uses a fixed majority, not a majority of survivors.
function failover(strategy,replicas,available,faultTick,now,detection,promotion,restoreDuration,snapshot) {
  if(available>=Math.floor(replicas/2)+1) return {serving:'primary',recovered:null};
  const wait=detection+(strategy==='cross-region'?promotion:restoreDuration);
  const canRecover=strategy==='cross-region'||strategy==='backup-restore';
  if(!canRecover||now<faultTick+wait) return {serving:'unavailable',recovered:null};
  return {serving:'fenced-secondary',recovered:[...snapshot]};
}
