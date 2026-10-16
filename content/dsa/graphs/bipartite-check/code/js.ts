function bipartite(adj){const color=Array(adj.length).fill(-1);
for(let seed=0;seed<adj.length;seed++){if(color[seed]>=0)continue;const q=[seed];color[seed]=0;
for(let h=0;h<q.length;h++)for(const v of adj[q[h]]){
if(color[v]===-1){color[v]=1-color[q[h]];q.push(v);}else if(color[v]===color[q[h]])return false;}}
// Every disconnected component must be checked.
return true;}
