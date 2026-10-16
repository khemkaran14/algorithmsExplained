#include <vector>
#include <algorithm>
#include <utility>
std::pair<int,std::vector<int>> knapsack(const std::vector<int>& weights,const std::vector<int>& values,int capacity){std::vector<std::vector<int>>dp(weights.size()+1,std::vector<int>(capacity+1));for(unsigned i=1;i<=weights.size();i++)for(int w=0;w<=capacity;w++)dp[i][w]=std::max(dp[i-1][w],weights[i-1]<=w?values[i-1]+dp[i-1][w-weights[i-1]]:-1);std::vector<int>items;for(int i=weights.size(),w=capacity;i>0;i--)if(dp[i][w]!=dp[i-1][w]){items.push_back(i-1);w-=weights[i-1];}std::reverse(items.begin(),items.end());
// Both choices read the previous row so an item cannot be reused.
return {dp.back()[capacity],items};}
