class ChainedSet {constructor(m=5){this.b=Array.from({length:m},()=>[]);}index(k){return (k%this.b.length+this.b.length)%this.b.length;}
has(k){return this.b[this.index(k)].includes(k);}
add(k){if(!this.has(k))this.b[this.index(k)].push(k);}
delete(k){const b=this.b[this.index(k)],i=b.indexOf(k);
if(i>=0)b.splice(i,1);}
values(){return this.b.flat();}}
