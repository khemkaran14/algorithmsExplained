function scc(adj,tarjan=true){const n=adj.length,groups=[];
if(tarjan){const index=Array(n).fill(-1),low=[...index],active=Array(n).fill(false),stack=[];let time=0;function visit(u){index[u]=low[u]=time++;stack.push(u);active[u]=true;for(const v of adj[u]){if(index[v]===-1){visit(v);low[u]=Math.min(low[u],low[v]);}else if(active[v])low[u]=Math.min(low[u],index[v]);}if(low[u]===index[u]){const group=[];let v;do{v=stack.pop();active[v]=false;group.push(v);}while(v!==u);groups.push(group);}}for(let u=0;u<n;u++)if(index[u]===-1)visit(u);return groups;}
const seen=Array(n).fill(false),finish=[],reverse=Array.from({length:n},()=>[]);for(let u=0;u<n;u++)for(const v of adj[u])reverse[v].push(u);function visit(u){seen[u]=true;for(const v of adj[u])if(!seen[v])visit(v);finish.push(u);}for(let u=0;u<n;u++)if(!seen[u])visit(u);
seen.fill(false);for(const seed of finish.reverse()){if(seen[seed])continue;const group=[],stack=[seed];seen[seed]=true;while(stack.length){const u=stack.pop();group.push(u);for(const v of reverse[u])if(!seen[v]){seen[v]=true;stack.push(v);}}groups.push(group);}
// Components are unordered; compare partitions rather than numeric IDs.
return groups;}
