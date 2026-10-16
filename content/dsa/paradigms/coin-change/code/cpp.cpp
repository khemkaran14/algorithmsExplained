#include <vector>
#include <algorithm>
#include <optional>
#include <limits>
std::optional<long long> coinChange(std::vector<int>coins,int amount,bool combinations=false){std::sort(coins.begin(),coins.end());coins.erase(std::unique(coins.begin(),coins.end()),coins.end());long long inf=std::numeric_limits<long long>::max()/4;std::vector<long long>dp(amount+1,combinations?0:inf);dp[0]=combinations?1:0;if(combinations){for(int coin:coins)for(int a=coin;a<=amount;a++)dp[a]+=dp[a-coin];}else for(int a=1;a<=amount;a++)for(int coin:coins)if(coin<=a)dp[a]=std::min(dp[a],dp[a-coin]+1);
return dp[amount]==inf?std::nullopt:std::optional<long long>(dp[amount]);}
