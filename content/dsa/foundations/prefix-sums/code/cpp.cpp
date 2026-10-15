#include <vector>
long long rangeSum(const std::vector<int>& a,int left,int right){std::vector<long long> prefix(a.size()+1);
for(int i=0;i<(int)a.size();i++){
prefix[i+1]=prefix[i]+a[i];
}
return prefix[right]-prefix[left];}
