#include <vector>
#include <optional>
#include <functional>
#include <algorithm>
// Returns no order when a cycle is detected.
std::optional<std::vector<int>> topological(const std::vector<std::vector<int>>& adj,bool dfs=false){std::vector<int>out,c(adj.size());if(dfs){std::function<bool(int)> visit=[&](int u){c[u]=1;for(int v:adj[u])if(c[v]==1||(!c[v]&&!visit(v)))return false;c[u]=2;out.push_back(u);return true;};for(unsigned u=0;u<adj.size();u++)if(!c[u]&&!visit(u))return std::nullopt;std::reverse(out.begin(),out.end());return out;}for(const auto& row:adj)for(int v:row)c[v]++;std::vector<int>q;for(unsigned u=0;u<c.size();u++)if(!c[u])q.push_back(u);for(unsigned h=0;h<q.size();h++){int u=q[h];out.push_back(u);for(int v:adj[u])if(--c[v]==0)q.push_back(v);}if(out.size()!=adj.size())return std::nullopt;return out;}
