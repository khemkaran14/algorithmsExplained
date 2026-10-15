class LFU {constructor(capacity,loader=key=>key){this.capacity=capacity;this.loader=loader;this.cache=new Map();this.buckets=new Map();this.min=0;}
add(f,key){if(!this.buckets.has(f))this.buckets.set(f,new Set());this.buckets.get(f).add(key);}
get(key){if(this.cache.has(key)){const e=this.cache.get(key),bucket=this.buckets.get(e.f);bucket.delete(key);if(!bucket.size){this.buckets.delete(e.f);if(this.min===e.f)this.min++;}e.f++;this.add(e.f,key);return e.value;}
const value=this.loader(key);if(this.cache.size===this.capacity){const b=this.buckets.get(this.min),victim=b.values().next().value;b.delete(victim);if(!b.size)this.buckets.delete(this.min);this.cache.delete(victim);}
this.cache.set(key,{value,f:1});this.add(1,key);this.min=1;
return value;}}
