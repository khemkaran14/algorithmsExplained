class Limiter {constructor(algorithm,limit,windowMs,refill){Object.assign(this,{algorithm,limit,windowMs,refill});this.clients=new Map();}
admit(at,key,cost=1){let s=this.clients.get(key);if(!s){s={tokens:this.limit,last:at,window:Math.floor(at/this.windowMs),current:0,previous:0,log:[]};this.clients.set(key,s);}let available;
if(this.algorithm==='token-bucket'){s.tokens=Math.min(this.limit,s.tokens+(at-s.last)*this.refill/1000);s.last=at;available=s.tokens;}else if(this.algorithm==='sliding-log'){s.log=s.log.filter(e=>e.at>at-this.windowMs);available=this.limit-s.log.reduce((sum,e)=>sum+e.cost,0);}else{const window=Math.floor(at/this.windowMs);if(window!==s.window){s.previous=window===s.window+1?s.current:0;s.current=0;s.window=window;}available=this.limit-s.current-(this.algorithm==='sliding-counter'?s.previous*(1-(at%this.windowMs)/this.windowMs):0);}
const allowed=cost<=available+1e-12;
if(allowed){if(this.algorithm==='token-bucket')s.tokens=Math.max(0,s.tokens-cost);else if(this.algorithm==='sliding-log')s.log.push({at,cost});else s.current+=cost;}
return allowed;}} // Ordered timestamps; a real distributed limiter needs atomic shared-state operations.
