#include <vector>
#include <utility>
std::pair<int,int> far(const std::vector<std::vector<int>>& adj,int start){std::vector<int>d(adj.size(),-1),q{start};d[start]=0;int best=start;for(unsigned h=0;h<q.size();h++){int u=q[h];if(d[u]>d[best])best=u;for(int v:adj[u])if(d[v]==-1){d[v]=d[u]+1;q.push_back(v);}}
return {best,d[best]};}
int diameter(const std::vector<std::vector<int>>& adj){int end=far(adj,0).first;
return far(adj,end).second;}
