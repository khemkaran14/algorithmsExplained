#include <string>
#include <vector>
std::vector<int> matches(const std::string& text,const std::string& pattern){std::vector<int>out;for(unsigned i=0;i+pattern.size()<=text.size();i++){unsigned j=0;
while(j<pattern.size()&&text[i+j]==pattern[j])j++;
if(j==pattern.size())out.push_back(i);}
return out;}
