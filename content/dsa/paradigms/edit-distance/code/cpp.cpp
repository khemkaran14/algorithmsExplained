#include <vector>
#include <string>
#include <algorithm>
std::vector<std::vector<int>> sequenceTable(const std::string& a,const std::string& b,bool edit){std::vector<std::vector<int>>dp(a.size()+1,std::vector<int>(b.size()+1));if(edit){for(unsigned i=0;i<=a.size();i++)dp[i][0]=i;for(unsigned j=0;j<=b.size();j++)dp[0][j]=j;}for(unsigned i=1;i<=a.size();i++)for(unsigned j=1;j<=b.size();j++){if(a[i-1]==b[j-1])dp[i][j]=dp[i-1][j-1]+(edit?0:1);else dp[i][j]=edit?1+std::min({dp[i-1][j-1],dp[i-1][j],dp[i][j-1]}):std::max(dp[i-1][j],dp[i][j-1]);}
// The last cell is the result; predecessor states permit reconstruction.
return dp;}
