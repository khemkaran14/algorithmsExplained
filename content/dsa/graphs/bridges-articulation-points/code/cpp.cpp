#include <vector>
#include <set>
#include <functional>
#include <algorithm>
#include <utility>
std::pair<std::vector<std::pair<int,int>>,std::set<int>> lowLinks(const std::vector<std::vector<std::pair<int,int>>>& adj){std::vector<int>d(adj.size(),-1),low(adj.size());std::vector<std::pair<int,int>>bridges;std::set<int>cuts;int time=0;std::function<void(int,int)> visit=[&](int u,int incoming){d[u]=low[u]=time++;int children=0;for(auto [v,edge]:adj[u]){if(edge==incoming)continue;if(d[v]==-1){children++;visit(v,edge);low[u]=std::min(low[u],low[v]);if(low[v]>d[u])bridges.push_back({u,v});if(incoming!=-1&&low[v]>=d[u])cuts.insert(u);}else low[u]=std::min(low[u],d[v]);}if(incoming==-1&&children>1)cuts.insert(u);};for(unsigned u=0;u<adj.size();u++)if(d[u]==-1)visit(u,-1);return {bridges,cuts};}
