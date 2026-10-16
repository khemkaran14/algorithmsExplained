#include <vector>
#include <algorithm>
long long minimumCost(const std::vector<int>& cost){std::vector<long long>dp(cost.size()+1);for(unsigned i=0;i<=cost.size();i++){long long one=i==0?0:dp[i-1],two=i<2?0:dp[i-2];
dp[i]=std::min(one,two)+(i==cost.size()?0:cost[i]);}
// Entry at index zero or one is allowed.
return dp.back();}
