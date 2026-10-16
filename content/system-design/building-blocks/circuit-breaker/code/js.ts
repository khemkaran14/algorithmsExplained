function breaker(events,threshold=2,cooldown=1000){let state='closed',failures=0,retryAt=0;const history=[];
for(const event of events){if(state==='open'&&event.at>=retryAt)state='half-open';
const called=state!=='open';
if(called){if(event.success){state='closed';failures=0;}else if(++failures>=threshold||state==='half-open'){state='open';retryAt=event.at+cooldown;}}
history.push({at:event.at,called,state});}
return history;} // Serial calls; concurrent half-open probes need separate coordination.
