function apply(requests,atomic=true){const saved=new Map(),ledger=[],responses=[];
for(const r of requests){const previous=saved.get(r.key);if(previous){responses.push(previous.amount===r.amount?'replayed':'conflict');continue;}
if(atomic&&r.outcome==='crash-between'){responses.push('rolled-back');continue;}
ledger.push({key:r.key,amount:r.amount});
if(r.outcome==='crash-between'){responses.push('effect-without-record');continue;}saved.set(r.key,{amount:r.amount});responses.push(r.outcome==='response-lost'?'committed-response-lost':'ok');}
return {ledger,responses};} // Scope keys to callers; external provider effects require their own protocol.
