#include <vector>
void visit(const std::vector<std::vector<int>>& adj,int u,std::vector<bool>& seen,std::vector<int>& out){seen[u]=true;out.push_back(u);
for(int v:adj[u])if(!seen[v])visit(adj,v,seen,out);}
std::vector<int> dfs(const std::vector<std::vector<int>>& adj,int start){std::vector<int> out;std::vector<bool> seen(adj.size());
visit(adj,start,seen,out);
return out;}
