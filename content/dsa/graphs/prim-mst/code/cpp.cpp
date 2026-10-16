#include <vector>
#include <queue>
#include <tuple>
#include <functional>
std::tuple<long long,int> prim(const std::vector<std::vector<std::pair<int,int>>>& adj){using Item=std::tuple<int,int,int>;std::priority_queue<Item,std::vector<Item>,std::greater<Item>>q;std::vector<bool>seen(adj.size());long long total=0;int components=0;for(unsigned seed=0;seed<adj.size();seed++){if(seen[seed])continue;components++;q.emplace(0,seed,-1);while(!q.empty()){auto [w,u,parent]=q.top();q.pop();if(seen[u])continue;seen[u]=true;if(parent!=-1)total+=w;for(auto [v,weight]:adj[u])if(!seen[v])q.emplace(weight,v,u);}}
return {total,components};}
