// Decision helper for one observed canary stage; samples come from telemetry.
function decision(tests,policy,signature,candidate,errors,baseline,baselineErrors,minSamples,maxError,maxRegression) {
  if(!tests||!policy||!signature) return 'reject-before-rollout';
  if(candidate<minSamples||baseline===0) return 'hold';
  const rate=100*errors/candidate, stableRate=100*baselineErrors/baseline;
  if(rate>maxError||rate-stableRate>maxRegression) return 'rollback';
  return 'advance';
}
