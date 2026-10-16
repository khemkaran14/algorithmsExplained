#include <vector>
#include <limits>
#include <algorithm>
long long matrixChain(const std::vector<int>& d){int n=d.size()-1;std::vector<std::vector<long long>>dp(n,std::vector<long long>(n));for(int length=2;length<=n;length++)for(int i=0;i+length<=n;i++){int j=i+length-1;dp[i][j]=std::numeric_limits<long long>::max();for(int k=i;k<j;k++)dp[i][j]=std::min(dp[i][j],dp[i][k]+dp[k+1][j]+1LL*d[i]*d[k+1]*d[j+1]);}
// n matrices require n+1 dimension entries.
return dp[0][n-1];}
