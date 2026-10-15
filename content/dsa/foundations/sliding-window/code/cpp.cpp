#include <vector>
#include <limits>
long long maxWindow(const std::vector<int>& a,int k){long long sum=0,best=std::numeric_limits<long long>::lowest();
for(int i=0;i<(int)a.size();i++){sum+=a[i];if(i>=k)sum-=a[i-k];if(i>=k-1)best=std::max(best,sum);}
// Validated inputs satisfy 1 <= k <= a.size().
return best;}
