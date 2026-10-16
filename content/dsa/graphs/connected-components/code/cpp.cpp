#include <vector>
std::vector<int> components(const std::vector<std::vector<int>>& adj){std::vector<int> label(adj.size(),-1);int count=0;
for(unsigned seed=0;seed<adj.size();seed++){if(label[seed]>=0)continue;std::vector<int>q{int(seed)};label[seed]=count;
for(unsigned h=0;h<q.size();h++)for(int v:adj[q[h]])if(label[v]==-1){label[v]=count;q.push_back(v);}
count++;}
return label;}
