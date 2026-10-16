#include <vector>
#include <numeric>
#include <algorithm>
class DSU {std::vector<int>p,size;public:explicit DSU(int n):p(n),size(n,1){std::iota(p.begin(),p.end(),0);}int find(int x){int r=x;while(r!=p[r])r=p[r];while(x!=r){int next=p[x];p[x]=r;x=next;}return r;}
bool unite(int a,int b){a=find(a);b=find(b);if(a==b)return false;if(size[a]<size[b])std::swap(a,b);p[b]=a;size[a]+=size[b];
return true;}};
