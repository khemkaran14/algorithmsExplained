#include <vector>
class SumTree {int n=1;std::vector<long long> t;public:explicit SumTree(const std::vector<int>& values){while(n<(int)values.size())n*=2;t.resize(2*n);for(unsigned i=0;i<values.size();i++)t[n+i]=values[i];for(int i=n-1;i>0;i--)t[i]=t[2*i]+t[2*i+1];}
void add(int i,int delta){i+=n;t[i]+=delta;while(i>1){i/=2;t[i]=t[2*i]+t[2*i+1];}}
long long sum(int left,int right)const{long long out=0;for(left+=n,right+=n;left<right;left/=2,right/=2){
if(left%2)out+=t[left++];if(right%2)out+=t[--right];}
return out;}};
