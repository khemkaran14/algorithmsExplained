function hasCycle(adj,directed){const color=Array(adj.length).fill(0);
function visit(u,parentEdge=-1){color[u]=1;
for(const [v,edge] of adj[u]){if(!directed&&edge===parentEdge)continue;
if(color[v]===0){if(visit(v,edge))return true;}else if(!directed||color[v]===1)return true;}
color[u]=2;return false;}
return adj.some((_,u)=>color[u]===0&&visit(u));} // Undirected arcs share one edge ID.
