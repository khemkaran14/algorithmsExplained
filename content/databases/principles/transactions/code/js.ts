class MVCC {
constructor(isolation='repeatable-read'){this.isolation=isolation;this.clock=0;this.versions={x:[{value:1,version:0,writer:null}],y:[{value:1,version:0,writer:null}]};this.transactions=new Map();}
begin(id){if(this.transactions.has(id))throw Error('ID reused');this.transactions.set(id,{snapshot:null,state:'active',writes:new Map(),reads:[]});}
active(id){const t=this.transactions.get(id);if(!t||t.state!=='active')throw Error('not active');t.snapshot??=this.clock;return t;}
write(id,key,value){this.active(id).writes.set(key,value);}
read(id,key){const t=this.active(id);if(t.writes.has(key))return t.writes.get(key);const limit=['repeatable-read','serializable'].includes(this.isolation)?t.snapshot:this.clock,row=this.versions[key].findLast(v=>v.version<=limit);t.reads.push({key,...row});return row.value;}
cycle(candidate){const nodes=[...this.transactions].filter(([id,t])=>t.state==='committed'||id===candidate),edges=new Set(),next=this.clock+1;
for(const [reader,t] of nodes)for(const read of t.reads){if(read.writer&&read.writer!==reader)edges.add(read.writer+':'+reader);for(const [writer,w] of nodes){if(writer===reader||!w.writes.has(read.key))continue;const version=writer===candidate?next:this.versions[read.key].find(v=>v.writer===writer).version;if(version>read.version)edges.add(reader+':'+writer);}}
for(const key of ['x','y']){const writers=nodes.filter(([,t])=>t.writes.has(key)).sort(([a],[b])=>(a===candidate?next:this.versions[key].find(v=>v.writer===a).version)-(b===candidate?next:this.versions[key].find(v=>v.writer===b).version));for(let i=1;i<writers.length;i++)edges.add(writers[i-1][0]+':'+writers[i][0]);}return edges.has('A:B')&&edges.has('B:A');}
commit(id){const t=this.active(id),snapshot=['repeatable-read','serializable'].includes(this.isolation);if((snapshot&&[...t.writes.keys()].some(k=>this.versions[k].at(-1).version>t.snapshot))||(this.isolation==='serializable'&&this.cycle(id))){this.rollback(id);return false;}if(t.writes.size){this.clock++;for(const [key,value]of t.writes)this.versions[key].push({value,version:this.clock,writer:id});}t.state='committed';return true;}
rollback(id){const t=this.active(id);t.writes.clear();t.state='aborted';}}
// Two transaction IDs A/B, x/y keys, absolute writes. Explicit graph check is not PostgreSQL SSI.
// READ UNCOMMITTED is treated as READ COMMITTED; no dirty reads, predicates, locks or recovery.
