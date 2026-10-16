#include <vector>
#include <numeric>
#include <algorithm>
class DSU {std::vector<int>p,size;public:explicit DSU(int n):p(n),size(n,1){std::iota(p.begin(),p.end(),0);}int find(int x){int r=x;while(r!=p[r])r=p[r];while(x!=r){int next=p[x];p[x]=r;x=next;}return r;}
bool unite(int a,int b){a=find(a);b=find(b);if(a==b)return false;if(size[a]<size[b])std::swap(a,b);p[b]=a;size[a]+=size[b];
return true;}};
#include <array>
#include <tuple>
std::tuple<std::vector<std::array<int,3>>,long long,int> kruskal(int n,std::vector<std::array<int,3>> edges){DSU dsu(n);std::sort(edges.begin(),edges.end(),[](auto a,auto b){return a[2]<b[2];});std::vector<std::array<int,3>>chosen;long long total=0;int components=n;for(auto e:edges)if(dsu.unite(e[0],e[1])){chosen.push_back(e);total+=e[2];components--;}return {chosen,total,components};}
