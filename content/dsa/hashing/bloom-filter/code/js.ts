class Bloom {constructor(m,k,positions){this.bits=Array(m).fill(false);this.k=k;this.positions=positions;}
add(key){
for(const i of this.positions(key,this.bits.length,this.k))this.bits[i]=true;}
maybe(key){for(const i of this.positions(key,this.bits.length,this.k)){
if(!this.bits[i])return false;}
return true;}} // positions must use the same stable hashes for add and query.
