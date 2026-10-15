class Fenwick {constructor(values){this.t=Array(values.length+1).fill(0);for(let i=1;i<this.t.length;i++){this.t[i]+=values[i-1];const p=i+(i&-i);if(p<this.t.length)this.t[p]+=this.t[i];}}
add(index,delta){
for(let i=index+1;i<this.t.length;i+=i&-i)this.t[i]+=delta;}
prefix(end){let sum=0;for(let i=end;i>0;i-=i&-i)sum+=this.t[i];return sum;}
sum(left,right){
return this.prefix(right)-this.prefix(left);}}
