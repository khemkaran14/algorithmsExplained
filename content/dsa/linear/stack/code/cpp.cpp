#include <stack>
#include <vector>
void demo(const std::vector<int>& values){std::stack<int> s; for(int v:values)s.push(v);
  while(!s.empty()){
    s.pop(); }
}
