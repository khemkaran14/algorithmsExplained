#include <vector>
#include <array>
#include <algorithm>
long long independentSet(const std::vector<int>& parent,const std::vector<int>& weights){std::vector<std::vector<int>>children(parent.size());std::vector<std::array<long long,2>>dp(parent.size(),{0,0});for(unsigned i=1;i<parent.size();i++)children[parent[i]].push_back(i);for(int u=int(parent.size())-1;u>=0;u--){dp[u][1]=weights[u];for(int v:children[u]){dp[u][1]+=dp[v][0];dp[u][0]+=std::max(dp[v][0],dp[v][1]);}}
// Included parents require excluded children.
return std::max(dp[0][0],dp[0][1]);}
