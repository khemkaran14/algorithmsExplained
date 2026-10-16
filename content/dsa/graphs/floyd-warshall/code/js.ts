function floyd(n,edges,directed=true){const d=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?0:Infinity));for(const [u,v,w]of edges){d[u][v]=Math.min(d[u][v],w);if(!directed)d[v][u]=Math.min(d[v][u],w);}
for(let k=0;k<n;k++){
for(let i=0;i<n;i++)for(let j=0;j<n;j++)d[i][j]=Math.min(d[i][j],d[i][k]+d[k][j]);}
const negative=Array.from({length:n},(_,k)=>k).filter(k=>d[k][k]<0),result=d.map(row=>[...row]);
for(let i=0;i<n;i++)for(let j=0;j<n;j++)if(negative.some(k=>Number.isFinite(d[i][k])&&Number.isFinite(d[k][j])))result[i][j]=-Infinity;
return result;}
