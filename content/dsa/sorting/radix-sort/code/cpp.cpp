#include <vector>
#include <algorithm>
#include <functional>
#include <cmath>
std::vector<int> sort(std::vector<int> a){int n=(int)a.size();
 if(!n)return a;int low=*std::min_element(a.begin(),a.end());for(int& x:a)x-=low;int max=*std::max_element(a.begin(),a.end());for(long long exp=1;max/exp>0;exp*=10){std::vector<int> count(10),out(n);for(int x:a)count[x/exp%10]++;for(int i=1;i<10;i++)count[i]+=count[i-1];for(int i=n-1;i>=0;i--)out[--count[a[i]/exp%10]]=a[i];a=out;}for(int& x:a)x+=low;
 return a;
}
