function dfs(adj,start){const seen=Array(adj.length).fill(false),order=[];
function visit(u){seen[u]=true;order.push(u);
for(const v of adj[u]){
if(!seen[v])visit(v);}}
visit(start);
return order;}
