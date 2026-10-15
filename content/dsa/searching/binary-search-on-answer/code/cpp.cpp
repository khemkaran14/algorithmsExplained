#include <vector>
#include <numeric>
#include <algorithm>
long long capacity(const std::vector<int>& a,int groups){long long low=*std::max_element(a.begin(),a.end()),high=std::accumulate(a.begin(),a.end(),0LL);while(low<high){long long mid=low+(high-low)/2,load=0;int needed=1;
for(int weight:a){if(load+weight>mid){needed++;load=0;}load+=weight;}if(needed<=groups)high=mid;else low=mid+1;}
return low;}
