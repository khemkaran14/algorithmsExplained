#include <vector>
#include <array>
#include <algorithm>
#include <numeric>
std::vector<int> activities(const std::vector<std::array<int,2>>& intervals){std::vector<int>index(intervals.size()),selected;std::iota(index.begin(),index.end(),0);std::sort(index.begin(),index.end(),[&](int a,int b){return intervals[a][1]!=intervals[b][1]?intervals[a][1]<intervals[b][1]:intervals[a][0]!=intervals[b][0]?intervals[a][0]<intervals[b][0]:a<b;});int end=0;for(int i:index)if(intervals[i][0]>=end){selected.push_back(i);end=intervals[i][1];}return selected;}
double fractional(std::vector<std::array<int,2>>items,double capacity){std::stable_sort(items.begin(),items.end(),[](auto a,auto b){return 1LL*a[1]*b[0]>1LL*b[1]*a[0];});double value=0;for(auto [weight,v]:items){if(capacity<=0)break;double fraction=std::min(1.0,capacity/weight);value+=fraction*v;capacity=std::max(0.0,capacity-fraction*weight);}return value;} // Items are [weight,value].
