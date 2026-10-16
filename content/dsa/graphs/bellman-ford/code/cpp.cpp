#include <vector>
#include <array>
#include <limits>
std::vector<double> bellmanFord(int n,const std::vector<std::array<int,3>>& edges,int start){const double inf=std::numeric_limits<double>::infinity();std::vector<double>d(n,inf);d[start]=0;for(int pass=1;pass<n;pass++){bool changed=false;for(auto [u,v,w]:edges)if(d[u]+w<d[v]){d[v]=d[u]+w;changed=true;}if(!changed)break;}std::vector<bool>bad(n);std::vector<int>q;std::vector<std::vector<int>>adj(n);for(auto [u,v,w]:edges){adj[u].push_back(v);if(d[u]+w<d[v]&&!bad[v]){bad[v]=true;q.push_back(v);}}for(unsigned h=0;h<q.size();h++)for(int v:adj[q[h]])if(!bad[v]){bad[v]=true;q.push_back(v);}
for(int v=0;v<n;v++)if(bad[v])d[v]=-inf;
return d;}
