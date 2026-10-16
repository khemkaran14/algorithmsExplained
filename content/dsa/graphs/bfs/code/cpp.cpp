#include <vector>
std::vector<int> bfs(const std::vector<std::vector<int>>& adj,int start){std::vector<int>d(adj.size(),-1),q{start};d[start]=0;
for(unsigned h=0;h<q.size();h++){int u=q[h];
for(int v:adj[u])if(d[v]==-1){d[v]=d[u]+1;q.push_back(v);}}
// -1 marks an unreachable vertex.
return d;}
