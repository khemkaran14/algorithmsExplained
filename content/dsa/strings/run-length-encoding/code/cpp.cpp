#include <string>
#include <vector>
#include <utility>
std::vector<std::pair<char,int>> encode(const std::string& text){std::vector<std::pair<char,int>>out;for(char ch:text){if(!out.empty()&&out.back().first==ch)out.back().second++;else out.push_back({ch,1});}
// Each pair is a run, not a count of every occurrence of a symbol.
return out;}
