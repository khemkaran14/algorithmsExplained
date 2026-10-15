#include <vector>
std::vector<int> pair(const std::vector<int>& a,long long target){int left=0,right=(int)a.size()-1;
while(left<right){long long sum=(long long)a[left]+a[right];if(sum==target)return {left,right};
if(sum<target)left++;
else right--;}
return {};}
