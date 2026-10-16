class DSU {constructor(n){this.parent=Array.from({length:n},(_,i)=>i);this.size=Array(n).fill(1);}
find(x){let r=x;while(r!==this.parent[r])r=this.parent[r];while(x!==r){const next=this.parent[x];this.parent[x]=r;x=next;}return r;}
union(a,b){a=this.find(a);b=this.find(b);
if(a===b)return false;if(this.size[a]<this.size[b])[a,b]=[b,a];
this.parent[b]=a;this.size[a]+=this.size[b];
return true;}}
