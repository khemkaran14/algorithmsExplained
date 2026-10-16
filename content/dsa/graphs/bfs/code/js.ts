function bfs(adj,start){const distance=Array(adj.length).fill(null),queue=[start],order=[];distance[start]=0;
for(let h=0;h<queue.length;h++){const u=queue[h];order.push(u);
for(const v of adj[u])if(distance[v]===null){
distance[v]=distance[u]+1;queue.push(v);}}
// Unreached vertices retain null distance.
return {order,distance};}
