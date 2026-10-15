#include <vector>
#include <algorithm>
#include <functional>
#include <cmath>
std::vector<int> sort(std::vector<int> a){int n=(int)a.size();
 auto sift=[&](int root,int size){for(;;){int m=root,l=2*root+1,r=l+1;if(l<size&&a[l]>a[m])m=l;if(r<size&&a[r]>a[m])m=r;if(m==root)return;std::swap(a[root],a[m]);root=m;}};for(int i=n/2-1;i>=0;i--)sift(i,n);for(int end=n-1;end>0;end--){std::swap(a[0],a[end]);sift(0,end);}
 return a;
}
