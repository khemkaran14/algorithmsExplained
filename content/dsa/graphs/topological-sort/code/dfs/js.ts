function topological(adj,dfs=true){const order=[];
if(dfs){const color=Array(adj.length).fill(0);function visit(u){color[u]=1;for(const v of adj[u]){if(color[v]===1)return false;if(!color[v]&&!visit(v))return false;}color[u]=2;order.push(u);return true;}for(let u=0;u<adj.length;u++)if(!color[u]&&!visit(u))return null;return order.reverse();}
const indegree=Array(adj.length).fill(0);for(const list of adj)for(const v of list)indegree[v]++;const q=indegree.flatMap((d,u)=>d===0?[u]:[]);
for(let h=0;h<q.length;h++){const u=q[h];order.push(u);for(const v of adj[u])if(--indegree[v]===0)q.push(v);}
// An incomplete order proves a directed cycle.
return order.length===adj.length?order:null;}
