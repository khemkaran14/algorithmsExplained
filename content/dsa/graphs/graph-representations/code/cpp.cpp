#include <vector>
#include <array>
#include <optional>
#include <utility>
using Matrix=std::vector<std::vector<std::optional<int>>>;std::pair<std::vector<std::vector<std::pair<int,int>>>,Matrix> build(int n,const std::vector<std::array<int,3>>& edges,bool directed){std::vector<std::vector<std::pair<int,int>>> adj(n);Matrix m(n,std::vector<std::optional<int>>(n));for(auto [u,v,w]:edges){adj[u].push_back({v,w});m[u][v]=w;if(!directed){adj[v].push_back({u,w});m[v][u]=w;}}
return {adj,m};}
