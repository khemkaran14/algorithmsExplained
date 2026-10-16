function maxFlow(n,edges,source,sink,dfs=true){if(source===sink)return 0;const adj=Array.from({length:n},()=>[]);for(const [u,v,cap]of edges){if(u===v)continue;const a=adj[u].length,b=adj[v].length;adj[u].push({to:v,rev:b,cap});adj[v].push({to:u,rev:a,cap:0});}let total=0;
while(true){const parent=Array(n).fill(null),seen=Array(n).fill(false),q=[source];seen[source]=true;let head=0;while((dfs?q.length:head<q.length)&&!seen[sink]){const u=dfs?q.pop():q[head++];adj[u].forEach((e,index)=>{if(e.cap>0&&!seen[e.to]){seen[e.to]=true;parent[e.to]=[u,index];q.push(e.to);}});}if(!seen[sink])break;
let amount=Infinity;for(let v=sink;v!==source;){const [u,i]=parent[v];amount=Math.min(amount,adj[u][i].cap);v=u;}
for(let v=sink;v!==source;){const [u,i]=parent[v],e=adj[u][i];e.cap-=amount;adj[v][e.rev].cap+=amount;v=u;}
total+=amount;}
return total;} // Nonnegative integer capacities; each original arc owns a distinct reverse arc.
