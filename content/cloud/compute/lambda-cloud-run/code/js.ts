// Warm-slot admission; environment startup/expiry and FIFO queues surround it.
function admission(environments,provider,concurrency,maxInstances,waiting) {
  const slots=provider==='aws'?1:concurrency;
  const live=environments.filter(e=>e.state!=='expired');
  const warm=live.find(e=>e.state==='warm'&&e.jobs<slots);
  if(warm&&waiting===0)return {action:'warm',id:warm.id};
  const reserved=live.filter(e=>e.state==='starting').length*slots;
  return {action:live.length<maxInstances&&waiting+1>reserved?'cold-start':'queue',id:null};
}
