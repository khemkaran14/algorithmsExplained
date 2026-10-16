// Demand-derived target, lagged signal and sustained-low scale-in guard.
function desired(load,tick,capacity,targetPercent,min,max,lag,current,lowTicks,stabilization) {
  const signal=load[Math.max(0,tick-lag)]||0;
  const target=Math.min(max,Math.max(min,Math.ceil(signal/(capacity*targetPercent/100))));
  const nextLow=target<current?lowTicks+1:0;
  const allowed=target>current||nextLow>=stabilization;
  return {target:allowed?target:current,lowTicks:nextLow};
}
