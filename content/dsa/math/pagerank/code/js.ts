function pageRank(adj,damping=.85,iterations=12){const n=adj.length;let rank=Array(n).fill(1/n);
for(let step=0;step<iterations;step++){const next=Array(n).fill((1-damping)/n);
const dangling=rank.reduce((sum,r,u)=>sum+(adj[u].length?0:r),0);
for(let v=0;v<n;v++)next[v]+=damping*dangling/n;
for(let u=0;u<n;u++)for(const v of adj[u])next[v]+=damping*rank[u]/adj[u].length;rank=next;}
return rank;}
