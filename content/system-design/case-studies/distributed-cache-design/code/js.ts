class ReplicaCache {
constructor(nodes,capacity,ttl,owners){this.stores=Array.from({length:nodes},()=>new Map());this.origin=new Map();Object.assign(this,{capacity,ttl,owners});}
fill(node,key,row,tick){const s=this.stores[node];s.delete(key);s.set(key,{...row,expires:tick+this.ttl});if(s.size>this.capacity)s.delete(s.keys().next().value);}
put(key,value,tick,healthy,originDown=false){if(originDown)return false;const row={value,version:(this.origin.get(key)?.version||0)+1};this.origin.set(key,row);for(const n of this.owners(key))if(healthy(n))this.fill(n,key,row,tick);return true;}
get(key,tick,healthy,originDown=false){for(const n of this.owners(key)){if(!healthy(n))continue;const s=this.stores[n],row=s.get(key);if(row&&row.expires>tick){s.delete(key);s.set(key,row);return {...row,source:n};}s.delete(key);}
if(originDown)return null;const row=this.origin.get(key)||{value:key*10,version:0};for(const n of this.owners(key))if(healthy(n))this.fill(n,key,row,tick);return {...row,source:'origin'};}}
// owners(key) supplies distinct physical owners from a fixed consistent-hash ring.
// Recovered owners can be stale until TTL; no read oracle or consensus is implied.
