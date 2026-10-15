#include <vector>
#include <array>
#include <cmath>
std::vector<std::array<long long,4>> levels(int a,int b,int k,int n){std::vector<std::array<long long,4>> out;long long nodes=1;int level=0;
for(int size=n;size>=1;size/=b,nodes*=a,level++){out.push_back({level,nodes,size,nodes*std::llround(std::pow(size,k))});if(size==1)break;}
return out;}
