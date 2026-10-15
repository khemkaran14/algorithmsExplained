class LRU {constructor(capacity,loader=key=>key){this.capacity=capacity;this.loader=loader;this.cache=new Map();}
get(key){if(this.cache.has(key)){const value=this.cache.get(key);this.cache.delete(key);this.cache.set(key,value);return value;}
const value=this.loader(key);
if(this.cache.size===this.capacity)this.cache.delete(this.cache.keys().next().value);
this.cache.set(key,value);
return value;}}
