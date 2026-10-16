function deliver(p){const groups=p.mode==='pubsub'?p.subscribers:1,tasks=p.messages.flatMap(m=>Array.from({length:groups},(_,group)=>({...m,group,state:'ready',attempts:0,due:0}))),inbox=new Set(),effects=Array(groups).fill(0);let lost=false,deliveries=0;
for(let tick=0;tick<p.ticks;tick++){for(const t of tasks)if(t.state==='inflight'&&t.due<=tick)t.state=t.attempts>=p.maxRetries+1?'dead':'ready';
for(let group=0;group<groups;group++){let budget=p.workers*p.perWorker;for(const t of tasks){if(!budget)break;if(t.group!==group||t.state!=='ready')continue;budget--;t.state='inflight';t.due=tick+p.visibility;t.attempts++;deliveries++;if(t.id===p.failMessage||t.group===p.failSubscriber)continue;
const key=group+':'+t.id;if(!p.deduplicate||!inbox.has(key)){effects[group]+=t.value;inbox.add(key);}if(p.loseFirstAck&&!lost)lost=true;else t.state='done';}}}
const done=tasks.filter(t=>t.state==='done').length,dead=tasks.filter(t=>t.state==='dead').length;
return {effects,deliveries,done,dead,pending:tasks.length-done-dead};} // The inbox+effect step models an atomic application transaction.
