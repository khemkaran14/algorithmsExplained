function apply(events,price,currency='INR'){const seen=new Map(),ledger=[],history=[];let captured=0,refunded=0,state='created';
for(const e of events){const payload=JSON.stringify([e.kind,e.amount,e.currency]);if(seen.has(e.id)){history.push(seen.get(e.id)===payload?'replayed':'event-conflict');continue;}if(e.currency!==currency){history.push('currency-mismatch');continue;}
if(e.kind==='capture'){if(e.amount!==price){history.push('amount-mismatch');continue;}if(!captured){captured=e.amount;state='captured';ledger.push({account:'provider',delta:captured},{account:'liability',delta:-captured});}}
else if(e.kind==='refund'){if(!captured){history.push('deferred-await-capture');continue;}if(e.amount>captured-refunded){history.push('exceeds-refundable');continue;}refunded+=e.amount;state=refunded===captured?'refunded':'partially-refunded';ledger.push({account:'provider',delta:-e.amount},{account:'liability',delta:e.amount});}
else if(!captured)state='failed';seen.set(e.id,payload);history.push(state);}
return {state,captured,refunded,ledger,entitled:captured>0&&refunded===0};}
// Trusted authenticated events, positive integer minor units, one order; each iteration is atomic.
