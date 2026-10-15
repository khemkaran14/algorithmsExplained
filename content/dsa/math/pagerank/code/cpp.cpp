#include <vector>
std::vector<double> pageRank(const std::vector<std::vector<int>>& adj,double d=.85,int iterations=12){int n=(int)adj.size();std::vector<double> rank(n,1.0/n);
for(int step=0;step<iterations;step++){double dangling=0;for(int u=0;u<n;u++)if(adj[u].empty())dangling+=rank[u];std::vector<double> next(n,(1-d)/n+d*dangling/n);
for(int u=0;u<n;u++)for(int v:adj[u])next[v]+=d*rank[u]/adj[u].size();
rank=next;}
return rank;}
