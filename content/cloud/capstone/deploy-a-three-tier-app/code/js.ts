// One ready application worker decision; queues and budgets surround this helper.
function requestPath(ingress,lbToApp,cacheHit,appToDb,dbIdentity) {
  if(!ingress||!lbToApp) return 'rejected-ingress';
  if(cacheHit) return 'completed-public-catalog-cache';
  if(!appToDb||!dbIdentity) return 'failed-db-path-or-identity';
  return 'queued-for-shared-db-capacity';
}
function conserved(offered,completed,failed,rejected,pending) {
  return offered===completed+failed+rejected+pending;
}
