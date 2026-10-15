#include <vector>
#include <deque>
#include <stdexcept>
std::vector<int> windowMax(const std::vector<int>& a,int k){if(k<1||k>(int)a.size())throw std::invalid_argument("window");std::deque<int> queue;std::vector<int> out;
for(int i=0;i<(int)a.size();i++){while(!queue.empty()&&queue.front()<=i-k)queue.pop_front();while(!queue.empty()&&a[queue.back()]<=a[i])queue.pop_back();queue.push_back(i);if(i>=k-1)out.push_back(a[queue.front()]);}
return out;}
