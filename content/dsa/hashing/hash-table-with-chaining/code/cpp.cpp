#include <vector>
#include <algorithm>
class ChainedSet {std::vector<std::vector<int>> b;int index(int k)const{return (k%(int)b.size()+b.size())%b.size();}
public:explicit ChainedSet(int m=5):b(m){}bool has(int k)const{const auto& c=b[index(k)];return std::find(c.begin(),c.end(),k)!=c.end();}
void add(int k){if(!has(k))b[index(k)].push_back(k);}
void erase(int k){auto& c=b[index(k)];auto i=std::find(c.begin(),c.end(),k);if(i!=c.end())c.erase(i);}};
