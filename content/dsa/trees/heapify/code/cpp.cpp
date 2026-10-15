#include <vector>
#include <algorithm>
#include <stdexcept>
class MaxHeap {std::vector<int>a;void sink(unsigned i){while(2*i+1<a.size()){unsigned c=2*i+1;if(c+1<a.size()&&a[c+1]>a[c])c++;if(a[i]>=a[c])break;std::swap(a[i],a[c]);i=c;}}
public:explicit MaxHeap(const std::vector<int>& input={}):a(input){for(int i=int(a.size())/2-1;i>=0;i--)sink(i);}void push(int k){a.push_back(k);unsigned i=a.size()-1;while(i>0){unsigned p=(i-1)/2;if(a[p]>=a[i])break;std::swap(a[p],a[i]);i=p;}}
int pop(){if(a.empty())throw std::out_of_range("empty");int out=a[0],last=a.back();a.pop_back();if(!a.empty()){a[0]=last;sink(0);}return out;}};
