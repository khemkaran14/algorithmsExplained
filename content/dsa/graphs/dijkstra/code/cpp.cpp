#include <vector>
#include <queue>
#include <tuple>
#include <functional>
#include <limits>
#include <stdexcept>
std::vector<double> shortest(const std::vector<std::vector<std::pair<int,int>>>& adj,int start,int target,const std::function<double(int)>& h){using Item=std::tuple<double,int,double>;std::priority_queue<Item,std::vector<Item>,std::greater<Item>> q;std::vector<double>d(adj.size(),std::numeric_limits<double>::infinity());d[start]=0;q.emplace(h(start),start,0);while(!q.empty()){auto [priority,u,g]=q.top();q.pop();if(g!=d[u])continue;if(u==target)break;for(auto [v,w]:adj[u]){if(w<0)throw std::invalid_argument("negative weight");double next=g+w;if(next<d[v]){d[v]=next;q.emplace(next+h(v),v,next);}}}return d;} // target=-1 and h=0 for Dijkstra; consistent h for A*.
