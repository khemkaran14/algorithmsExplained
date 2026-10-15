#include <list>
#include <unordered_map>
class LRU {unsigned capacity;std::list<int> order;std::unordered_map<int,std::list<int>::iterator> slots;
public:explicit LRU(unsigned capacity):capacity(capacity){}
bool access(int key){auto found=slots.find(key);if(found!=slots.end()){order.splice(order.end(),order,found->second);return true;}if(slots.size()==capacity){slots.erase(order.front());order.pop_front();}order.push_back(key);slots[key]=std::prev(order.end());
return false;}};
