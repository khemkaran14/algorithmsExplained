function generate(workers,events,policy='reject'){const last=workers.map(()=>-1),seq=workers.map(()=>0),out=[];
for(const e of events){const i=e.worker;let time=e.time;if(time<last[i]){if(policy==='reject'){out.push(null);continue;}time=last[i];}
let next=time===last[i]?seq[i]+1:0;if(next>=16){if(policy==='reject'){out.push(null);continue;}time=last[i]+1;next=0;}
last[i]=time;seq[i]=next;
out.push(((BigInt(time)<<7n)|(BigInt(workers[i])<<4n)|BigInt(next)).toString());}
return out;} // Toy fields; unique assigned worker IDs are a prerequisite.
