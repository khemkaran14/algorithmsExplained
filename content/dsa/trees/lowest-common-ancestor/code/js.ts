function lca(parent,a,b){const depth=Array(parent.length).fill(0);
for(let i=1;i<parent.length;i++)depth[i]=depth[parent[i]]+1;
while(depth[a]>depth[b])a=parent[a];
while(depth[b]>depth[a])b=parent[b];
while(a!==b){a=parent[a];b=parent[b];}
return a;} // Root 0 has parent -1; every other parent precedes its child.
