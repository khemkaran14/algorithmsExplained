#include <vector>
#include <algorithm>
void quickHoare(std::vector<int>& a,int lo,int hi){if(lo>=hi)return;int pivot=a[lo+(hi-lo)/2],i=lo-1,j=hi+1;
while(true){do{i++;}while(a[i]<pivot);do{j--;}while(a[j]>pivot);if(i>=j)break;std::swap(a[i],a[j]);}
quickHoare(a,lo,j);quickHoare(a,j+1,hi);
}
