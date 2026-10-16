function blockers(request,holders,earlier=[]){const own=(holders.get(request.key)||new Map()).get(request.tx);if(own==='X'||(own==='S'&&request.mode==='S'))return [];
const out=new Set();for(const [owner,mode]of holders.get(request.key)||[])if(owner!==request.tx&&(request.mode==='X'||mode==='X'))out.add(owner);
for(const prior of earlier)if(prior.key===request.key&&prior.tx!==request.tx&&(request.mode==='X'||prior.mode==='X'))out.add(prior.tx);return [...out];}
function waitGraph(holders,queue){return queue.flatMap((r,i)=>blockers(r,holders,queue.slice(0,i)).map(to=>({from:r.tx,to})));}
function victim(edges){const active=[],done=new Set();let found=[];function visit(n){const index=active.indexOf(n);if(index>=0){found=active.slice(index);return true;}if(done.has(n))return false;active.push(n);for(const e of edges.filter(e=>e.from===n))if(visit(e.to))return true;active.pop();done.add(n);return false;}for(const n of ['A','B','C'])if(visit(n))break;return found.length?found.sort().at(-1):null;}
// After aborting a victim, release its held locks/remove requests and grant eligible waiters in order.
// Compatibility/cycle core; the player also owns transaction state, commit/rollback and wakeups.
