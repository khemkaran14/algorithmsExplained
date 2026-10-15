#include <vector>
#include <algorithm>
#include <functional>
#include <cmath>
std::vector<int> sort(std::vector<int> a){int n=(int)a.size();
 for(int i=0;i<n-1;i++){int m=i;for(int j=i+1;j<n;j++)if(a[j]<a[m])m=j;std::swap(a[i],a[m]);}
 return a;
}
