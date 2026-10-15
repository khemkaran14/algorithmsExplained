class SumTree {constructor(values){this.n=1;while(this.n<values.length)this.n*=2;this.t=Array(2*this.n).fill(0);values.forEach((v,i)=>this.t[this.n+i]=v);for(let i=this.n-1;i>0;i--)this.t[i]=this.t[2*i]+this.t[2*i+1];}
add(i,delta){i+=this.n;this.t[i]+=delta;
while(i>1){i=Math.floor(i/2);this.t[i]=this.t[2*i]+this.t[2*i+1];}}
sum(left,right){let out=0;for(left+=this.n,right+=this.n;left<right;left=Math.floor(left/2),right=Math.floor(right/2)){
if(left%2)out+=this.t[left++];if(right%2)out+=this.t[--right];}
return out;}}
