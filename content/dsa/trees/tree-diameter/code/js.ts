function diameter(adj){function far(start){const d=Array(adj.length).fill(-1),q=[start];d[start]=0;let best=start;
for(let h=0;h<q.length;h++){const u=q[h];if(d[u]>d[best])best=u;
for(const v of adj[u])if(d[v]===-1){d[v]=d[u]+1;q.push(v);}}
return [best,d[best]];}
const [end]=far(0);
return far(end)[1];} // Input must be a connected unweighted tree.
