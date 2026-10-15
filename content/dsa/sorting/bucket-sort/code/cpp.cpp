#include <vector>
#include <algorithm>
#include <functional>
#include <cmath>
std::vector<int> sort(std::vector<int> a){int n=(int)a.size();
 if(!n)return a;int low=*std::min_element(a.begin(),a.end()),high=*std::max_element(a.begin(),a.end()),k=(int)std::ceil(std::sqrt(n));std::vector<std::vector<int>> buckets(k);for(int x:a)buckets[std::min(k-1,(int)((long long)(x-low)*k/(high-low+1)))].push_back(x);int at=0;for(auto& b:buckets){for(int i=1;i<(int)b.size();i++){int key=b[i],j=i-1;while(j>=0&&b[j]>key){b[j+1]=b[j];j--;}b[j+1]=key;}for(int x:b)a[at++]=x;}
 return a;
}
