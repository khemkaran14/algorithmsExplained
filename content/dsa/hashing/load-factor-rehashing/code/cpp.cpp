#include <vector>
#include <algorithm>
std::vector<std::vector<int>> growingSet(const std::vector<int>& keys){int m=3,size=0;std::vector<std::vector<int>> b(m);auto index=[&](int k){return (k%m+m)%m;};for(int key:keys){auto& chain=b[index(key)];if(std::find(chain.begin(),chain.end(),key)!=chain.end())continue;
if((size+1.0)/m>.75){auto old=b;m=2*m+1;b.assign(m,{});for(const auto& c:old)for(int v:c)b[index(v)].push_back(v);}
b[index(key)].push_back(key);size++;}
return b;}
