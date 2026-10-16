#include <vector>
#include <utility>
#include <functional>
bool hasCycle(const std::vector<std::vector<std::pair<int,int>>>& adj,bool directed){std::vector<int>color(adj.size());std::function<bool(int,int)> visit=[&](int u,int incoming){color[u]=1;for(auto [v,edge]:adj[u]){if(!directed&&edge==incoming)continue;if(color[v]==0){if(visit(v,edge))return true;}else if(!directed||color[v]==1)return true;}color[u]=2;return false;};
for(unsigned u=0;u<adj.size();u++)if(!color[u]&&visit(u,-1))return true;
return false;}
