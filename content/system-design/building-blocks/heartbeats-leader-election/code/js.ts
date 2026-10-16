function quorumRound(configured,components,leaders,missingSince,tick,timeout,nextTerm){const quorum=Math.floor(configured/2)+1,commits=[];
for(const group of components){const key=group.join(','),known=group.filter(n=>leaders.has(n)).sort((a,b)=>leaders.get(b)-leaders.get(a)||a-b);for(const old of known.slice(1))leaders.delete(old);let leader=known[0];
if(leader===undefined){if(!missingSince.has(key))missingSince.set(key,tick);if(group.length>=quorum&&tick-missingSince.get(key)>=timeout){leader=Math.min(...group);leaders.set(leader,++nextTerm);missingSince.delete(key);}}
else missingSince.delete(key);
if(leader!==undefined&&group.length>=quorum)commits.push({leader,term:leaders.get(leader),votes:group.length});}
return {commits,nextTerm};} // Components come from the fault/heartbeat model. This is not a full consensus protocol.
