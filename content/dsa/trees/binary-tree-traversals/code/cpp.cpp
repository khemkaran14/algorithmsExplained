#include <vector>
#include <string>
void visit(const std::vector<int>& a,unsigned i,const std::string& order,std::vector<int>& out){if(i>=a.size())return;
if(order=="pre")out.push_back(a[i]);visit(a,2*i+1,order,out);if(order=="in")out.push_back(a[i]);visit(a,2*i+2,order,out);if(order=="post")out.push_back(a[i]);}
std::vector<int> traverse(const std::vector<int>& a,const std::string& order){if(order=="level")return a;std::vector<int> out;visit(a,0,order,out);
return out;}
