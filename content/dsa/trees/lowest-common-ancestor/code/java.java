class LCA {static int lca(int[] parent,int a,int b){int[] depth=new int[parent.length];
for(int i=1;i<parent.length;i++)depth[i]=depth[parent[i]]+1;
while(depth[a]>depth[b])a=parent[a];
while(depth[b]>depth[a])b=parent[b];
while(a!=b){a=parent[a];b=parent[b];}
return a;}}
