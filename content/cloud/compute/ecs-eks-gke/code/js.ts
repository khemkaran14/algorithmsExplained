// Reconciliation decision; starting pods are not ready service endpoints.
function nextAction(pods,desired,surge,unavailable,target,freeHealthySlot) {
  const live=pods.filter(p=>p.state!=='removed'),ready=live.filter(p=>p.state==='ready').length;
  const count=live.filter(p=>p.version===target).length;
  if(count<desired&&live.length<desired+surge&&freeHealthySlot) return 'create';
  const removable=live.some(p=>p.version!==target&&(p.state!=='ready'||ready-1>=desired-unavailable));
  return removable?'remove-old':'wait';
}
