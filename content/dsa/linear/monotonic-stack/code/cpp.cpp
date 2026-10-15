#include <vector>
#include <optional>
std::vector<std::optional<int>> nextGreater(const std::vector<int>& a){std::vector<int> stack;std::vector<std::optional<int>> out(a.size());
for(int i=0;i<(int)a.size();i++){while(!stack.empty()&&a[stack.back()]<a[i]){out[stack.back()]=a[i];stack.pop_back();}
stack.push_back(i);}
return out;}
