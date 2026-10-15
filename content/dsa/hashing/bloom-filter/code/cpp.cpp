#include <vector>
#include <functional>
class Bloom {std::vector<bool> bits;std::function<std::vector<int>(int)> positions;
public:Bloom(int m,std::function<std::vector<int>(int)> p):bits(m),positions(p){}void add(int key){for(int i:positions(key))bits[i]=true;}
bool maybe(int key)const{for(int i:positions(key))if(!bits[i])return false;
return true;}}; // The same stable, bounded hash positions are used for add and query.
