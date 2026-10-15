#include <vector>
class Fenwick {std::vector<long long> t;public:explicit Fenwick(const std::vector<int>& v):t(v.size()+1){for(unsigned i=1;i<t.size();i++){t[i]+=v[i-1];unsigned p=i+(i&-i);if(p<t.size())t[p]+=t[i];}}
void add(unsigned index,int delta){for(unsigned i=index+1;i<t.size();i+=i&-i)t[i]+=delta;}
long long prefix(unsigned end)const{long long sum=0;
for(unsigned i=end;i>0;i-=i&-i)sum+=t[i];return sum;}
long long sum(unsigned left,unsigned right)const{return prefix(right)-prefix(left);}};
