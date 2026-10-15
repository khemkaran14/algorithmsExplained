#include <string>
#include <vector>
#include <map>
#include <functional>
std::map<std::string,std::vector<int>> compare(const std::vector<int>& input,const std::map<std::string,std::function<std::vector<int>(std::vector<int>)>>& algorithms){std::map<std::string,std::vector<int>> out;
for(const auto& [name,sort]:algorithms)out[name]=sort(input);
return out;}
