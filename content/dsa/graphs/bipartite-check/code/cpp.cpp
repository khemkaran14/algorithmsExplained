#include <vector>
bool bipartite(const std::vector<std::vector<int>>& adj){std::vector<int> c(adj.size(),-1);
for(unsigned seed=0;seed<c.size();seed++){if(c[seed]>=0)continue;c[seed]=0;std::vector<int>q{int(seed)};
for(unsigned h=0;h<q.size();h++){int u=q[h];for(int v:adj[u]){if(c[v]==-1){c[v]=1-c[u];q.push_back(v);}else if(c[v]==c[u])return false;}}}
// Each component, including isolated vertices, is covered.
return true;}
