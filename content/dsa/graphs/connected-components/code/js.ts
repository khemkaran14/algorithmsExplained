function components(adj){const label=Array(adj.length).fill(-1);let count=0;
for(let seed=0;seed<adj.length;seed++){if(label[seed]>=0)continue;label[seed]=count;const q=[seed];
for(let h=0;h<q.length;h++)for(const v of adj[q[h]]){
if(label[v]===-1){label[v]=count;q.push(v);}}
count++;}
return {count,label};}
