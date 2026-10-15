#include <vector>
int lca(const std::vector<int>& parent,int a,int b){std::vector<int> depth(parent.size());for(unsigned i=1;i<parent.size();i++)depth[i]=depth[parent[i]]+1;
while(depth[a]>depth[b])a=parent[a];
while(depth[b]>depth[a])b=parent[b];
while(a!=b){a=parent[a];b=parent[b];}
return a;}
