function bellmanFord(n,edges,start){const d=Array(n).fill(Infinity);d[start]=0;
for(let pass=1;pass<n;pass++){let changed=false;for(const [u,v,w]of edges)if(Number.isFinite(d[u])&&d[u]+w<d[v]){d[v]=d[u]+w;changed=true;}if(!changed)break;}
const bad=Array(n).fill(false),q=[];for(const [u,v,w]of edges)if(Number.isFinite(d[u])&&d[u]+w<d[v]&&!bad[v]){bad[v]=true;q.push(v);}
const adj=Array.from({length:n},()=>[]);for(const [u,v]of edges)adj[u].push(v);for(let h=0;h<q.length;h++)for(const v of adj[q[h]])if(!bad[v]){bad[v]=true;q.push(v);}
// Only vertices downstream from a reachable negative cycle are unbounded below.
return d.map((value,v)=>bad[v]?-Infinity:value);}
