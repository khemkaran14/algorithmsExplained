#include <vector>
#include <algorithm>
#include <functional>
#include <cmath>
std::vector<int> sort(std::vector<int> a){int n=(int)a.size();
 for(int gap=n/2;gap>0;gap/=2)for(int i=gap;i<n;i++){int key=a[i],j=i;while(j>=gap&&a[j-gap]>key){a[j]=a[j-gap];j-=gap;}a[j]=key;}
 return a;
}
