#include <vector>
#include <algorithm>
#include <functional>
#include <cmath>
std::vector<int> sort(std::vector<int> a){int n=(int)a.size();
 if(!n)return a;int low=*std::min_element(a.begin(),a.end()),high=*std::max_element(a.begin(),a.end());std::vector<int> count(high-low+1);for(int x:a)count[x-low]++;int at=0;for(int i=0;i<(int)count.size();i++)while(count[i]-->0)a[at++]=i+low;
 return a;
}
