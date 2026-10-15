#include <vector>
std::vector<int> bfs(const std::vector<std::vector<int>>& adj){if(adj.empty())return {};std::vector<bool> seen(adj.size());std::vector<int> q{0};seen[0]=true;for(unsigned head=0;head<q.size();++head){
  int node=q[head];
  for(int next:adj[node])if(!seen[next]){
    seen[next]=true;q.push_back(next);}}
  return q;}
