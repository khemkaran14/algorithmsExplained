#include <vector>
#include <utility>
std::vector<std::pair<int,int>> stableSort(const std::vector<int>& keys){std::vector<std::pair<int,int>> a;for(int i=0;i<(int)keys.size();i++)a.push_back({keys[i],i});
for(int i=1;i<(int)a.size();i++){auto key=a[i];int j=i-1;
while(j>=0&&a[j].first>key.first){a[j+1]=a[j];j--;}a[j+1]=key;}
return a;}
