// Exact attribute predicates; local target effects, not external side effects.
function route(events,rules,failed,maxAttempts,deduplicate=true) {
  const inbox=new Set(),effects={},dead=[]; let matched=0,delivered=0,suppressed=0,unmatched=0;
  for(const event of events) {
    const targets=new Set(rules.filter(r=>(r.source==='*'||r.source===event.source)&&(r.type==='*'||r.type===event.type)).map(r=>r.target));
    if(!targets.size) unmatched++;
    for(const target of targets) { matched++; if(target===failed){dead.push({id:event.id,target,attempts:maxAttempts});continue;}
      delivered++; const key=JSON.stringify([target,event.id]);
      if(deduplicate&&inbox.has(key)) suppressed++; else {inbox.add(key);effects[target]=(effects[target]||0)+1;}
    }
  }
  return {matched,delivered,suppressed,unmatched,effects,dead};
}
