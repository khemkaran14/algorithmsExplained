function pool(p){const requests=p.requests.map((r,id)=>({...r,id,state:'future',end:null,start:null})),connections=[];
function acquire(r,tick){let slot=connections.find(c=>c.replica===r.replica&&c.request===null&&!c.leaked);if(!slot&&connections.length<p.databaseLimit&&connections.filter(c=>c.replica===r.replica).length<p.poolSize){slot={replica:r.replica,request:null,leaked:false};connections.push(slot);}if(!slot)return false;slot.request=r.id;r.state='running';r.start=tick;r.end=tick+r.duration;return true;}
for(let tick=0;tick<p.ticks;tick++){for(const slot of connections){if(slot.request===null||slot.leaked)continue;const r=requests[slot.request];if(r.end<=tick){r.state='done';if(r.leak)slot.leaked=true;else slot.request=null;}}
for(const r of requests)if(r.state==='waiting'&&tick-r.at>=p.timeout)r.state='timeout';
for(const r of requests.filter(r=>r.state==='waiting').sort((a,b)=>a.at-b.at||a.id-b.id))acquire(r,tick);
for(const r of requests.filter(r=>r.state==='future'&&r.at===tick)){const waiting=requests.filter(o=>o.state==='waiting'&&o.replica===r.replica);if(waiting.length||!acquire(r,tick))r.state=waiting.length>=p.queueLimit?'rejected':'waiting';}}
return {requests,connections};}
// Local pools own their sockets even when idle. A leak completes the query but retains its checkout.
// This is a capacity model, not an actual database client or transaction-pooling implementation.
