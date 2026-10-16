function representations(n,edges,directed=false){const adj=Array.from({length:n},()=>[]),matrix=Array.from({length:n},()=>Array(n).fill(null));
for(const [u,v,w=1] of edges){
adj[u].push([v,w]);matrix[u][v]=w;
if(!directed){adj[v].push([u,w]);matrix[v][u]=w;}}
// Input validation rejects duplicate endpoint pairs and out-of-bounds indices.
return {adj,matrix};}
