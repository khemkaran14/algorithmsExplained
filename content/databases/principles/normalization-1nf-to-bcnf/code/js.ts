function analyze(attributes,dependencies){function closure(seed){const out=new Set(seed);let changed=true;while(changed){changed=false;for(const fd of dependencies)if(fd.left.every(a=>out.has(a)))for(const a of fd.right)if(!out.has(a)){out.add(a);changed=true;}}return out;}
const keys=[];for(let mask=0;mask<2**attributes.length;mask++){const subset=attributes.filter((_,i)=>mask&(1<<i)),closed=closure(subset);if(attributes.every(a=>closed.has(a))&&!keys.some(k=>k.every(a=>subset.includes(a))))keys.push(subset);}
const prime=new Set(keys.flat()),bcnf=[],third=[],partial=[];
for(const fd of dependencies){const superkey=closure(fd.left).size===attributes.length;for(const a of fd.right)if(!fd.left.includes(a)&&!superkey){bcnf.push([fd.left,a]);if(!prime.has(a))third.push([fd.left,a]);}}
for(const key of keys)for(let mask=0;mask<2**key.length-1;mask++){const subset=key.filter((_,i)=>mask&(1<<i));for(const a of closure(subset))if(!prime.has(a))partial.push([subset,a]);}
return {keys,prime:[...prime],partial,third,bcnf};}
// Assumes atomic cells and valid asserted FDs; candidate-key search is exponential, bounded to eight attributes.
