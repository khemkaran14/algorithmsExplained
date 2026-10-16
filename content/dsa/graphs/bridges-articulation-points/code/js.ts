function lowLinks(adj){const discovery=Array(adj.length).fill(-1),low=[...discovery],bridges=[],cuts=new Set();let time=0;
function visit(u,incoming=-1){discovery[u]=low[u]=time++;let children=0;
for(const [v,edge]of adj[u]){if(edge===incoming)continue;if(discovery[v]===-1){children++;visit(v,edge);low[u]=Math.min(low[u],low[v]);if(low[v]>discovery[u])bridges.push([u,v]);if(incoming!==-1&&low[v]>=discovery[u])cuts.add(u);}else low[u]=Math.min(low[u],discovery[v]);}
if(incoming===-1&&children>1)cuts.add(u);}
for(let u=0;u<adj.length;u++)if(discovery[u]===-1)visit(u);
return {bridges,cuts:[...cuts]};} // Both arcs of an undirected edge share one ID.
