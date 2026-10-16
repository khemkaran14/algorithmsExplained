#include <vector>
#include <array>
#include <deque>
#include <limits>
#include <algorithm>
long long maxFlow(int n,const std::vector<std::array<int,3>>& edges,int source,int sink,bool dfs=false){if(source==sink)return 0;struct Arc{int to,rev;long long cap;};std::vector<std::vector<Arc>>adj(n);for(auto [u,v,cap]:edges){if(u==v)continue;int a=adj[u].size(),b=adj[v].size();adj[u].push_back({v,b,cap});adj[v].push_back({u,a,0});}long long total=0;while(true){std::vector<int>parent(n,-1),index(n);std::deque<int>q{source};parent[source]=source;while(!q.empty()&&parent[sink]==-1){int u;if(dfs){u=q.back();q.pop_back();}else{u=q.front();q.pop_front();}for(unsigned i=0;i<adj[u].size();i++){auto e=adj[u][i];if(e.cap>0&&parent[e.to]==-1){parent[e.to]=u;index[e.to]=i;q.push_back(e.to);}}}if(parent[sink]==-1)break;long long amount=std::numeric_limits<long long>::max();for(int v=sink;v!=source;v=parent[v])amount=std::min(amount,adj[parent[v]][index[v]].cap);for(int v=sink;v!=source;v=parent[v]){auto& e=adj[parent[v]][index[v]];e.cap-=amount;adj[v][e.rev].cap+=amount;}total+=amount;}return total;}
