#include <vector>
#include <algorithm>
#include <functional>
#include <cmath>
std::vector<int> sort(std::vector<int> a){int n=(int)a.size();
 std::function<void(int,int)> quick=[&](int lo,int hi){if(lo>=hi)return;int pivot=a[hi],i=lo;for(int j=lo;j<hi;j++)if(a[j]<=pivot){std::swap(a[i],a[j]);i++;}std::swap(a[i],a[hi]);quick(lo,i-1);quick(i+1,hi);};quick(0,n-1);
 return a;
}
